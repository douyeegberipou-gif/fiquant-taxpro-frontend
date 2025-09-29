from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from enum import Enum
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
import jwt
import bcrypt
import re
import secrets
from passlib.context import CryptContext
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

# Security imports
from security.encryption import encrypt_pii_data, decrypt_pii_data, mask_sensitive_data, field_encryption
from security.middleware import SecurityHeadersMiddleware, RateLimitMiddleware, SecurityAuditMiddleware

# ============================
# ENUMS
# ============================

class MessageChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"

class MessageStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"

class SendStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"
    BOUNCED = "bounced"
    FAILED = "failed"

class AutomationTrigger(str, Enum):
    TAX_FILING_REMINDER = "tax_filing_reminder"
    PAYMENT_DEADLINE = "payment_deadline"
    COMPLIANCE_ALERT = "compliance_alert"
    TRIAL_EXPIRING = "trial_expiring"
    SIGNUP = "signup"
    BULK_LIMIT_REACHED = "bulk_limit_reached"

class UserTier(str, Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"
    ENTERPRISE = "enterprise"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    TRIAL = "trial"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class TrialType(str, Enum):
    DEMO = "demo"
    FULL_TRIAL = "full_trial"

class TrialStatus(str, Enum):
    NEVER_USED = "never_used"
    DEMO_USED = "demo_used"
    TRIAL_ACTIVE = "trial_active"
    TRIAL_EXPIRED = "trial_expired"

class AdType(str, Enum):
    BANNER = "banner"
    NATIVE = "native"
    INTERSTITIAL = "interstitial"
    REWARDED = "rewarded"

class AdPlacement(str, Enum):
    TOP_BANNER = "top_banner"
    BOTTOM_BANNER = "bottom_banner"
    INFO_PAGE_NATIVE = "info_page_native"
    POST_CALCULATION = "post_calculation"
    REWARDED_UNLOCK = "rewarded_unlock"

# ============================
# USER AUTHENTICATION & PROFILE MODELS
# ============================

class UserRegistration(BaseModel):
    email: EmailStr
    phone: Optional[str] = Field(None, description="Phone number with country code")
    password: str = Field(min_length=8, description="Password (minimum 8 characters)")
    full_name: str = Field(min_length=2, description="Full name")
    agree_terms: bool = Field(description="User must agree to terms and conditions")

class UserLogin(BaseModel):
    email_or_phone: str = Field(description="Email address or phone number")
    password: str = Field(description="Password")

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    phone: Optional[str] = None
    full_name: str
    
    # Verification Status
    email_verified: bool = Field(default=False)
    phone_verified: bool = Field(default=False)
    account_status: str = Field(default="pending", description="pending, verified, active, suspended")
    verification_token: Optional[str] = Field(default=None, description="Email verification token")
    phone_verification_code: Optional[str] = Field(default=None, description="SMS verification code")
    verification_expires: Optional[datetime] = Field(default=None, description="Verification expiry time")
    
    # Profile Information
    account_type: str = Field(default="individual", description="individual or business")
    employment_status: str = Field(default="salaried", description="salaried, self-employed, contractor, investor, multinational, sme")
    
    # Income Streams (for profile setup, not auto-fill)
    income_streams: List[str] = Field(default_factory=list, description="salary, business_revenue, investment, property, digital")
    
    # Default Reliefs & Deductions (for reference, not auto-fill)
    default_reliefs: dict = Field(default_factory=dict, description="User's typical reliefs")
    
    # Tax Information
    tin: Optional[str] = Field(None, description="Tax Identification Number")
    company_name: Optional[str] = Field(None, description="Company name for business accounts")
    business_type: Optional[str] = Field(None, description="Type of business")
    
    # Account Settings
    account_tier: UserTier = Field(default=UserTier.FREE, description="User subscription tier")
    permissions: List[str] = Field(default_factory=lambda: ["basic_calculator"], description="Account permissions")
    
    # Admin fields
    admin_role: Optional[str] = Field(None, description="super_admin, user_manager, analytics_viewer, system_monitor")
    admin_enabled: bool = Field(default=False)
    two_factor_enabled: bool = Field(default=False)
    two_factor_secret: Optional[str] = Field(None)
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    
    # Settings
    email_notifications: bool = Field(default=True)
    sms_notifications: bool = Field(default=False)

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user_id: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    account_type: str
    employment_status: str
    account_tier: str
    permissions: List[str]
    created_at: datetime
    last_login: Optional[datetime]
    email_verified: bool
    phone_verified: bool
    account_status: str
    # Admin fields
    admin_role: Optional[str] = None
    admin_enabled: bool = False

class EmailVerification(BaseModel):
    email: EmailStr

class PhoneVerification(BaseModel):
    phone: str

class VerifyCode(BaseModel):
    email: EmailStr
    verification_code: str
    verification_type: str = Field(description="email or phone")

class VerificationCode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    verification_type: str  # "email" or "phone"
    verification_token: Optional[str] = None  # For email verification
    verification_code: Optional[str] = None   # For phone verification
    verification_code_hash: Optional[str] = None
    expires_at: datetime
    verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Admin Models
class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_user_id: str
    admin_email: str
    action: str  # "user_created", "user_suspended", "role_assigned", "bulk_operation", etc.
    target_type: str  # "user", "system", "report", etc.
    target_id: Optional[str] = None
    details: dict = Field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    two_factor_verified: bool = False
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    active: bool = True

class SystemAnalytics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # YYYY-MM-DD format
    metric_type: str  # "daily_users", "calculator_usage", "registrations", etc.
    metric_data: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============================
# NOTIFICATION MODELS
# ============================

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID who receives the notification")
    title: str = Field(description="Notification title")
    message: str = Field(description="Notification message")
    notification_type: str = Field(default="info", description="info, success, warning, error")
    read: bool = Field(default=False, description="Whether notification has been read")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = Field(None, description="When notification expires")

class NotificationResponse(BaseModel):
    notifications: List[Notification]
    unread_count: int

# ============================
# HERO CAROUSEL MODELS
# ============================

class CarouselSlide(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(description="Main headline of the slide")
    subtitle: str = Field(description="Supporting text/description")
    order_index: int = Field(description="Display order (0-based)")
    active: bool = Field(default=True, description="Whether slide is active")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarouselSlideCreate(BaseModel):
    title: str = Field(description="Main headline of the slide")
    subtitle: str = Field(description="Supporting text/description")
    order_index: int = Field(description="Display order (0-based)")
    active: bool = Field(default=True, description="Whether slide is active")

class CarouselSlideUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    order_index: Optional[int] = None
    active: Optional[bool] = None

class CarouselResponse(BaseModel):
    slides: List[CarouselSlide]
    total_slides: int

class CarouselSettings(BaseModel):
    id: str = Field(default="carousel_settings", description="Settings ID (always 'carousel_settings')")
    transition_delay: int = Field(default=5, description="Time delay between transitions in seconds")
    auto_rotation: bool = Field(default=True, description="Whether carousel auto-rotates")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarouselSettingsUpdate(BaseModel):
    transition_delay: Optional[int] = Field(None, ge=1, le=30, description="Time delay between transitions (1-30 seconds)")
    auto_rotation: Optional[bool] = None

class CarouselSettingsResponse(BaseModel):
    settings: CarouselSettings

# ============================
# SUBSCRIPTION & TIER MODELS  
# ============================

class UserSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    tier: UserTier = Field(default=UserTier.FREE, description="Current subscription tier")
    status: SubscriptionStatus = Field(default=SubscriptionStatus.ACTIVE, description="Subscription status")
    
    # Subscription details
    monthly_price: int = Field(default=0, description="Monthly price in Naira")
    annual_price: int = Field(default=0, description="Annual price in Naira")
    is_annual: bool = Field(default=False, description="Annual billing")
    
    # Trial and expiry
    trial_ends_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    # Trial state integration
    is_trial_active: bool = Field(default=False, description="Whether currently in trial period")
    original_tier: Optional[UserTier] = Field(None, description="Original tier before trial")
    
    # Usage tracking
    bulk_paye_runs_this_month: int = Field(default=0, description="Number of bulk PAYE runs this month")
    rewarded_ads_this_week: int = Field(default=0, description="Rewarded ads used this week")
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TierFeatures(BaseModel):
    # PAYE & Bulk PAYE
    single_paye_unlimited: bool = Field(default=True, description="Unlimited single PAYE calculations")
    bulk_paye_enabled: bool = Field(default=False, description="Bulk PAYE access")
    bulk_paye_max_staff: int = Field(default=0, description="Max staff per bulk run")
    bulk_paye_runs_per_month: Optional[int] = Field(None, description="Monthly bulk runs limit (None = unlimited)")
    
    # Other calculators
    cit_enabled: bool = Field(default=False, description="CIT calculator access")
    vat_enabled: bool = Field(default=False, description="VAT calculator access") 
    cgt_enabled: bool = Field(default=False, description="CGT calculator access")
    
    # Export & History
    pdf_export: bool = Field(default=False, description="PDF export/download")
    calculation_history: bool = Field(default=False, description="Save calculation history")
    
    # Notifications & Support
    email_notifications: bool = Field(default=False, description="Email notifications")
    priority_support: bool = Field(default=False, description="Priority support")
    
    # Ads & Monetization
    ads_enabled: bool = Field(default=True, description="Show ads")
    rewarded_ads: bool = Field(default=False, description="Rewarded ads available")
    
    # Advanced features
    advanced_analytics: bool = Field(default=False, description="Advanced analytics dashboard")
    api_access: bool = Field(default=False, description="API export access")
    compliance_assistance: bool = Field(default=False, description="Compliance assistance")

class SubscriptionUpdate(BaseModel):
    tier: Optional[UserTier] = None
    is_annual: Optional[bool] = None
    
class SubscriptionResponse(BaseModel):
    subscription: UserSubscription
    features: TierFeatures
    
class TierPricing(BaseModel):
    tier: UserTier
    name: str
    monthly_price: int
    annual_price: int
    annual_discount_months: int = Field(default=2, description="Free months on annual plan")
    features: TierFeatures
    popular: bool = Field(default=False)
    recommended_for: str = Field(description="Who this tier is recommended for")

# ============================
# TRIAL SYSTEM MODELS
# ============================

class TrialTracking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    email: str = Field(description="User email for tracking")
    phone: Optional[str] = Field(None, description="User phone for tracking")
    device_fingerprint: Optional[str] = Field(None, description="Device fingerprint for abuse prevention")
    
    # Trial state
    trial_status: TrialStatus = Field(default=TrialStatus.NEVER_USED, description="Current trial status")
    demo_used: bool = Field(default=False, description="Whether demo mode was used")
    demo_used_at: Optional[datetime] = None
    
    # Full trial tracking
    trial_tier: Optional[UserTier] = Field(None, description="Which tier trial (PRO/PREMIUM)")
    trial_started_at: Optional[datetime] = None
    trial_ends_at: Optional[datetime] = None
    
    # Abuse prevention
    ip_addresses: List[str] = Field(default_factory=list, description="IP addresses used")
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrialStartRequest(BaseModel):
    trial_type: TrialType = Field(description="Type of trial to start")
    trial_tier: Optional[UserTier] = Field(None, description="For full trials: PRO or PREMIUM")
    device_fingerprint: Optional[str] = Field(None, description="Browser/device fingerprint")

class TrialStatus_Response(BaseModel):
    trial_available: bool = Field(description="Whether user can start a trial")
    demo_available: bool = Field(description="Whether demo mode is available")
    current_trial: Optional[TrialTracking] = None
    days_remaining: Optional[int] = Field(None, description="Days remaining in active trial")
    trial_features: Optional[TierFeatures] = None
    
class DemoCalculation(BaseModel):
    calculation_type: str = Field(description="Type of calculation performed in demo")
    input_data: dict = Field(description="Calculation inputs")
    result_data: dict = Field(description="Calculation results")  
    performed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============================
# ADS & MONETIZATION MODELS
# ============================

class AdImpression(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User who viewed the ad")
    ad_type: AdType = Field(description="Type of ad")
    ad_placement: AdPlacement = Field(description="Where the ad was shown")
    
    # Ad details
    ad_network: str = Field(default="mock", description="Ad network (AdMob, AdSense, etc)")
    ad_unit_id: str = Field(description="Ad unit identifier")
    revenue: Optional[float] = Field(None, description="Revenue from this impression")
    
    # Interaction
    clicked: bool = Field(default=False, description="Whether ad was clicked")
    watched_to_completion: Optional[bool] = Field(None, description="For video ads")
    
    # Metadata
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None

class AdFrequencyTracking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    
    # Weekly tracking (resets every Monday)
    week_start: datetime = Field(description="Start of current tracking week")
    rewarded_ads_this_week: int = Field(default=0, description="Rewarded ads watched this week")
    
    # Calculation-based tracking
    calculations_since_interstitial: int = Field(default=0, description="Calculations since last interstitial")
    last_interstitial_at: Optional[datetime] = None
    
    # Rewards earned
    extra_bulk_runs: int = Field(default=0, description="Extra bulk runs earned via rewarded ads")
    extra_cit_calcs: int = Field(default=0, description="Extra CIT calculations earned via rewarded ads")
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RewardedAdRequest(BaseModel):
    reward_type: str = Field(description="bulk_run or cit_calc")
    ad_placement: AdPlacement = AdPlacement.REWARDED_UNLOCK

class RewardedAdCompletion(BaseModel):
    user_id: str
    reward_type: str  # "bulk_run" or "cit_calc"
    ad_network: str = "mock"
    ad_unit_id: str
    reward_granted: bool = Field(default=True)

class AdConfig(BaseModel):
    # Frequency caps
    max_rewarded_ads_per_week: int = Field(default=2)
    interstitial_frequency: int = Field(default=10, description="Show interstitial every N calculations")
    
    # Ad units (these would be real ad unit IDs in production)
    top_banner_unit: str = Field(default="ca-app-pub-test/top-banner")
    bottom_banner_unit: str = Field(default="ca-app-pub-test/bottom-banner")
    interstitial_unit: str = Field(default="ca-app-pub-test/interstitial")
    rewarded_unit: str = Field(default="ca-app-pub-test/rewarded")
    
    # Native ad settings
    native_ad_frequency: int = Field(default=3, description="Show native ad every N paragraphs")

class AdStatusResponse(BaseModel):
    ads_enabled: bool = Field(description="Whether ads should be shown for this user")
    can_show_rewarded: bool = Field(description="Whether rewarded ads are available")
    rewarded_ads_remaining: int = Field(description="Rewarded ads remaining this week")
    calculations_until_interstitial: int = Field(description="Calculations until next interstitial")
    ad_config: AdConfig
    extra_runs_available: int = Field(description="Extra bulk runs available from rewards")
    extra_cit_available: int = Field(description="Extra CIT calcs available from rewards")

# ============================
# TAX CALCULATION HISTORY MODELS
# ============================

class TaxCalculationHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User who performed the calculation")
    calculation_type: str = Field(description="paye, cit, bulk_paye")
    
    # Calculation Data
    input_data: dict = Field(description="Original input data")
    result_data: dict = Field(description="Calculation results")
    
    # Metadata
    calculation_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    # For bulk calculations
    employee_count: Optional[int] = Field(default=1, description="Number of employees calculated")
    
class CalculationSummary(BaseModel):
    id: str
    calculation_type: str
    calculation_date: datetime
    employee_count: int
    total_tax: Optional[float] = None
    notes: Optional[str] = None

# ============================
# MONETIZATION ANALYTICS MODELS
# ============================

class DailyUserActivity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str = Field(description="Date in YYYY-MM-DD format")
    user_id: str = Field(description="User ID")
    activities: List[str] = Field(default=[], description="List of activities performed")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConversionFunnelData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str = Field(description="Date in YYYY-MM-DD format")
    total_registrations: int = Field(default=0)
    demo_activations: int = Field(default=0)
    trial_activations: int = Field(default=0)
    trial_conversions: int = Field(default=0)
    total_paid_users: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdRevenueData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str = Field(description="Date in YYYY-MM-DD format")
    banner_impressions: int = Field(default=0)
    native_impressions: int = Field(default=0)
    interstitial_impressions: int = Field(default=0)
    rewarded_impressions: int = Field(default=0)
    estimated_revenue: float = Field(default=0.0, description="Estimated revenue in USD")
    rpm: float = Field(default=0.0, description="Revenue per mille")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    event_type: str = Field(description="upgrade, downgrade, cancel, trial_start, trial_end")
    from_tier: Optional[UserTier] = None
    to_tier: Optional[UserTier] = None
    reason: Optional[str] = Field(description="Reason for change")
    admin_initiated: bool = Field(default=False, description="Was this change made by admin")
    admin_user_id: Optional[str] = Field(description="Admin who made the change")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TierConfiguration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tier: UserTier
    name: str
    monthly_price: int = Field(description="Price in cents/kobo")
    annual_price: int = Field(description="Annual price in cents/kobo") 
    staff_limit: int = Field(description="Max staff for bulk PAYE")
    features: TierFeatures
    active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ManualSubscriptionChange(BaseModel):
    user_id: str = Field(description="Target user ID")
    action: str = Field(description="upgrade, trial, enterprise")
    tier: UserTier = Field(description="New tier")
    duration_months: Optional[int] = Field(description="Duration in months, None for permanent")
    reason: str = Field(description="Reason for manual change")

# ============================
# ADD-ON MONETIZATION MODELS
# ============================

class AddOnType(str, Enum):
    EXTRA_EMPLOYEE_MONTHLY = "extra_employee_monthly"
    EXTRA_EMPLOYEE_PER_RUN = "extra_employee_per_run"
    PDF_PRINT = "pdf_print"
    COMPLIANCE_REVIEW = "compliance_review"

class AddOnPurchase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    addon_type: AddOnType = Field(description="Type of add-on purchased")
    quantity: int = Field(default=1, description="Number of units purchased")
    unit_price: float = Field(description="Price per unit in Naira")
    total_amount: float = Field(description="Total amount paid")
    description: str = Field(description="Description of purchase")
    auto_charged: bool = Field(default=False, description="Was this auto-charged?")
    bulk_run_id: Optional[str] = Field(description="Associated bulk run ID if applicable")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = Field(description="Expiration date for time-based add-ons")

class BulkRunRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    run_type: str = Field(description="paye, payment, etc.")
    employee_count: int = Field(description="Number of employees/items processed")
    excess_employees: int = Field(default=0, description="Employees beyond tier limit")
    tier_limit: int = Field(description="User's tier employee limit")
    auto_charge_applied: bool = Field(default=False, description="Was excess employee charge applied")
    charge_amount: float = Field(default=0.0, description="Amount charged for excess")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplianceReviewRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    review_type: str = Field(description="Type of compliance review requested")
    description: str = Field(description="Details of what needs review")
    is_expedited: bool = Field(default=False, description="Is this an expedited review")
    status: str = Field(default="pending", description="pending, in_progress, completed")
    amount_paid: float = Field(description="Amount paid for review")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = Field(description="When review was completed")

# ============================
# MESSAGING SYSTEM MODELS
# ============================

class MessageTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    channel: MessageChannel
    subject_template: Optional[str] = None  # For email
    body_template: str
    merge_tags: List[str] = []
    need_approval: bool = False
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserSegment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    filters_json: dict
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    estimated_count: int = 0

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_name: str
    channel: MessageChannel
    template_id: Optional[str] = None
    subject_template: Optional[str] = None
    body_template: str
    segment_id: Optional[str] = None
    target_user_ids: List[str] = []
    scheduled_at: Optional[datetime] = None
    status: MessageStatus = MessageStatus.DRAFT
    need_approval: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sent_count: int = 0
    delivered_count: int = 0
    opened_count: int = 0
    clicked_count: int = 0

class SendLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message_id: str
    user_id: str
    channel: MessageChannel
    recipient: str  # email or phone
    subject: Optional[str] = None
    body: str
    status: SendStatus = SendStatus.PENDING
    provider_response: Optional[dict] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    failed_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ComplianceReminder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    due_date: datetime
    reminder_days: List[int] = [7, 3, 1]  # Days before due date to send reminders
    applicable_tiers: List[UserTier] = [UserTier.PREMIUM, UserTier.ENTERPRISE]
    message_template_id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageAutomation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    trigger: AutomationTrigger
    conditions: dict = {}
    message_template_id: str
    delay_minutes: int = 0
    is_active: bool = True
    created_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserAddOnBalance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = Field(description="User ID")
    addon_type: AddOnType = Field(description="Type of add-on balance")
    balance: int = Field(default=0, description="Remaining balance/credits")
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Authentication configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-key-change-in-production-2024-fiquant')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Security
security = HTTPBearer()

# Password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================
# AUTHENTICATION UTILITIES
# ============================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# ============================
# ADMIN UTILITY FUNCTIONS
# ============================

def log_admin_action(admin_user_id: str, admin_email: str, action: str, target_type: str, 
                    target_id: str = None, details: dict = None, ip_address: str = None, 
                    user_agent: str = None):
    """Log admin actions for audit trail"""
    try:
        audit_log = AuditLog(
            admin_user_id=admin_user_id,
            admin_email=admin_email,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Insert into database (async operation will be handled in endpoints)
        return audit_log
    except Exception as e:
        print(f"Failed to create audit log: {e}")
        return None

def is_admin_user(user_data: dict) -> bool:
    """Check if user has admin privileges"""
    return user_data.get("admin_enabled", False) and user_data.get("admin_role") is not None

def has_admin_permission(user_role: str, required_permission: str) -> bool:
    """Check if admin role has specific permission"""
    role_permissions = {
        "super_admin": ["all"],
        "user_manager": ["view_users", "edit_users", "suspend_users", "view_analytics"],
        "analytics_viewer": ["view_analytics", "export_reports"],
        "system_monitor": ["view_system", "view_logs", "view_analytics"]
    }
    
    if user_role == "super_admin":
        return True
    
    return required_permission in role_permissions.get(user_role, [])

async def get_admin_middleware(request: Request):
    """Middleware to verify admin access"""
    try:
        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin access token required"
            )
        
        token = auth_header.split(" ")[1]
        
        # Verify JWT token
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid admin token"
                )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin token"
            )
        
        # Get user data and verify admin status
        user_data = await db.users.find_one({"id": user_id})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin user not found"
            )
        
        if not is_admin_user(user_data):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Admin middleware error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin authentication error"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserProfile:
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user_data = await db.users.find_one({"id": user_id})
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return UserProfile(**user_data)

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone: str) -> bool:
    """Validate phone number format (basic validation)"""
    if not phone:
        return True  # Phone is optional
    # Basic phone validation - starts with + and has 10-15 digits
    pattern = r'^\+?[1-9]\d{9,14}$'
    return re.match(pattern, phone.replace(' ', '').replace('-', '')) is not None

async def check_user_permissions(user: UserProfile, required_permission: str) -> bool:
    """Check if user has required permission"""
    return required_permission in user.permissions

def require_permission(permission: str):
    """Decorator to require specific permission"""
    async def permission_checker(current_user: UserProfile = Depends(get_current_user)):
        if not await check_user_permissions(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        return current_user
    return permission_checker

def generate_verification_token() -> str:
    """Generate secure verification token"""
    return secrets.token_urlsafe(32)

def generate_verification_code() -> str:
    """Generate 6-digit verification code for SMS"""
    return str(random.randint(100000, 999999))

def send_verification_email(email: str, verification_token: str, full_name: str):
    """Send verification email (simplified - in production use proper email service)"""
    try:
        # For development, get the frontend URL from environment
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        verification_link = f"{frontend_url}/verify-email?token={verification_token}&email={email}"
        
        print(f"\n🔥 IMPORTANT: EMAIL VERIFICATION REQUIRED 🔥")
        print(f"📧 For user: {full_name} ({email})")
        print(f"🔗 CLICK THIS LINK TO VERIFY: {verification_link}")
        print(f"📱 Or manually copy this verification token: {verification_token}")
        print(f"⏰ Link expires in 24 hours")
        print(f"=" * 80)
        
        # TODO: Implement actual email sending using service like SendGrid
        # For now, prominently display the verification link
        return True
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        return False

def send_verification_sms(phone: str, verification_code: str):
    """Send verification SMS (simplified - in production use proper SMS service)"""
    try:
        print(f"\n📱 SMS VERIFICATION CODE FOR {phone}:")
        print(f"🔢 CODE: {verification_code}")
        print(f"💬 MESSAGE: 'Your Fiquant TaxPro verification code is {verification_code}'")
        print(f"⏰ Code expires in 10 minutes")
        print(f"Note: In production, this would be sent via SMS service like Twilio")
        print(f"=" * 60)
        
        # TODO: Implement actual SMS sending using service like Twilio
        return True
    except Exception as e:
        print(f"Failed to send verification SMS: {e}")
        return False

async def is_account_verified(user: UserProfile) -> bool:
    """Check if user account is properly verified"""
    if user.phone:
        # If user has phone, both email and phone must be verified
        return user.email_verified and user.phone_verified
    else:
        # If no phone, just email needs verification
        return user.email_verified

def require_verified_account():
    """Decorator to require verified account"""
    async def verified_account_checker(current_user: UserProfile = Depends(get_current_user)):
        if not await is_account_verified(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account verification required. Please verify your email and phone number."
            )
        return current_user
    return verified_account_checker

# ============================

# Create the main app without a prefix
app = FastAPI(title="Fiquant TaxPro API", description="Nigerian Tax Calculator API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============================
# AUTHENTICATION ENDPOINTS
# ============================

@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserRegistration):
    """Register new user with email/phone verification"""
    # Validate input
    if not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    if user_data.phone and not validate_phone(user_data.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    if not user_data.agree_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must agree to terms and conditions"
        )
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if user_data.phone:
        existing_phone = await db.users.find_one({"phone": user_data.phone})
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    # Generate verification tokens
    verification_token = generate_verification_token()
    verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)  # 24 hour expiry
    
    phone_verification_code = None
    if user_data.phone:
        phone_verification_code = generate_verification_code()
    
    # Create user profile
    user_profile = UserProfile(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        account_type="individual",
        employment_status="salaried",
        account_tier="free",
        permissions=["basic_calculator"],
        email_verified=False,
        phone_verified=False if user_data.phone else True,  # No phone = phone verified
        account_status="pending",
        verification_token=verification_token,
        phone_verification_code=phone_verification_code,
        verification_expires=verification_expires
    )
    
    # Hash password and store user
    hashed_password = hash_password(user_data.password)
    user_doc = user_profile.dict()
    user_doc["password_hash"] = hashed_password
    
    # Convert datetime fields to ISO strings for MongoDB
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    user_doc["updated_at"] = user_doc["updated_at"].isoformat()
    if user_doc["last_login"]:
        user_doc["last_login"] = user_doc["last_login"].isoformat()
    user_doc["verification_expires"] = user_doc["verification_expires"].isoformat()
    
    # Encrypt sensitive PII data before storing
    user_doc = encrypt_pii_data(user_doc)
    
    await db.users.insert_one(user_doc)
    
    # Create welcome notification
    welcome_notification = Notification(
        user_id=user_profile.id,
        title="Welcome to Fiquant TaxPro! 🎉",
        message=f"Hi {user_profile.full_name}! Welcome to Nigeria's premier tax calculation platform. Complete your email verification to get started with accurate PAYE, CIT, VAT, and CGT calculations.",
        notification_type="success"
    )
    
    welcome_doc = welcome_notification.dict()
    welcome_doc["created_at"] = welcome_doc["created_at"].isoformat()
    if welcome_doc["expires_at"]:
        welcome_doc["expires_at"] = welcome_doc["expires_at"].isoformat()
    
    await db.notifications.insert_one(welcome_doc)
    
    # Track registration for analytics
    await update_conversion_funnel("registration")
    
    # Send verification email
    email_sent = send_verification_email(user_data.email, verification_token, user_data.full_name)
    if not email_sent:
        print(f"Warning: Failed to send verification email to {user_data.email}")
    
    # Send verification SMS if phone provided
    if user_data.phone and phone_verification_code:
        sms_sent = send_verification_sms(user_data.phone, phone_verification_code)
        if not sms_sent:
            print(f"Warning: Failed to send verification SMS to {user_data.phone}")
    
    return UserResponse(
        id=user_profile.id,
        email=user_profile.email,
        full_name=user_profile.full_name,
        account_type=user_profile.account_type,
        employment_status=user_profile.employment_status,
        account_tier=user_profile.account_tier,
        permissions=user_profile.permissions,
        created_at=user_profile.created_at,
        last_login=user_profile.last_login,
        email_verified=user_profile.email_verified,
        phone_verified=user_profile.phone_verified,
        account_status=user_profile.account_status,
        admin_role=user_profile.admin_role,
        admin_enabled=user_profile.admin_enabled
    )

@api_router.post("/auth/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """Login user and return JWT token (requires verified account)"""
    # Find user by email or phone
    query = {}
    if validate_email(login_data.email_or_phone):
        query["email"] = login_data.email_or_phone
    else:
        query["phone"] = login_data.email_or_phone
    
    user_data = await db.users.find_one(query)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Special access for specific admin user - bypass password verification and account verification
    special_admin_email = "douyeegberipou@yahoo.com"
    is_special_admin = user_data.get("email", "").lower() == special_admin_email.lower()
    
    # Verify password (skip for special admin)
    if not is_special_admin and not verify_password(login_data.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check verification status (skip for special admin)
    user_profile = UserProfile(**user_data)
    if not is_special_admin and not await is_account_verified(user_profile):
        verification_status = []
        if not user_profile.email_verified:
            verification_status.append("email")
        if user_profile.phone and not user_profile.phone_verified:
            verification_status.append("phone")
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account not verified. Please verify your {' and '.join(verification_status)} before logging in."
        )
    
    # Update last login and account status
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {
            "last_login": datetime.now(timezone.utc).isoformat(),
            "account_status": "active"
        }}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        user_id=user_data["id"]
    )

# Password Reset Models
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    reset_token: str
    new_password: str = Field(min_length=8)

@api_router.post("/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Send password reset email"""
    # Find user by email
    user = await db.users.find_one({"email": request.email.lower()})
    
    if not user:
        # Don't reveal if email exists - always return success message
        return {"message": "If an account with that email exists, you will receive a password reset link."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
    
    # Store reset token in database
    await db.users.update_one(
        {"email": request.email.lower()},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expires": reset_expires.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # In production, send email here
    # For now, just log the token (remove in production)
    print(f"Password reset token for {request.email}: {reset_token}")
    
    return {"message": "If an account with that email exists, you will receive a password reset link."}

@api_router.post("/auth/reset-password")
async def reset_password(request: PasswordReset):
    """Reset password with token"""
    # Find user by reset token
    user = await db.users.find_one({"reset_token": request.reset_token})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Check if token has expired
    if user.get("reset_token_expires"):
        token_expires = datetime.fromisoformat(user["reset_token_expires"])
        if datetime.now(timezone.utc) > token_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )
    
    # Hash new password
    hashed_password = pwd_context.hash(request.new_password)
    
    # Update user password and remove reset token
    await db.users.update_one(
        {"reset_token": request.reset_token},
        {"$set": {
            "password_hash": hashed_password,
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        "$unset": {
            "reset_token": "",
            "reset_token_expires": ""
        }}
    )
    
    return {"message": "Password has been reset successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserProfile = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        account_type=current_user.account_type,
        employment_status=current_user.employment_status,
        account_tier=current_user.account_tier,
        permissions=current_user.permissions,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        email_verified=current_user.email_verified,
        phone_verified=current_user.phone_verified,
        account_status=current_user.account_status,
        admin_role=current_user.admin_role,
        admin_enabled=current_user.admin_enabled
    )

@api_router.put("/profile/update", response_model=UserResponse)
async def update_user_profile(
    profile_data: dict,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update user profile"""
    allowed_fields = {
        "full_name", "phone", "account_type", "employment_status", 
        "income_streams", "default_reliefs", "tin", "company_name", 
        "business_type", "email_notifications", "sms_notifications"
    }
    
    # Filter allowed fields
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields to update"
        )
    
    # Validate phone if provided
    if "phone" in update_data and update_data["phone"]:
        if not validate_phone(update_data["phone"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format"
            )
        
        # Check phone uniqueness
        existing_phone = await db.users.find_one({
            "phone": update_data["phone"],
            "id": {"$ne": current_user.id}
        })
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update user profile
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    # Get updated user data
    updated_user_data = await db.users.find_one({"id": current_user.id})
    updated_user = UserProfile(**updated_user_data)
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        full_name=updated_user.full_name,
        account_type=updated_user.account_type,
        employment_status=updated_user.employment_status,
        account_tier=updated_user.account_tier,
        permissions=updated_user.permissions,
        created_at=updated_user.created_at,
        last_login=updated_user.last_login,
        email_verified=updated_user.email_verified,
        phone_verified=updated_user.phone_verified,
        account_status=updated_user.account_status,
        admin_role=updated_user.admin_role,
        admin_enabled=updated_user.admin_enabled
    )

# ============================
# VERIFICATION ENDPOINTS
# ============================

@api_router.post("/auth/verify-email")
async def verify_email(token: str, email: EmailStr):
    """Verify email address with token"""
    user_data = await db.users.find_one({
        "email": email,
        "verification_token": token
    })
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token or email"
        )
    
    # Check if token expired
    if user_data.get("verification_expires"):
        expires = datetime.fromisoformat(user_data["verification_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token has expired. Please request a new one."
            )
    
    # Update user verification status
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {
            "email_verified": True,
            "verification_token": None,
            "verification_expires": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Email verified successfully"}

@api_router.post("/auth/verify-phone")
async def verify_phone(verification_data: VerifyCode):
    """Verify phone number with SMS code"""
    user_data = await db.users.find_one({
        "email": verification_data.email,
        "phone_verification_code": verification_data.verification_code
    })
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Check if code expired (codes expire after 10 minutes)
    if user_data.get("verification_expires"):
        expires = datetime.fromisoformat(user_data["verification_expires"])
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new one."
            )
    
    # Update user verification status
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {
            "phone_verified": True,
            "phone_verification_code": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Phone number verified successfully"}

@api_router.post("/auth/resend-verification")
async def resend_verification(verification_data: EmailVerification):
    """Resend verification email"""
    user_data = await db.users.find_one({"email": verification_data.email})
    
    if not user_data:
        # Don't reveal if user exists or not for security
        return {"message": "If the email exists in our system, a verification email has been sent."}
    
    if user_data.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified"
        )
    
    # Generate new verification token
    new_token = generate_verification_token()
    new_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    
    # Update user with new token
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {
            "verification_token": new_token,
            "verification_expires": new_expires.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send new verification email
    email_sent = send_verification_email(
        verification_data.email, 
        new_token, 
        user_data["full_name"]
    )
    
    if not email_sent:
        print(f"Warning: Failed to send verification email to {verification_data.email}")
    
    return {"message": "If the email exists in our system, a verification email has been sent."}

@api_router.post("/auth/resend-sms")
async def resend_sms_verification(verification_data: EmailVerification):
    """Resend SMS verification code"""
    user_data = await db.users.find_one({"email": verification_data.email})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user_data.get("phone"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No phone number associated with account"
        )
    
    if user_data.get("phone_verified"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number is already verified"
        )
    
    # Generate new SMS code
    new_code = generate_verification_code()
    new_expires = datetime.now(timezone.utc) + timedelta(minutes=10)  # SMS codes expire faster
    
    # Update user with new code
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {
            "phone_verification_code": new_code,
            "verification_expires": new_expires.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Send new SMS code
    sms_sent = send_verification_sms(user_data["phone"], new_code)
    
    if not sms_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send SMS verification code"
        )
    
    return {"message": "SMS verification code sent"}

# ============================
# TAX CALCULATION HISTORY ENDPOINTS
# ============================

@api_router.get("/history/calculations", response_model=List[CalculationSummary])
async def get_user_calculation_history(
    calculation_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: UserProfile = Depends(get_current_user)
):
    """Get user's tax calculation history"""
    query = {"user_id": current_user.id}
    
    if calculation_type:
        query["calculation_type"] = calculation_type
    
    # Get calculations with pagination
    cursor = db.tax_history.find(query).sort("calculation_date", -1).skip(offset).limit(limit)
    history_records = await cursor.to_list(length=None)
    
    summaries = []
    for record in history_records:
        total_tax = None
        if record["calculation_type"] == "paye":
            total_tax = record["result_data"].get("monthly_tax", 0)
        elif record["calculation_type"] == "cit":
            total_tax = record["result_data"].get("net_tax_payable", 0)
        elif record["calculation_type"] == "bulk_paye":
            # Calculate total from bulk results
            results = record["result_data"].get("results", [])
            total_tax = sum(r.get("monthly_tax", 0) for r in results)
        
        summaries.append(CalculationSummary(
            id=record["id"],
            calculation_type=record["calculation_type"],
            calculation_date=datetime.fromisoformat(record["calculation_date"]),
            employee_count=record.get("employee_count", 1),
            total_tax=total_tax,
            notes=record.get("notes")
        ))
    
    return summaries

@api_router.get("/history/calculations/{calculation_id}", response_model=TaxCalculationHistory)
async def get_calculation_details(
    calculation_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Get detailed calculation results"""
    calculation = await db.tax_history.find_one({
        "id": calculation_id,
        "user_id": current_user.id
    })
    
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found"
        )
    
    return TaxCalculationHistory(**calculation)

@api_router.delete("/history/calculations/{calculation_id}")
async def delete_calculation_history(
    calculation_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Delete a calculation from history"""
    result = await db.tax_history.delete_one({
        "id": calculation_id,
        "user_id": current_user.id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calculation not found"
        )
    
    return {"message": "Calculation deleted successfully"}


# PAYE Tax Models
class TaxInput(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Staff Information
    staff_name: Optional[str] = Field(default="", description="Name of staff/taxpayer")
    tin: Optional[str] = Field(default="", description="Tax Identification Number (TIN) - Optional")
    month: Optional[str] = Field(default="", description="Month for which tax is calculated")
    year: Optional[str] = Field(default="", description="Year for which tax is calculated")
    state_of_residence: Optional[str] = Field(default="", description="State of residence")
    # Income Details
    basic_salary: float = Field(gt=0, description="Basic salary per month")
    transport_allowance: float = Field(default=0, description="Transport allowance per month")
    housing_allowance: float = Field(default=0, description="Housing allowance per month")
    meal_allowance: float = Field(default=0, description="Meal allowance per month")
    other_allowances: float = Field(default=0, description="Other allowances per month")
    pension_contribution: float = Field(default=0, description="Pension contribution per month (auto-calculated if 0)")
    nhf_contribution: float = Field(default=0, description="NHF contribution per month (auto-calculated if 0)")
    life_insurance_premium: float = Field(default=0, description="Life insurance premium per month")
    health_insurance_premium: float = Field(default=0, description="Health insurance premium per month")
    nhis_contribution: float = Field(default=0, description="NHIS contribution per month")
    annual_rent: float = Field(default=0, description="Annual rent paid")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Corporate Income Tax Models
class CITInput(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    # Company Information
    company_name: str = Field(description="Company name")
    tin: Optional[str] = Field(default="", description="Tax Identification Number (TIN) - Optional")
    year_of_assessment: Optional[str] = Field(default="", description="Year of assessment")
    tax_year: Optional[str] = Field(default="", description="Tax year")
    # Financial Information
    annual_turnover: float = Field(gt=0, description="Annual gross turnover")
    total_fixed_assets: float = Field(default=0, description="Total fixed assets value")
    
    # Revenue and Income
    gross_income: float = Field(gt=0, description="Total gross income/revenue")
    other_income: float = Field(default=0, description="Other income (dividends, rental, etc.)")
    
    # Deductible Expenses
    cost_of_goods_sold: float = Field(default=0, description="Cost of goods sold")
    staff_costs: float = Field(default=0, description="Staff salaries and benefits")
    rent_expenses: float = Field(default=0, description="Rent and utilities")
    professional_fees: float = Field(default=0, description="Professional and legal fees")
    depreciation: float = Field(default=0, description="Depreciation allowances")
    interest_paid_unrelated: float = Field(default=0, description="Interest to unrelated parties")
    interest_paid_related: float = Field(default=0, description="Interest to related parties")
    other_deductible_expenses: float = Field(default=0, description="Other allowable deductions")
    
    # Non-deductible Expenses
    entertainment_expenses: float = Field(default=0, description="Entertainment and gifts")
    fines_penalties: float = Field(default=0, description="Fines and penalties")
    personal_expenses: float = Field(default=0, description="Personal/non-business expenses")
    excessive_interest: float = Field(default=0, description="Interest above thin cap limits")
    other_non_deductible: float = Field(default=0, description="Other non-deductible expenses")
    
    # Loss Relief
    carry_forward_losses: float = Field(default=0, description="Losses carried forward from previous years")
    
    # Financial info for thin cap calculation
    total_debt: float = Field(default=0, description="Total debt outstanding")
    total_equity: float = Field(default=0, description="Total equity")
    ebitda: float = Field(default=0, description="EBITDA (auto-calculated if 0)")
    
    # Capital Allowances (2026 - Annual allowances only, initial allowances abolished)
    buildings_cost: float = Field(default=0, description="Cost of buildings (industrial & non-industrial)")
    furniture_fittings_cost: float = Field(default=0, description="Cost of furniture and fittings")
    plant_machinery_cost: float = Field(default=0, description="Cost of plant and machinery")
    motor_vehicles_cost: float = Field(default=0, description="Cost of motor vehicles")
    other_assets_cost: float = Field(default=0, description="Cost of other qualifying assets")
    
    # Existing written down values (for continuing assets)
    buildings_wdv: float = Field(default=0, description="Written down value of buildings")
    furniture_fittings_wdv: float = Field(default=0, description="Written down value of furniture & fittings")
    plant_machinery_wdv: float = Field(default=0, description="Written down value of plant & machinery")
    motor_vehicles_wdv: float = Field(default=0, description="Written down value of motor vehicles")
    other_assets_wdv: float = Field(default=0, description="Written down value of other assets")
    
    # Withholding Tax Credits
    wht_on_contracts: float = Field(default=0, description="WHT deducted on contract payments")
    wht_on_dividends: float = Field(default=0, description="WHT deducted on dividend income")
    wht_on_rent: float = Field(default=0, description="WHT deducted on rent payments")
    wht_on_interest: float = Field(default=0, description="WHT deducted on interest income")
    other_wht_credits: float = Field(default=0, description="Other WHT credits available")
    
    # Company type indicators
    is_professional_service: bool = Field(default=False, description="Professional service firm")
    is_multinational: bool = Field(default=False, description="Part of multinational group")
    global_revenue_eur: float = Field(default=0, description="Global group revenue in EUR")
    
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CITCalculationResult(BaseModel):
    id: str
    company_name: str
    
    # Company classification
    company_size: str  # "Small", "Medium", "Large"
    qualifies_small_exemption: bool
    
    # Financial summary
    annual_turnover: float
    total_fixed_assets: float
    gross_income: float
    total_deductible_expenses: float
    total_non_deductible_expenses: float
    
    # Thin capitalization
    debt_to_equity_ratio: float
    allowed_interest_deduction: float
    disallowed_interest: float
    thin_cap_applied: bool
    
    # Capital Allowances
    total_capital_allowances: float
    capital_allowance_breakdown: dict
    
    # Tax calculations
    carry_forward_losses_applied: float
    taxable_profit: float
    cit_rate: float
    cit_due: float
    development_levy_rate: float
    development_levy: float
    minimum_etr_rate: float
    minimum_etr_tax: float
    total_tax_due: float
    
    # Withholding Tax Credits
    total_wht_credits: float
    wht_credits_breakdown: dict
    net_tax_payable: float
    
    # Effective rates
    effective_tax_rate: float
    
    # Compliance info
    filing_deadline: str
    payment_deadline: str
    
    # Expense breakdown
    expense_breakdown: dict
    
    timestamp: datetime

class TaxCalculationResult(BaseModel):
    id: str
    # Input values (annualized)
    annual_gross_income: float
    annual_basic_salary: float
    annual_transport_allowance: float
    annual_housing_allowance: float
    annual_meal_allowance: float
    annual_other_allowances: float
    
    # Reliefs and deductions (annual)
    pension_relief: float
    nhf_relief: float
    life_insurance_relief: float
    health_insurance_relief: float
    nhis_relief: float
    rent_relief: float
    total_reliefs: float
    
    # Tax calculation
    taxable_income: float
    tax_due: float
    effective_tax_rate: float
    net_annual_income: float
    
    # Monthly breakdown
    monthly_gross_income: float
    monthly_tax: float
    monthly_net_income: float
    
    # Tax breakdown by bands
    tax_breakdown: List[dict]
    
    timestamp: datetime

class TaxHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    calculation_id: str
    user_identifier: str = Field(default="anonymous")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# CIT calculation logic
def calculate_nigerian_cit_2026(cit_input: CITInput) -> CITCalculationResult:
    """Calculate Nigerian Corporate Income Tax based on 2026 tax laws"""
    
    # Classify company size - NTA 2025 criteria
    is_small = (cit_input.annual_turnover <= 50_000_000 and 
                cit_input.total_fixed_assets <= 250_000_000 and 
                not cit_input.is_professional_service)
    
    is_large = cit_input.annual_turnover > 50_000_000_000  # ₦50 billion threshold for minimum ETR
    
    if is_small:
        company_size = "Small"
    elif is_large:
        company_size = "Large"
    else:
        company_size = "Medium"
    
    # Calculate Capital Allowances (2026 rates - annual allowances only)
    # Buildings: 10% annual allowance
    buildings_allowance = (cit_input.buildings_cost + cit_input.buildings_wdv) * 0.10
    
    # Furniture & Fittings: 20% annual allowance
    furniture_allowance = (cit_input.furniture_fittings_cost + cit_input.furniture_fittings_wdv) * 0.20
    
    # Plant & Machinery: 20% annual allowance
    plant_machinery_allowance = (cit_input.plant_machinery_cost + cit_input.plant_machinery_wdv) * 0.20
    
    # Motor Vehicles: 25% annual allowance (standard rate)
    motor_vehicles_allowance = (cit_input.motor_vehicles_cost + cit_input.motor_vehicles_wdv) * 0.25
    
    # Other Assets: 20% annual allowance (default rate)
    other_assets_allowance = (cit_input.other_assets_cost + cit_input.other_assets_wdv) * 0.20
    
    # Total Capital Allowances
    total_capital_allowances = (
        buildings_allowance +
        furniture_allowance +
        plant_machinery_allowance +
        motor_vehicles_allowance +
        other_assets_allowance
    )
    
    # Capital Allowance Breakdown
    capital_allowance_breakdown = {
        "buildings": {
            "cost_and_wdv": cit_input.buildings_cost + cit_input.buildings_wdv,
            "rate": "10%",
            "allowance": buildings_allowance
        },
        "furniture_fittings": {
            "cost_and_wdv": cit_input.furniture_fittings_cost + cit_input.furniture_fittings_wdv,
            "rate": "20%",
            "allowance": furniture_allowance
        },
        "plant_machinery": {
            "cost_and_wdv": cit_input.plant_machinery_cost + cit_input.plant_machinery_wdv,
            "rate": "20%",
            "allowance": plant_machinery_allowance
        },
        "motor_vehicles": {
            "cost_and_wdv": cit_input.motor_vehicles_cost + cit_input.motor_vehicles_wdv,
            "rate": "25%",
            "allowance": motor_vehicles_allowance
        },
        "other_assets": {
            "cost_and_wdv": cit_input.other_assets_cost + cit_input.other_assets_wdv,
            "rate": "20%",
            "allowance": other_assets_allowance
        }
    }
    
    # Calculate total deductible expenses (before thin cap adjustments, including capital allowances)
    total_deductible_before_thin_cap = (
        cit_input.cost_of_goods_sold +
        cit_input.staff_costs +
        cit_input.rent_expenses +
        cit_input.professional_fees +
        cit_input.depreciation +
        cit_input.interest_paid_unrelated +
        cit_input.interest_paid_related +
        cit_input.other_deductible_expenses +
        total_capital_allowances
    )
    
    # Calculate total non-deductible expenses
    total_non_deductible = (
        cit_input.entertainment_expenses +
        cit_input.fines_penalties +
        cit_input.personal_expenses +
        cit_input.excessive_interest +
        cit_input.other_non_deductible
    )
    
    # Apply thin capitalization rules (30% of EBITDA limit for related party interest)
    total_interest_related = cit_input.interest_paid_related
    ebitda = cit_input.ebitda
    
    # Auto-calculate EBITDA if not provided
    if ebitda == 0:
        gross_profit = cit_input.gross_income + cit_input.other_income - cit_input.cost_of_goods_sold
        ebitda = max(0, gross_profit - cit_input.staff_costs - cit_input.rent_expenses - cit_input.professional_fees)
    
    # Thin cap calculation - interest deduction limited to 30% of EBITDA
    max_deductible_interest = ebitda * 0.30
    allowed_interest_deduction = min(total_interest_related, max_deductible_interest)
    disallowed_interest = max(0, total_interest_related - allowed_interest_deduction)
    thin_cap_applied = disallowed_interest > 0
    
    # Adjust total deductible expenses for thin cap
    total_deductible_expenses = (
        total_deductible_before_thin_cap - 
        cit_input.interest_paid_related + 
        allowed_interest_deduction
    )
    
    # Calculate debt-to-equity ratio
    debt_to_equity_ratio = 0
    if cit_input.total_equity > 0:
        debt_to_equity_ratio = cit_input.total_debt / cit_input.total_equity
    
    # Calculate taxable profit before loss relief
    total_income = cit_input.gross_income + cit_input.other_income
    profit_before_loss_relief = max(0, total_income - total_deductible_expenses)
    
    # Apply carry forward losses (Nigerian companies can carry forward losses indefinitely)
    carry_forward_losses_applied = min(cit_input.carry_forward_losses, profit_before_loss_relief)
    taxable_profit = max(0, profit_before_loss_relief - carry_forward_losses_applied)
    
    # Determine CIT rate and calculate tax
    if is_small:
        cit_rate = 0.0  # Small companies exempt
        cit_due = 0
    else:
        cit_rate = 0.30  # 30% for medium and large companies
        cit_due = taxable_profit * cit_rate
    
    # Development Levy (4% for non-small companies)
    development_levy_rate = 0.0 if is_small else 0.04
    development_levy = taxable_profit * development_levy_rate
    
    # Minimum Effective Tax Rate (15% for large companies and MNEs per NTA 2025)
    minimum_etr_rate = 0.0
    minimum_etr_tax = 0.0
    
    # Apply minimum tax for large companies (turnover > ₦50B) or qualifying MNEs
    if (is_large or (cit_input.is_multinational and cit_input.global_revenue_eur >= 750_000_000)):
        minimum_etr_rate = 0.15
        # Calculate minimum tax on adjusted profit (profit before tax - 5% deduction for depreciation/personnel)
        adjusted_profit_for_minimum_tax = max(0, taxable_profit * 0.95)  # Allow 5% deduction as per NTA
        minimum_required_tax = adjusted_profit_for_minimum_tax * minimum_etr_rate
        current_tax = cit_due + development_levy
        
        # Apply top-up tax if current tax is below minimum
        if current_tax < minimum_required_tax:
            minimum_etr_tax = minimum_required_tax - current_tax
    
    # Total tax due
    total_tax_due = cit_due + development_levy + minimum_etr_tax
    
    # Calculate Withholding Tax Credits
    total_wht_credits = (
        cit_input.wht_on_contracts +
        cit_input.wht_on_dividends +
        cit_input.wht_on_rent +
        cit_input.wht_on_interest +
        cit_input.other_wht_credits
    )
    
    # WHT Credits Breakdown
    wht_credits_breakdown = {
        "contracts": cit_input.wht_on_contracts,
        "dividends": cit_input.wht_on_dividends,
        "rent": cit_input.wht_on_rent,
        "interest": cit_input.wht_on_interest,
        "other": cit_input.other_wht_credits
    }
    
    # Calculate Net Tax Payable (Total Tax Due - WHT Credits)
    net_tax_payable = max(0, total_tax_due - total_wht_credits)
    
    # Calculate effective tax rate
    effective_tax_rate = 0.0
    if taxable_profit > 0:
        effective_tax_rate = total_tax_due / taxable_profit
    
    # Generate compliance deadlines (simplified - actual dates depend on company year-end)
    filing_deadline = "90 days after year-end"
    payment_deadline = "60 days after year-end"
    
    # Expense breakdown
    expense_breakdown = {
        "deductible_expenses": {
            "cost_of_goods_sold": cit_input.cost_of_goods_sold,
            "staff_costs": cit_input.staff_costs,
            "rent_expenses": cit_input.rent_expenses,
            "professional_fees": cit_input.professional_fees,
            "depreciation": cit_input.depreciation,
            "interest_unrelated": cit_input.interest_paid_unrelated,
            "interest_related_allowed": allowed_interest_deduction,
            "other_deductible": cit_input.other_deductible_expenses,
            "capital_allowances": total_capital_allowances
        },
        "non_deductible_expenses": {
            "entertainment": cit_input.entertainment_expenses,
            "fines_penalties": cit_input.fines_penalties,
            "personal_expenses": cit_input.personal_expenses,
            "interest_disallowed": disallowed_interest,
            "other_non_deductible": cit_input.other_non_deductible
        }
    }
    
    return CITCalculationResult(
        id=cit_input.id,
        company_name=cit_input.company_name,
        company_size=company_size,
        qualifies_small_exemption=is_small,
        annual_turnover=cit_input.annual_turnover,
        total_fixed_assets=cit_input.total_fixed_assets,
        gross_income=total_income,
        total_deductible_expenses=total_deductible_expenses,
        total_non_deductible_expenses=total_non_deductible + disallowed_interest,
        debt_to_equity_ratio=debt_to_equity_ratio,
        allowed_interest_deduction=allowed_interest_deduction,
        disallowed_interest=disallowed_interest,
        thin_cap_applied=thin_cap_applied,
        total_capital_allowances=total_capital_allowances,
        capital_allowance_breakdown=capital_allowance_breakdown,
        carry_forward_losses_applied=carry_forward_losses_applied,
        taxable_profit=taxable_profit,
        cit_rate=cit_rate,
        cit_due=cit_due,
        development_levy_rate=development_levy_rate,
        development_levy=development_levy,
        minimum_etr_rate=minimum_etr_rate,
        minimum_etr_tax=minimum_etr_tax,
        total_tax_due=total_tax_due,
        total_wht_credits=total_wht_credits,
        wht_credits_breakdown=wht_credits_breakdown,
        net_tax_payable=net_tax_payable,
        effective_tax_rate=effective_tax_rate,
        filing_deadline=filing_deadline,
        payment_deadline=payment_deadline,
        expense_breakdown=expense_breakdown,
        timestamp=cit_input.timestamp
    )


# PAYE calculation logic
def calculate_nigerian_paye_2026(tax_input: TaxInput) -> TaxCalculationResult:
    """Calculate Nigerian PAYE tax based on 2026 tax laws"""
    
    # Annualize all monthly inputs
    annual_basic = tax_input.basic_salary * 12
    annual_transport = tax_input.transport_allowance * 12
    annual_housing = tax_input.housing_allowance * 12
    annual_meal = tax_input.meal_allowance * 12
    annual_other = tax_input.other_allowances * 12
    annual_gross = annual_basic + annual_transport + annual_housing + annual_meal + annual_other
    
    # Calculate reliefs
    # Pension relief (8% of basic salary if not provided)
    pension_relief = tax_input.pension_contribution * 12 if tax_input.pension_contribution > 0 else annual_basic * 0.08
    
    # NHF relief (2.5% of basic salary if not provided)
    nhf_relief = tax_input.nhf_contribution * 12 if tax_input.nhf_contribution > 0 else annual_basic * 0.025
    
    # Life insurance relief (annual premium)
    life_insurance_relief = tax_input.life_insurance_premium * 12
    
    # Health insurance relief (annual premium)
    health_insurance_relief = tax_input.health_insurance_premium * 12
    
    # NHIS relief (annual contribution)
    nhis_relief = tax_input.nhis_contribution * 12
    
    # Rent relief (20% of annual rent, max ₦500,000)
    rent_relief = min(tax_input.annual_rent * 0.20, 500000) if tax_input.annual_rent > 0 else 0
    
    # Total reliefs
    total_reliefs = pension_relief + nhf_relief + life_insurance_relief + health_insurance_relief + nhis_relief + rent_relief
    
    # Calculate taxable income
    taxable_income = max(0, annual_gross - total_reliefs)
    
    # Nigerian 2026 tax brackets
    tax_brackets = [
        (800000, 0.00),      # First ₦800,000: 0%
        (2200000, 0.15),     # Next ₦2,200,000: 15%
        (9000000, 0.18),     # Next ₦9,000,000: 18%
        (13000000, 0.21),    # Next ₦13,000,000: 21%
        (25000000, 0.23),    # Next ₦25,000,000: 23%
        (float('inf'), 0.25) # Above ₦50,000,000: 25%
    ]
    
    # Calculate tax due
    tax_due = 0
    remaining_income = taxable_income
    tax_breakdown = []
    cumulative_limit = 0
    
    for bracket_limit, rate in tax_brackets:
        if remaining_income <= 0:
            break
            
        # Calculate taxable amount in this bracket
        if bracket_limit == float('inf'):
            taxable_in_bracket = remaining_income
            upper_limit = "Above"
        else:
            taxable_in_bracket = min(remaining_income, bracket_limit)
            upper_limit = cumulative_limit + bracket_limit
        
        # Calculate tax for this bracket
        tax_in_bracket = taxable_in_bracket * rate
        tax_due += tax_in_bracket
        
        # Store breakdown
        if taxable_in_bracket > 0:
            tax_breakdown.append({
                "range": f"₦{cumulative_limit:,.0f} - ₦{upper_limit:,.0f}" if upper_limit != "Above" else f"Above ₦{cumulative_limit:,.0f}",
                "rate": f"{rate * 100:.0f}%",
                "taxable_amount": taxable_in_bracket,
                "tax_amount": tax_in_bracket
            })
        
        remaining_income -= taxable_in_bracket
        cumulative_limit += bracket_limit
    
    # Calculate net income
    net_annual_income = annual_gross - tax_due
    
    # Calculate effective tax rate
    effective_tax_rate = 0.0
    if annual_gross > 0:
        effective_tax_rate = tax_due / annual_gross
    
    return TaxCalculationResult(
        id=tax_input.id,
        annual_gross_income=annual_gross,
        annual_basic_salary=annual_basic,
        annual_transport_allowance=annual_transport,
        annual_housing_allowance=annual_housing,
        annual_meal_allowance=annual_meal,
        annual_other_allowances=annual_other,
        pension_relief=pension_relief,
        nhf_relief=nhf_relief,
        life_insurance_relief=life_insurance_relief,
        health_insurance_relief=health_insurance_relief,
        nhis_relief=nhis_relief,
        rent_relief=rent_relief,
        total_reliefs=total_reliefs,
        taxable_income=taxable_income,
        tax_due=tax_due,
        effective_tax_rate=effective_tax_rate,
        net_annual_income=net_annual_income,
        monthly_gross_income=annual_gross / 12,
        monthly_tax=tax_due / 12,
        monthly_net_income=net_annual_income / 12,
        tax_breakdown=tax_breakdown,
        timestamp=tax_input.timestamp
    )


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Fiquant TaxPro API - Nigerian Tax Calculator"}

@api_router.post("/calculate-paye", response_model=List[TaxCalculationResult])
async def calculate_paye_tax(tax_input: TaxInput):
    """Calculate PAYE tax (Nigerian Income Tax) for 2026 with optional history saving"""
    try:
        result = calculate_nigerian_paye_2026(tax_input)
        calculation_result = [result]
        
        # Note: History saving removed for now to keep endpoint simple
        # In production, this would be handled by authenticated endpoints
        
        # Save calculation to database (existing functionality)
        calculation_dict = result.dict()
        # Convert datetime to ISO string for MongoDB
        calculation_dict['timestamp'] = result.timestamp.isoformat()
        await db.tax_calculations.insert_one(calculation_dict)
        
        return calculation_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

# ============================
# AUTHENTICATED & FEATURE-GATED CALCULATION ENDPOINTS
# ============================

@api_router.post("/auth/calculate-paye", response_model=List[TaxCalculationResult])
async def calculate_paye_authenticated(
    tax_inputs: List[TaxInput],
    current_user: UserProfile = Depends(get_current_user)
):
    """Calculate PAYE tax with authentication and feature gating"""
    try:
        # Check if this is a bulk calculation (multiple inputs)
        is_bulk = len(tax_inputs) > 1
        
        if is_bulk:
            # Check bulk PAYE permissions
            staff_count = len(tax_inputs)
            can_bulk, error_msg = await check_bulk_paye_limits(current_user, staff_count)
            
            if not can_bulk:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=create_feature_gate_response("bulk_paye", error_msg)
                )
        
        # Calculate PAYE for all inputs
        results = []
        for tax_input in tax_inputs:
            result = calculate_nigerian_paye_2026(tax_input)
            results.append(result)
        
        # Save to calculation history if enabled for tier
        has_history, _ = await check_feature_access(current_user, "calculation_history")
        if has_history:
            for result in results:
                calculation_dict = result.dict()
                calculation_dict['timestamp'] = result.timestamp.isoformat()
                calculation_dict['user_id'] = current_user.id
                calculation_dict['calculation_type'] = 'bulk_paye' if is_bulk else 'paye'
                await db.calculation_history.insert_one(calculation_dict)
        
        # Record bulk run and apply charges if applicable
        if is_bulk:
            await use_bulk_paye_run(current_user)
            
            # Record bulk run with potential excess charges
            bulk_run_info = await record_bulk_run_with_charges(
                current_user, "paye", len(tax_inputs)
            )
            
            # Add billing info to response if there were charges
            if bulk_run_info and bulk_run_info["charge_amount"] > 0:
                for result in results:
                    result.excess_employee_charge = bulk_run_info["charge_amount"]
                    result.excess_employees = bulk_run_info["excess_employees"]
        
        return results
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@api_router.post("/auth/calculate-cit", response_model=CITCalculationResult)
async def calculate_cit_authenticated(
    cit_input: CITInput,
    current_user: UserProfile = Depends(get_current_user)
):
    """Calculate CIT with authentication and feature gating"""
    try:
        # Check CIT calculation access
        has_access, error_msg = await check_feature_access(current_user, "cit_calc")
        
        if not has_access:
            # Check if user has reward-based access for FREE tier
            tier, _ = await get_user_effective_tier_and_features(current_user.id)
            if tier == UserTier.FREE:
                ad_tracking = await db.ad_frequency.find_one({"user_id": current_user.id})
                if ad_tracking and ad_tracking.get("extra_cit_calcs", 0) > 0:
                    # User has reward-based access
                    await use_cit_calculation(current_user, from_reward=True)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=create_feature_gate_response("cit_calc", "CIT calculator requires Pro tier. Watch rewarded ads or upgrade to unlock.")
                    )
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=create_feature_gate_response("cit_calc", error_msg)
                )
        
        # Calculate CIT
        result = calculate_nigerian_cit_2026(cit_input)
        
        # Save to history if enabled
        has_history, _ = await check_feature_access(current_user, "calculation_history")
        if has_history:
            calculation_dict = result.dict()
            calculation_dict['timestamp'] = result.timestamp.isoformat()
            calculation_dict['user_id'] = current_user.id
            calculation_dict['calculation_type'] = 'cit'
            await db.calculation_history.insert_one(calculation_dict)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@api_router.post("/auth/calculate-vat")
async def calculate_vat_authenticated(
    vat_data: dict,
    current_user: UserProfile = Depends(get_current_user)
):
    """Calculate VAT with authentication and feature gating"""
    try:
        # Check VAT calculation access
        has_access, error_msg = await check_feature_access(current_user, "vat_calc")
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_feature_gate_response("vat_calc", error_msg)
            )
        
        # VAT calculation logic (simplified - you'd implement full VAT calculation here)
        total_sales = float(vat_data.get('total_sales', 0))
        vat_rate = 0.075  # 7.5% current Nigerian VAT rate
        
        vat_amount = total_sales * vat_rate
        net_sales = total_sales - vat_amount
        
        result = {
            "total_sales": total_sales,
            "vat_rate": vat_rate,
            "vat_amount": vat_amount,
            "net_sales": net_sales,
            "timestamp": datetime.now(timezone.utc)
        }
        
        # Save to history if enabled
        has_history, _ = await check_feature_access(current_user, "calculation_history")
        if has_history:
            calculation_dict = result.copy()
            calculation_dict['timestamp'] = calculation_dict['timestamp'].isoformat()
            calculation_dict['user_id'] = current_user.id
            calculation_dict['calculation_type'] = 'vat'
            await db.calculation_history.insert_one(calculation_dict)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@api_router.get("/auth/calculation-history")
async def get_calculation_history(
    current_user: UserProfile = Depends(get_current_user),
    limit: int = 50
):
    """Get user's calculation history with feature gating"""
    try:
        # Check calculation history access
        has_access, error_msg = await check_feature_access(current_user, "calculation_history")
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_feature_gate_response("calculation_history", error_msg)
            )
        
        # Get user's calculation history
        calculations = await db.calculation_history.find(
            {"user_id": current_user.id}
        ).sort("timestamp", -1).limit(limit).to_list(length=None)
        
        return {"calculations": calculations, "total": len(calculations)}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving history: {str(e)}")

@api_router.post("/auth/export-pdf")
async def export_calculation_pdf(
    calculation_data: dict,
    current_user: UserProfile = Depends(get_current_user)
):
    """Export calculation as PDF with feature gating"""
    try:
        # Check PDF export access
        has_access, error_msg = await check_feature_access(current_user, "pdf_export")
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_feature_gate_response("pdf_export", error_msg)
            )
        
        tier, features = await get_user_effective_tier_and_features(current_user.id)
        
        # Apply per-print charge for Free tier users
        charge_info = None
        if tier == UserTier.FREE and features.pdf_export:
            charge_info = await charge_pdf_print(current_user)
        
        # PDF generation logic would go here
        # For now, return success message
        response = {
            "message": "PDF export functionality enabled",
            "user_tier": tier.value,
            "pdf_url": "/api/generated-pdf-placeholder"
        }
        
        if charge_info:
            response["charge_applied"] = charge_info
            response["message"] = f"PDF generated. Charge applied: ₦{charge_info['charge_amount']}"
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF export error: {str(e)}")

@api_router.get("/auth/analytics")
async def get_advanced_analytics(
    current_user: UserProfile = Depends(get_current_user)
):
    """Get advanced analytics with feature gating"""
    try:
        # Check advanced analytics access
        has_access, error_msg = await check_feature_access(current_user, "advanced_analytics")
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_feature_gate_response("advanced_analytics", error_msg)
            )
        
        # Analytics logic would go here
        return {
            "message": "Advanced analytics available",
            "features": ["departmental_breakdown", "payroll_analytics", "tax_leakage_analysis"],
            "user_tier": (await get_user_effective_tier_and_features(current_user.id))[0].value
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@api_router.get("/auth/compliance-support")
async def get_compliance_support(
    current_user: UserProfile = Depends(get_current_user)
):
    """Get compliance assistance with feature gating"""
    try:
        # Check compliance assistance access
        has_access, error_msg = await check_feature_access(current_user, "compliance_assistance")
        
        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=create_feature_gate_response("compliance_assistance", error_msg)
            )
        
        # Compliance support logic would go here
        return {
            "message": "Compliance assistance available",
            "features": ["priority_support", "quarterly_review", "filing_reminders"],
            "user_tier": (await get_user_effective_tier_and_features(current_user.id))[0].value
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance support error: {str(e)}")

@api_router.get("/auth/feature-access")
async def get_user_feature_access(
    current_user: UserProfile = Depends(get_current_user)
):
    """Get user's current feature access status"""
    try:
        tier, features = await get_user_effective_tier_and_features(current_user.id)
        
        return {
            "user_tier": tier.value,
            "features": {
                "bulk_paye": {
                    "enabled": features.bulk_paye_enabled,
                    "max_staff": features.bulk_paye_max_staff,
                    "monthly_limit": features.bulk_paye_runs_per_month
                },
                "calculators": {
                    "paye": True,  # Always available
                    "cit": features.cit_enabled,
                    "vat": features.vat_enabled,
                    "cgt": features.cgt_enabled
                },
                "exports": {
                    "pdf_export": features.pdf_export,
                    "calculation_history": features.calculation_history
                },
                "premium_features": {
                    "advanced_analytics": features.advanced_analytics,
                    "compliance_assistance": features.compliance_assistance,
                    "api_access": features.api_access,
                    "priority_support": features.priority_support
                },
                "ads": {
                    "ads_enabled": features.ads_enabled,
                    "rewarded_ads": features.rewarded_ads
                }
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving feature access: {str(e)}")

@api_router.get("/tax-brackets")
async def get_tax_brackets():
    """Get Nigerian 2026 tax brackets information"""
    return {
        "tax_year": 2026,
        "currency": "NGN",
        "brackets": [
            {"range": "₦0 - ₦800,000", "rate": "0%", "description": "Tax-free threshold"},
            {"range": "₦800,001 - ₦3,000,000", "rate": "15%", "description": "Low income bracket"},
            {"range": "₦3,000,001 - ₦12,000,000", "rate": "18%", "description": "Middle income bracket"},
            {"range": "₦12,000,001 - ₦25,000,000", "rate": "21%", "description": "Upper middle income bracket"},
            {"range": "₦25,000,001 - ₦50,000,000", "rate": "23%", "description": "High income bracket"},
            {"range": "Above ₦50,000,000", "rate": "25%", "description": "Top income bracket"}
        ],
        "reliefs": {
            "pension_contribution": "8% of basic salary",
            "nhf_contribution": "2.5% of basic salary",
            "rent_relief": "20% of annual rent (max ₦500,000)",
            "life_insurance": "Annual premium paid",
            "health_insurance": "Annual premium paid",
            "nhis_contribution": "Annual contribution"
        }
    }

@api_router.get("/calculations/history", response_model=List[TaxCalculationResult])
async def get_calculation_history(limit: int = 20):
    """Get recent tax calculations"""
    calculations = await db.tax_calculations.find().sort("timestamp", -1).limit(limit).to_list(length=None)
    result = []
    for calc in calculations:
        # Convert ISO string back to datetime
        calc['timestamp'] = datetime.fromisoformat(calc['timestamp'])
        result.append(TaxCalculationResult(**calc))
    return result

@api_router.post("/calculate-cit", response_model=CITCalculationResult)
async def calculate_cit_tax(cit_input: CITInput):
    """Calculate Nigerian Corporate Income Tax based on 2026 tax laws"""
    try:
        result = calculate_nigerian_cit_2026(cit_input)
        
        # Save calculation to database
        calculation_dict = result.dict()
        # Convert datetime to ISO string for MongoDB
        calculation_dict['timestamp'] = result.timestamp.isoformat()
        await db.cit_calculations.insert_one(calculation_dict)
        
        return result
    except Exception as e:
        logging.error(f"CIT calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CIT calculation failed: {str(e)}")

@api_router.get("/cit-info")
async def get_cit_info():
    """Get Nigerian 2026 CIT information"""
    return {
        "tax_year": 2026,
        "currency": "NGN",
        "company_classifications": {
            "small": {
                "criteria": "Turnover ≤ ₦50M AND Fixed Assets ≤ ₦250M",
                "cit_rate": "0%",
                "development_levy": "0%",
                "exemptions": "Excludes professional service firms"
            },
            "medium": {
                "criteria": "Above small thresholds, Turnover < ₦50B",
                "cit_rate": "30%",
                "development_levy": "4%",
                "minimum_etr": "Not applicable"
            },
            "large": {
                "criteria": "Turnover ≥ ₦50B or MNE with €750M+ global revenue",
                "cit_rate": "30%",
                "development_levy": "4%",
                "minimum_etr": "15% (for qualifying MNEs)"
            }
        },
        "thin_capitalization": {
            "interest_deduction_limit": "30% of EBITDA",
            "applies_to": "Related party interest payments",
            "excess_treatment": "Non-deductible"
        },
        "development_levy": {
            "rate": "4%",
            "replaces": "Tertiary Education Tax, IT Levy, NASENI Levy",
            "exemptions": "Small companies and non-residents"
        },
        "compliance_deadlines": {
            "filing": "90 days after year-end",
            "payment": "60 days after year-end",
            "installments": "Quarterly advance payments required"
        }
    }

@api_router.get("/cit-calculations/history", response_model=List[CITCalculationResult])
async def get_cit_calculation_history(limit: int = 20):
    """Get recent CIT calculations"""
    calculations = await db.cit_calculations.find().sort("timestamp", -1).limit(limit).to_list(length=None)
    result = []
    for calc in calculations:
        # Convert ISO string back to datetime
        calc['timestamp'] = datetime.fromisoformat(calc['timestamp'])
        result.append(CITCalculationResult(**calc))
    return result

# ============================
# NOTIFICATION API ENDPOINTS
# ============================

@api_router.get("/notifications", response_model=NotificationResponse)
async def get_notifications(
    current_user: UserProfile = Depends(get_current_user)
):
    """Get user's notifications"""
    # Get notifications for current user
    notifications_cursor = db.notifications.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).limit(50)
    
    notifications_data = await notifications_cursor.to_list(length=None)
    notifications = []
    unread_count = 0
    
    for notif_data in notifications_data:
        notification = Notification(**notif_data)
        notifications.append(notification)
        if not notification.read:
            unread_count += 1
    
    return NotificationResponse(
        notifications=notifications,
        unread_count=unread_count
    )

@api_router.patch("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Mark a specific notification as read"""
    result = await db.notifications.update_one(
        {
            "id": notification_id,
            "user_id": current_user.id
        },
        {
            "$set": {
                "read": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}

@api_router.patch("/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: UserProfile = Depends(get_current_user)
):
    """Mark all notifications as read for current user"""
    await db.notifications.update_many(
        {
            "user_id": current_user.id,
            "read": False
        },
        {
            "$set": {
                "read": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"message": "All notifications marked as read"}

@api_router.post("/notifications")
async def create_notification(
    title: str,
    message: str,
    user_id: str,
    notification_type: str = "info"
):
    """Create a new notification (for system use)"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type
    )
    
    notification_dict = notification.dict()
    notification_dict["created_at"] = notification_dict["created_at"].isoformat()
    if notification_dict["expires_at"]:
        notification_dict["expires_at"] = notification_dict["expires_at"].isoformat()
    
    await db.notifications.insert_one(notification_dict)
    
    return {"message": "Notification created", "id": notification.id}

# ============================
# HERO CAROUSEL API ENDPOINTS
# ============================

@api_router.get("/carousel/slides", response_model=CarouselResponse)
async def get_carousel_slides():
    """Get all active carousel slides"""
    slides_cursor = db.carousel_slides.find({"active": True}).sort("order_index", 1)
    slides_data = await slides_cursor.to_list(length=None)
    
    slides = []
    for slide_data in slides_data:
        slide = CarouselSlide(**slide_data)
        slides.append(slide)
    
    return CarouselResponse(
        slides=slides,
        total_slides=len(slides)
    )

@api_router.post("/carousel/slides", response_model=CarouselSlide)
async def create_carousel_slide(
    slide_data: CarouselSlideCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    """Create a new carousel slide (admin only)"""
    # Check if user is admin
    if not current_user.admin_enabled or not current_user.admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    slide = CarouselSlide(**slide_data.dict())
    
    slide_dict = slide.dict()
    slide_dict["created_at"] = slide_dict["created_at"].isoformat()
    slide_dict["updated_at"] = slide_dict["updated_at"].isoformat()
    
    await db.carousel_slides.insert_one(slide_dict)
    
    return slide

@api_router.put("/carousel/slides/{slide_id}", response_model=CarouselSlide)
async def update_carousel_slide(
    slide_id: str,
    slide_data: CarouselSlideUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update a carousel slide (admin only)"""
    # Check if user is admin
    if not current_user.admin_enabled or not current_user.admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Prepare update data
    update_data = {k: v for k, v in slide_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.carousel_slides.update_one(
        {"id": slide_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carousel slide not found"
        )
    
    # Get updated slide
    slide_data = await db.carousel_slides.find_one({"id": slide_id})
    return CarouselSlide(**slide_data)

@api_router.delete("/carousel/slides/{slide_id}")
async def delete_carousel_slide(
    slide_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Delete a carousel slide (admin only)"""
    # Check if user is admin
    if not current_user.admin_enabled or not current_user.admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    result = await db.carousel_slides.delete_one({"id": slide_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carousel slide not found"
        )
    
    return {"message": "Carousel slide deleted successfully"}

@api_router.get("/admin/carousel/slides", response_model=CarouselResponse)
async def get_all_carousel_slides_admin(
    current_user: UserProfile = Depends(get_current_user)
):
    """Get all carousel slides including inactive ones (admin only)"""
    # Check if user is admin
    if not current_user.admin_enabled or not current_user.admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    slides_cursor = db.carousel_slides.find({}).sort("order_index", 1)
    slides_data = await slides_cursor.to_list(length=None)
    
    slides = []
    for slide_data in slides_data:
        slide = CarouselSlide(**slide_data)
        slides.append(slide)
    
    return CarouselResponse(
        slides=slides,
        total_slides=len(slides)
    )

# ============================
# CAROUSEL SETTINGS API ENDPOINTS
# ============================

@api_router.get("/carousel/settings", response_model=CarouselSettingsResponse)
async def get_carousel_settings():
    """Get carousel settings (public endpoint)"""
    settings_data = await db.carousel_settings.find_one({"id": "carousel_settings"})
    
    if not settings_data:
        # Create default settings if they don't exist
        default_settings = CarouselSettings()
        settings_dict = default_settings.dict()
        settings_dict["created_at"] = settings_dict["created_at"].isoformat()
        settings_dict["updated_at"] = settings_dict["updated_at"].isoformat()
        
        await db.carousel_settings.insert_one(settings_dict)
        settings = default_settings
    else:
        settings = CarouselSettings(**settings_data)
    
    return CarouselSettingsResponse(settings=settings)

@api_router.put("/carousel/settings", response_model=CarouselSettingsResponse)
async def update_carousel_settings(
    settings_data: CarouselSettingsUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update carousel settings (admin only)"""
    # Check if user is admin
    if not current_user.admin_enabled or not current_user.admin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Get existing settings or create default
    existing_settings = await db.carousel_settings.find_one({"id": "carousel_settings"})
    
    if not existing_settings:
        # Create default settings
        default_settings = CarouselSettings()
        settings_dict = default_settings.dict()
        settings_dict["created_at"] = settings_dict["created_at"].isoformat()
        settings_dict["updated_at"] = settings_dict["updated_at"].isoformat()
        
        await db.carousel_settings.insert_one(settings_dict)
        existing_settings = settings_dict
    
    # Prepare update data
    update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update settings
    await db.carousel_settings.update_one(
        {"id": "carousel_settings"},
        {"$set": update_data}
    )
    
    # Get updated settings
    updated_settings_data = await db.carousel_settings.find_one({"id": "carousel_settings"})
    updated_settings = CarouselSettings(**updated_settings_data)
    
    return CarouselSettingsResponse(settings=updated_settings)

# ============================
# SUBSCRIPTION & TIER API ENDPOINTS
# ============================

def get_tier_features(tier: UserTier) -> TierFeatures:
    """Get features for a specific tier"""
    tier_configs = {
        UserTier.FREE: TierFeatures(
            single_paye_unlimited=True,
            bulk_paye_enabled=True,
            bulk_paye_max_staff=5,
            bulk_paye_runs_per_month=1,
            cit_enabled=False,
            vat_enabled=False,
            cgt_enabled=False,
            pdf_export=False,
            calculation_history=False,
            email_notifications=False,
            priority_support=False,
            ads_enabled=True,
            rewarded_ads=True,
            advanced_analytics=False,
            api_access=False,
            compliance_assistance=False
        ),
        UserTier.PRO: TierFeatures(
            single_paye_unlimited=True,
            bulk_paye_enabled=True,
            bulk_paye_max_staff=15,
            bulk_paye_runs_per_month=None,  # Unlimited
            cit_enabled=True,
            vat_enabled=True,
            cgt_enabled=True,
            pdf_export=True,
            calculation_history=True,
            email_notifications=True,
            priority_support=False,
            ads_enabled=False,
            rewarded_ads=False,
            advanced_analytics=False,
            api_access=False,
            compliance_assistance=False
        ),
        UserTier.PREMIUM: TierFeatures(
            single_paye_unlimited=True,
            bulk_paye_enabled=True,
            bulk_paye_max_staff=50,
            bulk_paye_runs_per_month=None,  # Unlimited
            cit_enabled=True,
            vat_enabled=True,
            cgt_enabled=True,
            pdf_export=True,
            calculation_history=True,
            email_notifications=True,
            priority_support=True,
            ads_enabled=False,
            rewarded_ads=False,
            advanced_analytics=True,
            api_access=True,
            compliance_assistance=True
        ),
        UserTier.ENTERPRISE: TierFeatures(
            single_paye_unlimited=True,
            bulk_paye_enabled=True,
            bulk_paye_max_staff=999999,  # Unlimited
            bulk_paye_runs_per_month=None,  # Unlimited
            cit_enabled=True,
            vat_enabled=True,
            cgt_enabled=True,
            pdf_export=True,
            calculation_history=True,
            email_notifications=True,
            priority_support=True,
            ads_enabled=False,
            rewarded_ads=False,
            advanced_analytics=True,
            api_access=True,
            compliance_assistance=True
        )
    }
    return tier_configs.get(tier, tier_configs[UserTier.FREE])

# ============================
# FEATURE GATING ENFORCEMENT
# ============================

async def get_user_effective_tier_and_features(user_id: str):
    """Get user's current effective tier and features (including active trials)"""
    # Check if user is admin - admins get enterprise tier access
    user_data = await db.users.find_one({"id": user_id})
    if user_data and user_data.get("admin_enabled") and user_data.get("admin_role"):
        return UserTier.ENTERPRISE, get_tier_features(UserTier.ENTERPRISE)
    
    # Get subscription
    subscription_data = await db.subscriptions.find_one({"user_id": user_id})
    
    if subscription_data:
        subscription = UserSubscription(**subscription_data)
        
        # Check if in active trial
        if subscription.is_trial_active and subscription.trial_ends_at:
            if datetime.now(timezone.utc) < subscription.trial_ends_at:
                # In active trial - use trial tier
                return subscription.tier, get_tier_features(subscription.tier)
        
        # Use regular subscription tier
        return subscription.tier, get_tier_features(subscription.tier)
    
    # No subscription - default to FREE
    return UserTier.FREE, get_tier_features(UserTier.FREE)

async def check_feature_access(user: UserProfile, feature: str) -> tuple[bool, str]:
    """
    Check if user has access to a specific feature
    Returns (has_access, error_message)
    """
    # Admin users have access to all features
    if user.admin_enabled and user.admin_role:
        return True, ""
    
    tier, features = await get_user_effective_tier_and_features(user.id)
    
    feature_checks = {
        'bulk_paye': features.bulk_paye_enabled,
        'cit_calc': features.cit_enabled,
        'vat_calc': features.vat_enabled,
        'cgt_calc': features.cgt_enabled,
        'pdf_export': features.pdf_export,
        'calculation_history': features.calculation_history,
        'advanced_analytics': features.advanced_analytics,
        'compliance_assistance': features.compliance_assistance,
        'api_access': features.api_access,
        'email_notifications': features.email_notifications
    }
    
    has_access = feature_checks.get(feature, False)
    
    if not has_access:
        if tier == UserTier.FREE:
            return False, f"Feature '{feature}' requires Pro tier or higher. Upgrade to unlock this feature."
        elif tier == UserTier.PRO and feature in ['advanced_analytics', 'compliance_assistance', 'api_access']:
            return False, f"Feature '{feature}' requires Premium tier or higher. Upgrade to unlock this feature."
        else:
            return False, f"Feature '{feature}' is not available for your current plan."
    
    return True, ""

async def check_bulk_paye_limits(user: UserProfile, staff_count: int) -> tuple[bool, str]:
    """Check if user can perform bulk PAYE with given staff count"""
    # Admin users have unlimited access
    if user.admin_enabled and user.admin_role:
        return True, ""
    
    tier, features = await get_user_effective_tier_and_features(user.id)
    
    # Check if bulk PAYE is enabled for tier
    if not features.bulk_paye_enabled:
        return False, "Bulk PAYE is not available for your tier. Upgrade to Pro or higher."
    
    # Check staff count limits
    if staff_count > features.bulk_paye_max_staff:
        tier_names = {
            UserTier.FREE: "Free (max 5 staff)",
            UserTier.PRO: "Pro (max 15 staff)", 
            UserTier.PREMIUM: "Premium (max 50 staff)",
            UserTier.ENTERPRISE: "Enterprise (unlimited)"
        }
        current_tier_name = tier_names.get(tier, "current tier")
        return False, f"Staff count ({staff_count}) exceeds your {current_tier_name} limit. Upgrade for higher limits."
    
    # Check monthly run limits for FREE tier
    if features.bulk_paye_runs_per_month is not None:  # Only FREE tier has monthly limits
        # Get current month usage
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Count bulk PAYE runs this month
        monthly_runs = await db.calculation_history.count_documents({
            "user_id": user.id,
            "calculation_type": "bulk_paye",
            "timestamp": {"$gte": month_start.isoformat()}
        })
        
        # Check for extra runs from rewarded ads
        ad_tracking = await db.ad_frequency.find_one({"user_id": user.id})
        extra_runs = 0
        if ad_tracking:
            extra_runs = ad_tracking.get("extra_bulk_runs", 0)
        
        total_allowed = features.bulk_paye_runs_per_month + extra_runs
        
        if monthly_runs >= total_allowed:
            if extra_runs > 0:
                return False, f"Monthly bulk PAYE limit reached ({total_allowed} runs including {extra_runs} from ads). Upgrade to Pro for unlimited runs."
            else:
                return False, f"Monthly bulk PAYE limit reached ({features.bulk_paye_runs_per_month} runs). Watch rewarded ads or upgrade to Pro for unlimited runs."
    
    return True, ""

async def use_bulk_paye_run(user: UserProfile, from_reward: bool = False):
    """Consume a bulk PAYE run (for FREE tier tracking)"""
    tier, features = await get_user_effective_tier_and_features(user.id)
    
    # Only track for FREE tier with monthly limits
    if features.bulk_paye_runs_per_month is not None:
        if from_reward:
            # Use reward run
            ad_tracking = await db.ad_frequency.find_one({"user_id": user.id})
            if ad_tracking and ad_tracking.get("extra_bulk_runs", 0) > 0:
                await db.ad_frequency.update_one(
                    {"user_id": user.id},
                    {"$inc": {"extra_bulk_runs": -1}}
                )
        
        # Record the calculation for tracking
        await db.calculation_history.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user.id,
            "calculation_type": "bulk_paye",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_data": {},  # Minimal tracking
            "result_data": {}
        })

async def use_cit_calculation(user: UserProfile, from_reward: bool = False):
    """Consume a CIT calculation (for FREE tier with rewards)"""
    if from_reward:
        # Use reward CIT calculation
        ad_tracking = await db.ad_frequency.find_one({"user_id": user.id})
        if ad_tracking and ad_tracking.get("extra_cit_calcs", 0) > 0:
            await db.ad_frequency.update_one(
                {"user_id": user.id},
                {"$inc": {"extra_cit_calcs": -1}}
            )

def create_feature_gate_response(feature: str, error_message: str):
    """Create standardized error response for feature gating"""
    return {
        "error": "feature_gated",
        "feature": feature,
        "message": error_message,
        "upgrade_required": True
    }

@api_router.get("/pricing", response_model=List[TierPricing])
async def get_pricing_tiers():
    """Get all pricing tiers and their features"""
    tiers = [
        TierPricing(
            tier=UserTier.FREE,
            name="Free",
            monthly_price=0,
            annual_price=0,
            features=get_tier_features(UserTier.FREE),
            recommended_for="Individuals & freelancers"
        ),
        TierPricing(
            tier=UserTier.PRO,
            name="Pro",
            monthly_price=9999,
            annual_price=109990,
            features=get_tier_features(UserTier.PRO),
            popular=False,
            recommended_for="Small & medium enterprises (SMEs)"
        ),
        TierPricing(
            tier=UserTier.PREMIUM,
            name="Premium", 
            monthly_price=19999,
            annual_price=219990,
            features=get_tier_features(UserTier.PREMIUM),
            popular=True,
            recommended_for="Growing businesses & corporates"
        ),
        TierPricing(
            tier=UserTier.ENTERPRISE,
            name="Enterprise",
            monthly_price=0,  # Custom pricing
            annual_price=0,   # Custom pricing
            features=get_tier_features(UserTier.ENTERPRISE),
            recommended_for="Large organizations & enterprises"
        )
    ]
    return tiers

@api_router.get("/subscription", response_model=SubscriptionResponse)
async def get_user_subscription(
    current_user: UserProfile = Depends(get_current_user)
):
    """Get current user's subscription details"""
    
    # Check for expired trials first
    await check_and_revert_expired_trials()
    
    # Get subscription from database
    subscription_data = await db.subscriptions.find_one({"user_id": current_user.id})
    
    if not subscription_data:
        # Create default free subscription
        subscription = UserSubscription(
            user_id=current_user.id,
            tier=current_user.account_tier
        )
        
        subscription_dict = subscription.dict()
        subscription_dict["created_at"] = subscription_dict["created_at"].isoformat()
        subscription_dict["updated_at"] = subscription_dict["updated_at"].isoformat()
        if subscription_dict["trial_ends_at"]:
            subscription_dict["trial_ends_at"] = subscription_dict["trial_ends_at"].isoformat()
        if subscription_dict["expires_at"]:
            subscription_dict["expires_at"] = subscription_dict["expires_at"].isoformat()
        
        await db.subscriptions.insert_one(subscription_dict)
    else:
        subscription = UserSubscription(**subscription_data)
    
    features = get_tier_features(subscription.tier)
    
    return SubscriptionResponse(
        subscription=subscription,
        features=features
    )

@api_router.post("/subscription/upgrade", response_model=SubscriptionResponse)
async def upgrade_subscription(
    subscription_update: SubscriptionUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """Upgrade user subscription (mock implementation - integrate with payment processor)"""
    
    # Get existing subscription
    subscription_data = await db.subscriptions.find_one({"user_id": current_user.id})
    
    if not subscription_data:
        # Create new subscription
        subscription = UserSubscription(user_id=current_user.id)
    else:
        subscription = UserSubscription(**subscription_data)
    
    # Update subscription details
    if subscription_update.tier:
        subscription.tier = subscription_update.tier
        
        # Set pricing based on tier
        tier_pricing = {
            UserTier.FREE: (0, 0),
            UserTier.PRO: (9999, 109990),
            UserTier.PREMIUM: (19999, 219990),
            UserTier.ENTERPRISE: (0, 0)  # Custom
        }
        
        monthly_price, annual_price = tier_pricing.get(subscription_update.tier, (0, 0))
        subscription.monthly_price = monthly_price
        subscription.annual_price = annual_price
        
        # Set trial period for paid tiers
        if subscription_update.tier != UserTier.FREE:
            subscription.status = SubscriptionStatus.TRIAL
            subscription.trial_ends_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    if subscription_update.is_annual is not None:
        subscription.is_annual = subscription_update.is_annual
    
    subscription.updated_at = datetime.now(timezone.utc)
    
    # Save to database
    subscription_dict = subscription.dict()
    subscription_dict["created_at"] = subscription_dict["created_at"].isoformat()
    subscription_dict["updated_at"] = subscription_dict["updated_at"].isoformat()
    if subscription_dict["trial_ends_at"]:
        subscription_dict["trial_ends_at"] = subscription_dict["trial_ends_at"].isoformat()
    if subscription_dict["expires_at"]:
        subscription_dict["expires_at"] = subscription_dict["expires_at"].isoformat()
    
    await db.subscriptions.update_one(
        {"user_id": current_user.id},
        {"$set": subscription_dict},
        upsert=True
    )
    
    # Update user profile tier
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"account_tier": subscription_update.tier.value}}
    )
    
    features = get_tier_features(subscription.tier)
    
    return SubscriptionResponse(
        subscription=subscription,
        features=features
    )

# ============================
# TRIAL SYSTEM API ENDPOINTS
# ============================

async def check_and_revert_expired_trials():
    """Check for expired trials and revert users to their original tier"""
    try:
        now = datetime.now(timezone.utc)
        
        # Find expired trials
        expired_trials = await db.user_trials.find({
            "status": "TRIAL_ACTIVE",
            "expires_at": {"$lt": now}
        }).to_list(length=None)
        
        for trial in expired_trials:
            # Update trial status
            await db.user_trials.update_one(
                {"id": trial["id"]},
                {"$set": {"status": "TRIAL_EXPIRED"}}
            )
            
            # Revert user to original tier
            await db.users.update_one(
                {"id": trial["user_id"]},
                {"$set": {"account_tier": trial["original_tier"]}}
            )
            
            # Update subscription
            await db.subscriptions.update_one(
                {"user_id": trial["user_id"]},
                {"$set": {
                    "tier": UserTier(trial["original_tier"]),
                    "is_trial_active": False,
                    "trial_ends_at": None
                }}
            )
            
        return len(expired_trials)
    except Exception as e:
        print(f"Error checking expired trials: {e}")
        return 0

# ============================
# MONETIZATION ANALYTICS HELPERS
# ============================

async def track_user_activity(user_id: str, activity: str):
    """Track user activity for analytics"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        # Update or create daily activity record
        await db.daily_activities.update_one(
            {"user_id": user_id, "date": today},
            {
                "$push": {"activities": activity},
                "$setOnInsert": {
                    "id": str(uuid.uuid4()),
                    "date": today,
                    "user_id": user_id,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
    except Exception as e:
        print(f"Error tracking user activity: {e}")

async def update_conversion_funnel(event_type: str):
    """Update conversion funnel data"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        update_field = {}
        if event_type == "registration":
            update_field = {"$inc": {"total_registrations": 1}}
        elif event_type == "demo_activation":
            update_field = {"$inc": {"demo_activations": 1}}
        elif event_type == "trial_activation":
            update_field = {"$inc": {"trial_activations": 1}}
        elif event_type == "trial_conversion":
            update_field = {"$inc": {"trial_conversions": 1}}
        elif event_type == "paid_user":
            update_field = {"$inc": {"total_paid_users": 1}}
        
        if update_field:
            await db.conversion_funnel.update_one(
                {"date": today},
                {
                    **update_field,
                    "$setOnInsert": {
                        "id": str(uuid.uuid4()),
                        "date": today,
                        "created_at": datetime.now(timezone.utc)
                    }
                },
                upsert=True
            )
    except Exception as e:
        print(f"Error updating conversion funnel: {e}")

async def track_ad_impression(ad_type: str, estimated_revenue: float = 0.001):
    """Track ad impression and revenue"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        impression_field = f"{ad_type}_impressions"
        
        # Update daily ad revenue data
        result = await db.ad_revenue.update_one(
            {"date": today},
            {
                "$inc": {
                    impression_field: 1,
                    "estimated_revenue": estimated_revenue
                },
                "$setOnInsert": {
                    "id": str(uuid.uuid4()),
                    "date": today,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        
        # Recalculate RPM
        ad_data = await db.ad_revenue.find_one({"date": today})
        if ad_data:
            total_impressions = (
                ad_data.get("banner_impressions", 0) + 
                ad_data.get("native_impressions", 0) + 
                ad_data.get("interstitial_impressions", 0) + 
                ad_data.get("rewarded_impressions", 0)
            )
            
            if total_impressions > 0:
                rpm = (ad_data.get("estimated_revenue", 0) / total_impressions) * 1000
                await db.ad_revenue.update_one(
                    {"date": today},
                    {"$set": {"rpm": rpm}}
                )
                
    except Exception as e:
        print(f"Error tracking ad impression: {e}")

# ============================
# ADD-ON MONETIZATION HELPERS
# ============================

async def get_tier_employee_limits():
    """Get employee limits for each tier"""
    return {
        UserTier.FREE: 5,
        UserTier.PRO: 15,
        UserTier.PREMIUM: 50,
        UserTier.ENTERPRISE: 999999  # Unlimited
    }

async def calculate_excess_employee_charge(user: UserProfile, employee_count: int, charge_per_run: bool = True):
    """Calculate charge for excess employees in bulk run"""
    tier, features = await get_user_effective_tier_and_features(user.id)
    
    # Admin users have unlimited access
    if user.admin_enabled and user.admin_role:
        return 0, 0, 0
    
    tier_limits = await get_tier_employee_limits()
    tier_limit = tier_limits.get(tier, 5)
    
    if employee_count <= tier_limit:
        return 0, 0, tier_limit  # No excess, no charge
    
    excess_employees = employee_count - tier_limit
    
    if charge_per_run:
        # ₦100 per employee per bulk run
        charge_amount = excess_employees * 100
    else:
        # ₦250 per employee per month (would be handled separately)
        charge_amount = excess_employees * 250
    
    return excess_employees, charge_amount, tier_limit

async def record_bulk_run_with_charges(user: UserProfile, run_type: str, employee_count: int):
    """Record bulk run and apply excess employee charges if needed"""
    try:
        excess_employees, charge_amount, tier_limit = await calculate_excess_employee_charge(user, employee_count)
        
        # Create bulk run record
        bulk_run = BulkRunRecord(
            user_id=user.id,
            run_type=run_type,
            employee_count=employee_count,
            excess_employees=excess_employees,
            tier_limit=tier_limit,
            auto_charge_applied=charge_amount > 0,
            charge_amount=charge_amount
        )
        
        await db.bulk_runs.insert_one(bulk_run.dict())
        
        # If there's a charge, record the add-on purchase
        if charge_amount > 0:
            addon_purchase = AddOnPurchase(
                user_id=user.id,
                addon_type=AddOnType.EXTRA_EMPLOYEE_PER_RUN,
                quantity=excess_employees,
                unit_price=100,
                total_amount=charge_amount,
                description=f"Extra {excess_employees} employees for {run_type} bulk run",
                auto_charged=True,
                bulk_run_id=bulk_run.id
            )
            
            await db.addon_purchases.insert_one(addon_purchase.dict())
        
        return {
            "bulk_run_id": bulk_run.id,
            "excess_employees": excess_employees,
            "charge_amount": charge_amount,
            "tier_limit": tier_limit
        }
        
    except Exception as e:
        print(f"Error recording bulk run: {e}")
        return None

async def charge_pdf_print(user: UserProfile):
    """Charge for PDF print (Free tier only)"""
    tier, features = await get_user_effective_tier_and_features(user.id)
    
    # Only charge Free tier users
    if tier != UserTier.FREE or not features.pdf_export:
        return None
    
    try:
        # Record PDF print charge
        addon_purchase = AddOnPurchase(
            user_id=user.id,
            addon_type=AddOnType.PDF_PRINT,
            quantity=1,
            unit_price=200,
            total_amount=200,
            description="PDF report generation",
            auto_charged=True
        )
        
        await db.addon_purchases.insert_one(addon_purchase.dict())
        
        return {
            "charge_amount": 200,
            "description": "PDF print charge applied"
        }
        
    except Exception as e:
        print(f"Error charging PDF print: {e}")
        return None

async def get_user_addon_balances(user_id: str):
    """Get user's add-on balances"""
    try:
        balances = await db.addon_balances.find({"user_id": user_id}).to_list(length=None)
        return {balance["addon_type"]: balance["balance"] for balance in balances}
    except Exception as e:
        print(f"Error getting addon balances: {e}")
        return {}

async def get_user_addon_purchases(user_id: str, days: int = 30):
    """Get user's recent add-on purchases"""
    try:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        purchases = await db.addon_purchases.find({
            "user_id": user_id,
            "created_at": {"$gte": start_date}
        }).sort("created_at", -1).to_list(length=None)
        
        return purchases
    except Exception as e:
        print(f"Error getting addon purchases: {e}")
        return []

async def get_device_info(request: Request):
    """Extract device/browser info for fingerprinting"""
    user_agent = request.headers.get('user-agent', '')
    client_ip = request.client.host
    
    # Simple fingerprint based on user agent and other headers
    fingerprint_data = f"{user_agent}-{request.headers.get('accept-language', '')}-{client_ip}"
    import hashlib
    device_fingerprint = hashlib.md5(fingerprint_data.encode()).hexdigest()[:16]
    
    return {
        "ip": client_ip,
        "fingerprint": device_fingerprint
    }

@api_router.get("/trial/status", response_model=TrialStatus_Response)
async def get_trial_status(
    request: Request,
    current_user: UserProfile = Depends(get_current_user)
):
    """Get user's trial status and availability"""
    
    # Get existing trial tracking
    trial_data = await db.trial_tracking.find_one({"user_id": current_user.id})
    
    if not trial_data:
        # No trial history - user can use both demo and trial
        return TrialStatus_Response(
            trial_available=True,
            demo_available=True,
            current_trial=None,
            days_remaining=None,
            trial_features=None
        )
    
    trial_tracking = TrialTracking(**trial_data)
    
    # Check if currently in active trial
    if trial_tracking.trial_status == TrialStatus.TRIAL_ACTIVE and trial_tracking.trial_ends_at:
        days_remaining = (trial_tracking.trial_ends_at - datetime.now(timezone.utc)).days
        
        if days_remaining > 0:
            # Active trial
            trial_features = get_tier_features(trial_tracking.trial_tier)
            return TrialStatus_Response(
                trial_available=False,
                demo_available=not trial_tracking.demo_used,
                current_trial=trial_tracking,
                days_remaining=days_remaining,
                trial_features=trial_features
            )
        else:
            # Trial expired - update status
            await db.trial_tracking.update_one(
                {"user_id": current_user.id},
                {"$set": {"trial_status": TrialStatus.TRIAL_EXPIRED.value}}
            )
            trial_tracking.trial_status = TrialStatus.TRIAL_EXPIRED
    
    # Determine availability based on status
    trial_available = trial_tracking.trial_status in [TrialStatus.NEVER_USED, TrialStatus.DEMO_USED]
    demo_available = not trial_tracking.demo_used
    
    return TrialStatus_Response(
        trial_available=trial_available,
        demo_available=demo_available,
        current_trial=trial_tracking if trial_tracking.trial_status == TrialStatus.TRIAL_ACTIVE else None,
        days_remaining=None,
        trial_features=None
    )

@api_router.post("/trial/start", response_model=TrialStatus_Response)
async def start_trial(
    trial_request: TrialStartRequest,
    request: Request,
    current_user: UserProfile = Depends(get_current_user)
):
    """Start a trial (demo or full trial)"""
    
    device_info = await get_device_info(request)
    
    # Get existing trial tracking
    trial_data = await db.trial_tracking.find_one({"user_id": current_user.id})
    
    if trial_data:
        trial_tracking = TrialTracking(**trial_data)
        
        # Abuse prevention checks
        if trial_request.trial_type == TrialType.FULL_TRIAL:
            if trial_tracking.trial_status not in [TrialStatus.NEVER_USED, TrialStatus.DEMO_USED]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Trial already used or active"
                )
        
        if trial_request.trial_type == TrialType.DEMO:
            if trial_tracking.demo_used:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Demo mode already used"
                )
    else:
        # Create new trial tracking
        trial_tracking = TrialTracking(
            user_id=current_user.id,
            email=current_user.email,
            phone=current_user.phone,
            device_fingerprint=device_info["fingerprint"],
            ip_addresses=[device_info["ip"]]
        )
    
    now = datetime.now(timezone.utc)
    
    if trial_request.trial_type == TrialType.DEMO:
        # Start demo mode
        trial_tracking.demo_used = True
        trial_tracking.demo_used_at = now
        if trial_tracking.trial_status == TrialStatus.NEVER_USED:
            trial_tracking.trial_status = TrialStatus.DEMO_USED
    
    elif trial_request.trial_type == TrialType.FULL_TRIAL:
        if not trial_request.trial_tier or trial_request.trial_tier not in [UserTier.PRO, UserTier.PREMIUM]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid trial tier. Must be PRO or PREMIUM"
            )
        
        # Start full trial
        trial_tracking.trial_status = TrialStatus.TRIAL_ACTIVE
        trial_tracking.trial_tier = trial_request.trial_tier
        trial_tracking.trial_started_at = now
        trial_tracking.trial_ends_at = now + timedelta(days=7)
        
        # Update user subscription to trial status
        subscription_data = await db.subscriptions.find_one({"user_id": current_user.id})
        
        if subscription_data:
            subscription = UserSubscription(**subscription_data)
        else:
            subscription = UserSubscription(user_id=current_user.id)
        
        # Store original tier and set trial tier
        subscription.original_tier = subscription.tier
        subscription.tier = trial_request.trial_tier
        subscription.status = SubscriptionStatus.TRIAL
        subscription.is_trial_active = True
        subscription.trial_ends_at = trial_tracking.trial_ends_at
        subscription.updated_at = now
        
        # Save subscription
        subscription_dict = subscription.dict()
        subscription_dict["created_at"] = subscription_dict["created_at"].isoformat()
        subscription_dict["updated_at"] = subscription_dict["updated_at"].isoformat()
        if subscription_dict["trial_ends_at"]:
            subscription_dict["trial_ends_at"] = subscription_dict["trial_ends_at"].isoformat()
        if subscription_dict["expires_at"]:
            subscription_dict["expires_at"] = subscription_dict["expires_at"].isoformat()
        
        await db.subscriptions.update_one(
            {"user_id": current_user.id},
            {"$set": subscription_dict},
            upsert=True
        )
        
        # Update user profile tier
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"account_tier": trial_request.trial_tier.value}}
        )
    
    # Update trial tracking
    trial_tracking.updated_at = now
    
    trial_dict = trial_tracking.dict()
    trial_dict["created_at"] = trial_dict["created_at"].isoformat()
    trial_dict["updated_at"] = trial_dict["updated_at"].isoformat()
    if trial_dict["demo_used_at"]:
        trial_dict["demo_used_at"] = trial_dict["demo_used_at"].isoformat()
    if trial_dict["trial_started_at"]:
        trial_dict["trial_started_at"] = trial_dict["trial_started_at"].isoformat()
    if trial_dict["trial_ends_at"]:
        trial_dict["trial_ends_at"] = trial_dict["trial_ends_at"].isoformat()
    
    await db.trial_tracking.update_one(
        {"user_id": current_user.id},
        {"$set": trial_dict},
        upsert=True
    )
    
    # Return updated status
    if trial_request.trial_type == TrialType.FULL_TRIAL:
        trial_features = get_tier_features(trial_request.trial_tier)
        days_remaining = 7
    else:
        trial_features = None
        days_remaining = None
    
    return TrialStatus_Response(
        trial_available=trial_request.trial_type == TrialType.DEMO,
        demo_available=trial_request.trial_type == TrialType.FULL_TRIAL,
        current_trial=trial_tracking if trial_request.trial_type == TrialType.FULL_TRIAL else None,
        days_remaining=days_remaining,
        trial_features=trial_features
    )

@api_router.post("/trial/demo-calculation")
async def perform_demo_calculation(
    calculation_data: dict,
    current_user: UserProfile = Depends(get_current_user)
):
    """Perform a one-time demo calculation (Pro-level features, no download)"""
    
    # Check if demo is available
    trial_data = await db.trial_tracking.find_one({"user_id": current_user.id})
    
    if trial_data:
        trial_tracking = TrialTracking(**trial_data)
        if trial_tracking.demo_used:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Demo mode already used. Please start a full trial or upgrade."
            )
    
    # TODO: Integrate with existing calculation logic
    # This would call the existing PAYE/CIT calculation functions
    # but mark the result as demo-only (no PDF generation)
    
    demo_calc = DemoCalculation(
        calculation_type=calculation_data.get("type", "paye"),
        input_data=calculation_data,
        result_data={"demo": True, "message": "This is a demo calculation"}
    )
    
    return {
        "demo": True,
        "calculation": demo_calc.dict(),
        "message": "Demo calculation completed. Start a 7-day trial for full features including PDF download."
    }

@api_router.post("/trial/end")
async def end_trial(
    current_user: UserProfile = Depends(get_current_user)
):
    """End active trial and revert to original tier"""
    
    # Get trial tracking
    trial_data = await db.trial_tracking.find_one({"user_id": current_user.id})
    
    if not trial_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No trial found"
        )
    
    trial_tracking = TrialTracking(**trial_data)
    
    if trial_tracking.trial_status != TrialStatus.TRIAL_ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active trial to end"
        )
    
    # Update trial status
    await db.trial_tracking.update_one(
        {"user_id": current_user.id},
        {"$set": {
            "trial_status": TrialStatus.TRIAL_EXPIRED.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Revert subscription
    subscription_data = await db.subscriptions.find_one({"user_id": current_user.id})
    
    if subscription_data:
        subscription = UserSubscription(**subscription_data)
        
        # Revert to original tier
        original_tier = subscription.original_tier or UserTier.FREE
        subscription.tier = original_tier
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.is_trial_active = False
        subscription.trial_ends_at = None
        subscription.updated_at = datetime.now(timezone.utc)
        
        # Save subscription
        subscription_dict = subscription.dict()
        subscription_dict["created_at"] = subscription_dict["created_at"].isoformat()
        subscription_dict["updated_at"] = subscription_dict["updated_at"].isoformat()
        if subscription_dict["expires_at"]:
            subscription_dict["expires_at"] = subscription_dict["expires_at"].isoformat()
        
        await db.subscriptions.update_one(
            {"user_id": current_user.id},
            {"$set": subscription_dict}
        )
        
        # Update user profile
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"account_tier": original_tier.value}}
        )
    
    return {"message": "Trial ended successfully", "reverted_to": original_tier.value}

# ============================
# ADS & MONETIZATION API ENDPOINTS
# ============================

async def get_or_create_ad_frequency_tracking(user_id: str):
    """Get or create ad frequency tracking for user"""
    # Calculate start of current week (Monday)
    now = datetime.now(timezone.utc)
    days_since_monday = now.weekday()
    week_start = (now - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Try to find existing tracking for this week
    tracking_data = await db.ad_frequency.find_one({
        "user_id": user_id,
        "week_start": {"$gte": week_start.isoformat()}
    })
    
    if tracking_data:
        return AdFrequencyTracking(**tracking_data)
    
    # Create new tracking for this week
    tracking = AdFrequencyTracking(
        user_id=user_id,
        week_start=week_start
    )
    
    tracking_dict = tracking.dict()
    tracking_dict["week_start"] = tracking_dict["week_start"].isoformat()
    tracking_dict["created_at"] = tracking_dict["created_at"].isoformat()
    tracking_dict["updated_at"] = tracking_dict["updated_at"].isoformat()
    if tracking_dict["last_interstitial_at"]:
        tracking_dict["last_interstitial_at"] = tracking_dict["last_interstitial_at"].isoformat()
    
    await db.ad_frequency.insert_one(tracking_dict)
    return tracking

async def should_show_ads(user: UserProfile) -> bool:
    """Determine if ads should be shown based on user tier"""
    # Get current subscription
    subscription_data = await db.subscriptions.find_one({"user_id": user.id})
    
    if subscription_data:
        subscription = UserSubscription(**subscription_data)
        
        # If in active trial, use trial tier to determine ads
        if subscription.is_trial_active and subscription.trial_ends_at:
            if datetime.now(timezone.utc) < subscription.trial_ends_at:
                # In active trial - no ads for Pro/Premium trials
                return subscription.tier == UserTier.FREE
        
        # Use regular subscription tier
        return subscription.tier == UserTier.FREE
    
    # No subscription found - default to FREE tier (show ads)
    return user.account_tier == UserTier.FREE

@api_router.get("/ads/status", response_model=AdStatusResponse)
async def get_ad_status(
    request: Request,
    current_user: UserProfile = Depends(get_current_user)
):
    """Get user's ad status and frequency tracking"""
    
    # Check if ads should be enabled
    ads_enabled = await should_show_ads(current_user)
    
    # Get frequency tracking
    tracking = await get_or_create_ad_frequency_tracking(current_user.id)
    
    # Calculate remaining rewarded ads
    max_rewarded = 2  # As per requirements
    rewarded_remaining = max(0, max_rewarded - tracking.rewarded_ads_this_week)
    
    # Calculate calculations until next interstitial
    interstitial_frequency = 10  # As per requirements
    calculations_until_interstitial = max(0, interstitial_frequency - tracking.calculations_since_interstitial)
    
    ad_config = AdConfig()
    
    return AdStatusResponse(
        ads_enabled=ads_enabled,
        can_show_rewarded=(ads_enabled and rewarded_remaining > 0),
        rewarded_ads_remaining=rewarded_remaining,
        calculations_until_interstitial=calculations_until_interstitial,
        ad_config=ad_config,
        extra_runs_available=tracking.extra_bulk_runs,
        extra_cit_available=tracking.extra_cit_calcs
    )

@api_router.post("/ads/impression")
async def record_ad_impression(
    ad_type: AdType,
    ad_placement: AdPlacement,
    request: Request,
    current_user: UserProfile = Depends(get_current_user),
    clicked: bool = False,
    revenue: Optional[float] = None
):
    """Record an ad impression"""
    
    impression = AdImpression(
        user_id=current_user.id,
        ad_type=ad_type,
        ad_placement=ad_placement,
        ad_network="mock",  # Would be real ad network in production
        ad_unit_id=f"test-{ad_placement.value}",
        revenue=revenue,
        clicked=clicked,
        user_agent=request.headers.get('user-agent'),
        ip_address=request.client.host
    )
    
    impression_dict = impression.dict()
    impression_dict["timestamp"] = impression_dict["timestamp"].isoformat()
    
    await db.ad_impressions.insert_one(impression_dict)
    
    return {"message": "Ad impression recorded", "impression_id": impression.id}

@api_router.post("/ads/calculation")
async def record_calculation_for_ads(
    calculation_type: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Record a calculation for ad frequency tracking"""
    
    # Only track for users who have ads enabled
    ads_enabled = await should_show_ads(current_user)
    if not ads_enabled:
        return {"message": "Ad tracking not applicable for this user tier"}
    
    # Get frequency tracking
    tracking = await get_or_create_ad_frequency_tracking(current_user.id)
    
    # Increment calculation counter
    tracking.calculations_since_interstitial += 1
    tracking.updated_at = datetime.now(timezone.utc)
    
    # Check if interstitial should be shown
    show_interstitial = False
    if tracking.calculations_since_interstitial >= 10:  # Every 10th calculation
        show_interstitial = True
        tracking.calculations_since_interstitial = 0
        tracking.last_interstitial_at = datetime.now(timezone.utc)
    
    # Save tracking
    tracking_dict = tracking.dict()
    tracking_dict["week_start"] = tracking_dict["week_start"].isoformat()
    tracking_dict["created_at"] = tracking_dict["created_at"].isoformat()
    tracking_dict["updated_at"] = tracking_dict["updated_at"].isoformat()
    if tracking_dict["last_interstitial_at"]:
        tracking_dict["last_interstitial_at"] = tracking_dict["last_interstitial_at"].isoformat()
    
    await db.ad_frequency.update_one(
        {"user_id": current_user.id},
        {"$set": tracking_dict}
    )
    
    return {
        "show_interstitial": show_interstitial,
        "calculations_until_next": 10 - tracking.calculations_since_interstitial if not show_interstitial else 10
    }

@api_router.post("/ads/impression")
async def record_ad_impression(
    ad_type: str,
    ad_placement: str,
    clicked: bool = False,
    current_user: UserProfile = Depends(get_current_user)
):
    """Record ad impression for analytics"""
    try:
        # Track ad impression for analytics
        await track_ad_impression(ad_type)
        
        # Record detailed impression data
        impression_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "ad_type": ad_type,
            "ad_placement": ad_placement,
            "clicked": clicked,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.ad_impressions.insert_one(impression_data)
        
        return {"recorded": True}
    except Exception as e:
        print(f"Error recording ad impression: {e}")
        return {"recorded": False}

# ============================
# ADD-ON MONETIZATION ENDPOINTS
# ============================

@api_router.get("/addons/pricing")
async def get_addon_pricing():
    """Get pricing for all add-on services"""
    return {
        "extra_employees": {
            "monthly_rate": 250,  # ₦250 per employee per month
            "per_run_rate": 100,  # ₦100 per employee per bulk run
            "description": "Additional employees beyond your plan's limit"
        },
        "pdf_print": {
            "rate": 200,  # ₦200 per print
            "description": "PDF report generation (Free tier only)",
            "applies_to": ["FREE"]
        },
        "compliance_review": {
            "rate": 25000,  # ₦25,000 per review
            "description": "One-off compliance report review",
            "applies_to": ["FREE", "PRO", "PREMIUM_EXPEDITED"]
        }
    }

@api_router.get("/addons/user/balances")
async def get_user_addon_balances(current_user: UserProfile = Depends(get_current_user)):
    """Get user's add-on balances and recent purchases"""
    try:
        balances = await get_user_addon_balances(current_user.id)
        recent_purchases = await get_user_addon_purchases(current_user.id, 30)
        
        # Calculate monthly stats
        monthly_stats = {}
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        
        for purchase in recent_purchases:
            if purchase["created_at"].strftime("%Y-%m") == current_month:
                addon_type = purchase["addon_type"]
                if addon_type not in monthly_stats:
                    monthly_stats[addon_type] = {"quantity": 0, "amount": 0}
                monthly_stats[addon_type]["quantity"] += purchase["quantity"]
                monthly_stats[addon_type]["amount"] += purchase["total_amount"]
        
        return {
            "balances": balances,
            "recent_purchases": recent_purchases[:10],  # Last 10 purchases
            "monthly_stats": monthly_stats
        }
    except Exception as e:
        print(f"Error getting user addon balances: {e}")
        raise HTTPException(status_code=500, detail="Failed to get addon balances")

@api_router.post("/addons/compliance-review/request")
async def request_compliance_review(
    review_type: str,
    description: str,
    is_expedited: bool = False,
    current_user: UserProfile = Depends(get_current_user)
):
    """Request compliance report review"""
    try:
        tier, features = await get_user_effective_tier_and_features(current_user.id)
        
        # Check eligibility
        if tier == UserTier.ENTERPRISE:
            raise HTTPException(status_code=400, detail="Enterprise customers should contact support directly")
        
        if tier == UserTier.PREMIUM and not is_expedited:
            raise HTTPException(status_code=400, detail="Premium users have compliance support included. Use expedited option for faster service.")
        
        # Create compliance review request
        review_request = ComplianceReviewRequest(
            user_id=current_user.id,
            review_type=review_type,
            description=description,
            is_expedited=is_expedited,
            amount_paid=25000
        )
        
        await db.compliance_reviews.insert_one(review_request.dict())
        
        # Record the purchase
        addon_purchase = AddOnPurchase(
            user_id=current_user.id,
            addon_type=AddOnType.COMPLIANCE_REVIEW,
            quantity=1,
            unit_price=25000,
            total_amount=25000,
            description=f"Compliance review: {review_type}" + (" (Expedited)" if is_expedited else ""),
            auto_charged=False
        )
        
        await db.addon_purchases.insert_one(addon_purchase.dict())
        
        return {
            "review_id": review_request.id,
            "amount": 25000,
            "status": "pending",
            "message": "Compliance review request submitted successfully"
        }
        
    except Exception as e:
        print(f"Error requesting compliance review: {e}")
        raise HTTPException(status_code=500, detail="Failed to request compliance review")

@api_router.get("/addons/bulk-run/preview-charges")
async def preview_bulk_run_charges(
    employee_count: int,
    current_user: UserProfile = Depends(get_current_user)
):
    """Preview charges for bulk run with given employee count"""
    try:
        excess_employees, charge_amount, tier_limit = await calculate_excess_employee_charge(
            current_user, employee_count
        )
        
        return {
            "employee_count": employee_count,
            "tier_limit": tier_limit,
            "excess_employees": excess_employees,
            "charge_per_employee": 100,
            "total_charge": charge_amount,
            "within_limit": excess_employees == 0
        }
    except Exception as e:
        print(f"Error previewing bulk run charges: {e}")
        raise HTTPException(status_code=500, detail="Failed to preview charges")

@api_router.post("/ads/rewarded/request")
async def request_rewarded_ad(
    reward_request: RewardedAdRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """Request a rewarded ad to unlock extra features"""
    
    # Check if ads are enabled
    ads_enabled = await should_show_ads(current_user)
    if not ads_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rewarded ads not available for your tier"
        )
    
    # Get frequency tracking
    tracking = await get_or_create_ad_frequency_tracking(current_user.id)
    
    # Check weekly limit
    if tracking.rewarded_ads_this_week >= 2:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Weekly rewarded ad limit reached (2 per week)"
        )
    
    # Validate reward type
    if reward_request.reward_type not in ["bulk_run", "cit_calc"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reward type. Must be 'bulk_run' or 'cit_calc'"
        )
    
    return {
        "ad_available": True,
        "reward_type": reward_request.reward_type,
        "ad_unit_id": "ca-app-pub-test/rewarded",
        "message": f"Watch ad to unlock one extra {reward_request.reward_type.replace('_', ' ')}"
    }

@api_router.post("/ads/rewarded/complete")
async def complete_rewarded_ad(
    completion: RewardedAdCompletion,
    current_user: UserProfile = Depends(get_current_user)
):
    """Complete a rewarded ad and grant the reward"""
    
    # Verify the request is for the current user
    if completion.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid user ID"
        )
    
    # Get frequency tracking
    tracking = await get_or_create_ad_frequency_tracking(current_user.id)
    
    # Check if reward can be granted
    if tracking.rewarded_ads_this_week >= 2:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Weekly rewarded ad limit already reached"
        )
    
    # Grant reward
    if completion.reward_type == "bulk_run":
        tracking.extra_bulk_runs += 1
    elif completion.reward_type == "cit_calc":
        tracking.extra_cit_calcs += 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reward type"
        )
    
    # Update tracking
    tracking.rewarded_ads_this_week += 1
    tracking.updated_at = datetime.now(timezone.utc)
    
    # Save to database
    tracking_dict = tracking.dict()
    tracking_dict["week_start"] = tracking_dict["week_start"].isoformat()
    tracking_dict["created_at"] = tracking_dict["created_at"].isoformat()
    tracking_dict["updated_at"] = tracking_dict["updated_at"].isoformat()
    if tracking_dict["last_interstitial_at"]:
        tracking_dict["last_interstitial_at"] = tracking_dict["last_interstitial_at"].isoformat()
    
    await db.ad_frequency.update_one(
        {"user_id": current_user.id},
        {"$set": tracking_dict},
        upsert=True
    )
    
    # Record the ad impression
    impression = AdImpression(
        user_id=current_user.id,
        ad_type=AdType.REWARDED,
        ad_placement=AdPlacement.REWARDED_UNLOCK,
        ad_network=completion.ad_network,
        ad_unit_id=completion.ad_unit_id,
        watched_to_completion=completion.reward_granted
    )
    
    impression_dict = impression.dict()
    impression_dict["timestamp"] = impression_dict["timestamp"].isoformat()
    
    await db.ad_impressions.insert_one(impression_dict)
    
    return {
        "reward_granted": True,
        "reward_type": completion.reward_type,
        "message": f"Reward granted! You now have an extra {completion.reward_type.replace('_', ' ')} available.",
        "remaining_ads_this_week": 2 - tracking.rewarded_ads_this_week
    }

@api_router.post("/ads/use-reward")
async def use_reward(
    reward_type: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """Use a rewarded ad unlock (bulk run or CIT calc)"""
    
    # Get frequency tracking
    tracking = await get_or_create_ad_frequency_tracking(current_user.id)
    
    if reward_type == "bulk_run":
        if tracking.extra_bulk_runs <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No extra bulk runs available"
            )
        tracking.extra_bulk_runs -= 1
    elif reward_type == "cit_calc":
        if tracking.extra_cit_calcs <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No extra CIT calculations available"
            )
        tracking.extra_cit_calcs -= 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reward type"
        )
    
    # Update tracking
    tracking.updated_at = datetime.now(timezone.utc)
    
    # Save to database
    tracking_dict = tracking.dict()
    tracking_dict["week_start"] = tracking_dict["week_start"].isoformat()
    tracking_dict["created_at"] = tracking_dict["created_at"].isoformat()
    tracking_dict["updated_at"] = tracking_dict["updated_at"].isoformat()
    if tracking_dict["last_interstitial_at"]:
        tracking_dict["last_interstitial_at"] = tracking_dict["last_interstitial_at"].isoformat()
    
    await db.ad_frequency.update_one(
        {"user_id": current_user.id},
        {"$set": tracking_dict}
    )
    
    return {
        "reward_used": True,
        "reward_type": reward_type,
        "remaining": tracking.extra_bulk_runs if reward_type == "bulk_run" else tracking.extra_cit_calcs
    }

# Include the router in the main app
app.include_router(api_router)

# ============================
# INTEGRATION MANAGER API ENDPOINTS
# ============================

integration_router = APIRouter(prefix="/api/admin/integrations", tags=["integrations"])

# Mock integration data structure
MOCK_INTEGRATIONS = {
    "payments": {
        "stripe": {
            "name": "Stripe",
            "description": "Global payment processing platform",
            "status": "disconnected",
            "environment": "sandbox",
            "config": {"publishable_key": "", "secret_key": "", "webhook_secret": "", "currency": "NGN"},
            "endpoints": {"base_url": "https://api.stripe.com/v1", "webhook_url": "/api/webhooks/stripe"},
            "features": ["Subscriptions", "Cards", "Bank Transfers", "Webhooks"],
            "lastSync": None,
            "requestCount": 0,
            "errorCount": 0
        },
        "paystack": {
            "name": "Paystack",
            "description": "African payment gateway",
            "status": "connected",
            "environment": "sandbox",
            "config": {"public_key": "pk_test_***", "secret_key": "sk_test_***", "webhook_secret": "***"},
            "endpoints": {"base_url": "https://api.paystack.co", "webhook_url": "/api/webhooks/paystack"},
            "features": ["Cards", "Bank Transfer", "USSD", "QR Code"],
            "lastSync": "2024-01-15T10:30:00Z",
            "requestCount": 1247,
            "errorCount": 3
        },
    },
    "communications": {
        "sendgrid": {
            "name": "SendGrid",
            "description": "Email delivery service",
            "status": "connected",
            "environment": "production",
            "config": {"api_key": "SG.***", "from_email": "noreply@fiquantconsult.com", "from_name": "Fiquant TaxPro"},
            "endpoints": {"base_url": "https://api.sendgrid.com/v3", "webhook_url": "/api/webhooks/sendgrid"},
            "features": ["Transactional Email", "Marketing Campaigns", "Analytics"],
            "lastSync": "2024-01-15T09:45:00Z",
            "requestCount": 892,
            "errorCount": 1
        },
        "mailgun": {
            "name": "Mailgun",
            "description": "Email automation service (Backup)",
            "status": "standby",
            "environment": "production",
            "config": {"api_key": "", "domain": "", "from_email": "noreply@fiquantconsult.com"},
            "endpoints": {"base_url": "https://api.mailgun.net/v3", "webhook_url": "/api/webhooks/mailgun"},
            "features": ["Email Sending", "Email Validation", "Analytics"],
            "lastSync": None,
            "requestCount": 0,
            "errorCount": 0
        },
    },
    "analytics": {
        "google_analytics": {
            "name": "Google Analytics",
            "description": "Web analytics service",
            "status": "connected",
            "environment": "production",
            "config": {"tracking_id": "GA4-***", "measurement_id": "G-***", "api_secret": "***"},
            "endpoints": {"base_url": "https://www.google-analytics.com", "api_url": "https://analyticsreporting.googleapis.com/v4"},
            "features": ["Page Views", "Events", "Conversions", "Real-time"],
            "lastSync": "2024-01-15T11:00:00Z",
            "requestCount": 2341,
            "errorCount": 0
        },
    }
}

@integration_router.get("/")
async def get_integrations(admin_user: dict = Depends(get_admin_middleware)):
    """Get all integration configurations"""
    try:
        # Check if user is super admin
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can access integrations")
        
        return MOCK_INTEGRATIONS
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting integrations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get integrations")

@integration_router.post("/{category}/{service}/toggle")
async def toggle_integration(
    category: str,
    service: str,
    request_data: dict,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Enable/disable an integration"""
    try:
        # Check if user is super admin
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can modify integrations")
        
        if category not in MOCK_INTEGRATIONS or service not in MOCK_INTEGRATIONS[category]:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        enabled = request_data.get("enabled", False)
        MOCK_INTEGRATIONS[category][service]["status"] = "connected" if enabled else "disconnected"
        MOCK_INTEGRATIONS[category][service]["lastSync"] = datetime.now(timezone.utc).isoformat() if enabled else None
        
        # Record activity log
        log_entry = {
            "id": str(uuid.uuid4()),
            "service": service,
            "category": category,
            "event": "integration_enabled" if enabled else "integration_disabled",
            "status": "success",
            "message": f"{MOCK_INTEGRATIONS[category][service]['name']} {'enabled' if enabled else 'disabled'} by admin",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "admin_id": admin_user["id"]
        }
        
        await db.integration_logs.insert_one(log_entry)
        
        return {"message": f"Integration {'enabled' if enabled else 'disabled'} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error toggling integration: {e}")
        raise HTTPException(status_code=500, detail="Failed to toggle integration")

@integration_router.post("/{category}/{service}/config")
async def update_integration_config(
    category: str,
    service: str,
    config_data: dict,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Update integration configuration"""
    try:
        # Check if user is super admin
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can modify integrations")
        
        if category not in MOCK_INTEGRATIONS or service not in MOCK_INTEGRATIONS[category]:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Update configuration (mock - in production this would be encrypted and stored securely)
        MOCK_INTEGRATIONS[category][service]["config"].update(config_data)
        
        # Record activity log
        log_entry = {
            "id": str(uuid.uuid4()),
            "service": service,
            "category": category,
            "event": "config_updated",
            "status": "success",
            "message": f"{MOCK_INTEGRATIONS[category][service]['name']} configuration updated by admin",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "admin_id": admin_user["id"]
        }
        
        await db.integration_logs.insert_one(log_entry)
        
        return {"message": "Configuration updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update configuration")

@integration_router.post("/{category}/{service}/test")
async def test_integration_connection(
    category: str,
    service: str,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Test integration connection"""
    try:
        # Check if user is super admin
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can test integrations")
        
        if category not in MOCK_INTEGRATIONS or service not in MOCK_INTEGRATIONS[category]:
            raise HTTPException(status_code=404, detail="Integration not found")
        
        # Mock connection test (in production this would make actual API calls)
        MOCK_INTEGRATIONS[category][service]["lastSync"] = datetime.now(timezone.utc).isoformat()
        MOCK_INTEGRATIONS[category][service]["status"] = "connected"
        
        # Record activity log
        log_entry = {
            "id": str(uuid.uuid4()),
            "service": service,
            "category": category,
            "event": "connection_test",
            "status": "success",
            "message": f"{MOCK_INTEGRATIONS[category][service]['name']} connection test successful",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "admin_id": admin_user["id"]
        }
        
        await db.integration_logs.insert_one(log_entry)
        
        return {"message": "Connection test successful", "status": "connected"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error testing connection: {e}")
        # Record failure log
        log_entry = {
            "id": str(uuid.uuid4()),
            "service": service,
            "category": category,
            "event": "connection_test",
            "status": "error",
            "message": f"{MOCK_INTEGRATIONS[category][service]['name']} connection test failed: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "admin_id": admin_user["id"]
        }
        await db.integration_logs.insert_one(log_entry)
        raise HTTPException(status_code=500, detail="Connection test failed")

@integration_router.get("/logs")
async def get_integration_logs(
    limit: int = 50,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get integration activity logs"""
    try:
        # Check if user is super admin
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can view integration logs")
        
        # Get logs from database
        logs = await db.integration_logs.find().sort("timestamp", -1).limit(limit).to_list(length=None)
        
        # If no logs exist, return mock data
        if not logs:
            mock_logs = [
                {
                    "id": str(uuid.uuid4()),
                    "service": "paystack",
                    "category": "payments",
                    "event": "webhook_received",
                    "status": "success",
                    "message": "Payment successful webhook processed",
                    "timestamp": "2024-01-15T11:30:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "service": "sendgrid",
                    "category": "communications",
                    "event": "email_sent",
                    "status": "success",
                    "message": "Welcome email sent to user@example.com",
                    "timestamp": "2024-01-15T11:15:00Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "service": "stripe",
                    "category": "payments",
                    "event": "api_call",
                    "status": "error",
                    "message": "Authentication failed - invalid API key",
                    "timestamp": "2024-01-15T10:45:00Z"
                }
            ]
            return mock_logs
        
        return logs
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting integration logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get logs")

app.include_router(integration_router)

# ============================
# MESSAGING SYSTEM API ENDPOINTS
# ============================

messaging_router = APIRouter(prefix="/api/admin/messaging", tags=["messaging"])

# Template Management
@messaging_router.get("/templates")
async def get_message_templates(admin_user: dict = Depends(get_admin_middleware)):
    """Get all message templates"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        templates = await db.message_templates.find({"is_active": True}).to_list(length=None)
        return templates
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to get templates")

@messaging_router.post("/templates")
async def create_message_template(
    template_data: dict,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Create a new message template"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        template = MessageTemplate(
            name=template_data["name"],
            channel=MessageChannel(template_data["channel"]),
            subject_template=template_data.get("subject_template"),
            body_template=template_data["body_template"],
            merge_tags=template_data.get("merge_tags", []),
            need_approval=template_data.get("need_approval", False),
            created_by=admin_user["id"]
        )
        
        template_dict = template.dict()
        template_dict["created_at"] = template_dict["created_at"].isoformat()
        template_dict["updated_at"] = template_dict["updated_at"].isoformat()
        
        await db.message_templates.insert_one(template_dict)
        
        return {"message": "Template created successfully", "template_id": template.id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating template: {e}")
        raise HTTPException(status_code=500, detail="Failed to create template")

# User Segmentation
@messaging_router.get("/segments")
async def get_user_segments(admin_user: dict = Depends(get_admin_middleware)):
    """Get all user segments"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        segments = await db.user_segments.find().to_list(length=None)
        return segments
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting segments: {e}")
        raise HTTPException(status_code=500, detail="Failed to get segments")

@messaging_router.post("/segments")
async def create_user_segment(
    segment_data: dict,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Create a new user segment"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Calculate estimated count based on filters
        estimated_count = await calculate_segment_count(segment_data["filters_json"])
        
        segment = UserSegment(
            name=segment_data["name"],
            description=segment_data.get("description", ""),
            filters_json=segment_data["filters_json"],
            created_by=admin_user["id"],
            estimated_count=estimated_count
        )
        
        segment_dict = segment.dict()
        segment_dict["created_at"] = segment_dict["created_at"].isoformat()
        
        await db.user_segments.insert_one(segment_dict)
        
        return {"message": "Segment created successfully", "segment_id": segment.id, "estimated_count": estimated_count}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating segment: {e}")
        raise HTTPException(status_code=500, detail="Failed to create segment")

async def calculate_segment_count(filters: dict) -> int:
    """Calculate estimated user count for segment filters"""
    try:
        query = {}
        
        # Tier filter
        if "tier" in filters:
            query["account_tier"] = {"$in": filters["tier"]}
        
        # Trial status filter  
        if "trial_status" in filters:
            if "active" in filters["trial_status"]:
                # Users with active trials
                subscription_users = await db.subscriptions.find({
                    "is_trial_active": True,
                    "trial_ends_at": {"$gt": datetime.now(timezone.utc).isoformat()}
                }).to_list(length=None)
                trial_user_ids = [sub["user_id"] for sub in subscription_users]
                query["id"] = {"$in": trial_user_ids}
        
        # Last active filter
        if "last_active_days" in filters:
            days = filters["last_active_days"]
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
            query["last_login"] = {"$gte": cutoff_date.isoformat()}
        
        count = await db.users.count_documents(query)
        return count
    except Exception as e:
        print(f"Error calculating segment count: {e}")
        return 0

# Message Campaigns
@messaging_router.get("/campaigns")
async def get_message_campaigns(admin_user: dict = Depends(get_admin_middleware)):
    """Get all message campaigns"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer", "auditor"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        campaigns = await db.messages.find().sort("created_at", -1).to_list(length=None)
        return campaigns
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting campaigns: {e}")
        raise HTTPException(status_code=500, detail="Failed to get campaigns")

@messaging_router.post("/campaigns")
async def create_message_campaign(
    campaign_data: dict,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Create a new message campaign"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        message = Message(
            campaign_name=campaign_data["campaign_name"],
            channel=MessageChannel(campaign_data["channel"]),
            template_id=campaign_data.get("template_id"),
            subject_template=campaign_data.get("subject_template"),
            body_template=campaign_data["body_template"],
            segment_id=campaign_data.get("segment_id"),
            target_user_ids=campaign_data.get("target_user_ids", []),
            scheduled_at=datetime.fromisoformat(campaign_data["scheduled_at"]) if campaign_data.get("scheduled_at") else None,
            need_approval=campaign_data.get("need_approval", False),
            created_by=admin_user["id"]
        )
        
        message_dict = message.dict()
        message_dict["created_at"] = message_dict["created_at"].isoformat()
        if message_dict["scheduled_at"]:
            message_dict["scheduled_at"] = message_dict["scheduled_at"].isoformat()
        
        await db.messages.insert_one(message_dict)
        
        return {"message": "Campaign created successfully", "campaign_id": message.id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to create campaign")

# Mock Message Sending
@messaging_router.post("/campaigns/{campaign_id}/send")
async def send_message_campaign(
    campaign_id: str,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Send a message campaign (mock implementation)"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Get campaign
        campaign = await db.messages.find_one({"id": campaign_id})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        # Mock sending process
        await db.messages.update_one(
            {"id": campaign_id},
            {"$set": {
                "status": MessageStatus.SENDING.value,
                "sent_count": 0
            }}
        )
        
        # Simulate successful send
        mock_sent_count = 25  # Mock number
        await db.messages.update_one(
            {"id": campaign_id},
            {"$set": {
                "status": MessageStatus.SENT.value,
                "sent_count": mock_sent_count
            }}
        )
        
        return {"message": "Campaign sent successfully", "sent_count": mock_sent_count}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending campaign: {e}")
        raise HTTPException(status_code=500, detail="Failed to send campaign")

# Compliance Reminders
@messaging_router.get("/compliance-reminders")
async def get_compliance_reminders(admin_user: dict = Depends(get_admin_middleware)):
    """Get all compliance reminders"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        reminders = await db.compliance_reminders.find({"is_active": True}).to_list(length=None)
        return reminders
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting compliance reminders: {e}")
        raise HTTPException(status_code=500, detail="Failed to get compliance reminders")

@messaging_router.post("/compliance-reminders")
async def create_compliance_reminder(
    reminder_data: dict,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Create a new compliance reminder"""
    try:
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can create compliance reminders")
        
        reminder = ComplianceReminder(
            title=reminder_data["title"],
            description=reminder_data["description"],
            due_date=datetime.fromisoformat(reminder_data["due_date"]),
            reminder_days=reminder_data.get("reminder_days", [7, 3, 1]),
            applicable_tiers=[UserTier(tier) for tier in reminder_data.get("applicable_tiers", ["premium", "enterprise"])],
            message_template_id=reminder_data["message_template_id"]
        )
        
        reminder_dict = reminder.dict()
        reminder_dict["created_at"] = reminder_dict["created_at"].isoformat()
        reminder_dict["due_date"] = reminder_dict["due_date"].isoformat()
        
        await db.compliance_reminders.insert_one(reminder_dict)
        
        return {"message": "Compliance reminder created successfully", "reminder_id": reminder.id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating compliance reminder: {e}")
        raise HTTPException(status_code=500, detail="Failed to create compliance reminder")

# Analytics
@messaging_router.get("/analytics/dashboard")
async def get_messaging_analytics(admin_user: dict = Depends(get_admin_middleware)):
    """Get messaging analytics dashboard"""
    try:
        if admin_user.get("admin_role") not in ["super_admin", "marketer", "auditor"]:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Mock analytics data
        analytics = {
            "total_campaigns": await db.messages.count_documents({}),
            "total_sent": 1250,
            "delivery_rate": 96.5,
            "open_rate": 24.3,
            "click_rate": 3.8,
            "recent_campaigns": [
                {
                    "campaign_name": "Tax Filing Reminder - January 2024",
                    "channel": "email",
                    "sent_count": 245,
                    "delivery_rate": 98.0,
                    "open_rate": 32.1,
                    "sent_at": "2024-01-15T10:00:00Z"
                },
                {
                    "campaign_name": "Premium Upgrade Offer",
                    "channel": "sms",
                    "sent_count": 89,
                    "delivery_rate": 94.4,
                    "sent_at": "2024-01-10T14:30:00Z"
                }
            ]
        }
        
        return analytics
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting messaging analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics")

app.include_router(messaging_router)

# Security middleware (order matters - last added is first executed)
app.add_middleware(SecurityAuditMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests=100, window_seconds=60)
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://nigeriapaye.preview.emergentagent.com",
        os.environ.get("FRONTEND_URL", "https://your-vercel-app.vercel.app")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ============================
# ADMIN API ENDPOINTS
# ============================

admin_router = APIRouter(prefix="/api/admin", tags=["admin"])

@admin_router.get("/users")
async def get_all_users(
    request: Request,
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get all users with pagination and filtering"""
    try:
        # Log admin action
        audit_log = log_admin_action(
            admin_user["id"], admin_user["email"], "view_users", "user",
            details={"page": page, "limit": limit, "search": search, "status_filter": status_filter},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        if audit_log:
            await db.audit_logs.insert_one(audit_log.dict())
        
        # Build query
        query = {}
        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"full_name": {"$regex": search, "$options": "i"}},
                {"phone": {"$regex": search, "$options": "i"}}
            ]
        if status_filter:
            query["account_status"] = status_filter
        
        # Get total count
        total_count = await db.users.count_documents(query)
        
        # Get users with pagination
        skip = (page - 1) * limit
        users = await db.users.find(query).skip(skip).limit(limit).to_list(length=None)
        
        # Remove sensitive data
        safe_users = []
        for user in users:
            safe_user = {
                "id": user["id"],
                "email": user["email"],
                "phone": user.get("phone"),
                "full_name": user["full_name"],
                "account_type": user["account_type"],
                "account_tier": user["account_tier"],
                "account_status": user["account_status"],
                "email_verified": user["email_verified"],
                "phone_verified": user.get("phone_verified", False),
                "admin_role": user.get("admin_role"),
                "admin_enabled": user.get("admin_enabled", False),
                "created_at": user["created_at"],
                "last_login": user.get("last_login")
            }
            safe_users.append(safe_user)
        
        return {
            "users": safe_users,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit
        }
        
    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve users")

@admin_router.post("/users/{user_id}/role")
async def assign_admin_role(
    user_id: str,
    role_data: dict,
    request: Request,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Assign admin role to a user"""
    try:
        # Check if current user is super admin
        if admin_user.get("admin_role") != "super_admin":
            raise HTTPException(status_code=403, detail="Only super admins can assign roles")
        
        admin_role = role_data.get("admin_role")
        admin_enabled = role_data.get("admin_enabled", False)
        
        if admin_role not in ["super_admin", "user_manager", "analytics_viewer", "system_monitor", None]:
            raise HTTPException(status_code=400, detail="Invalid admin role")
        
        # Update user
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "admin_role": admin_role,
                "admin_enabled": admin_enabled,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log admin action
        audit_log = log_admin_action(
            admin_user["id"], admin_user["email"], "role_assigned", "user", user_id,
            details={"admin_role": admin_role, "admin_enabled": admin_enabled},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        if audit_log:
            await db.audit_logs.insert_one(audit_log.dict())
        
        return {"message": "Admin role assigned successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error assigning role: {e}")
        raise HTTPException(status_code=500, detail="Failed to assign admin role")

@admin_router.post("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status_data: dict,
    request: Request,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Update user account status"""
    try:
        # Check permission
        if not has_admin_permission(admin_user.get("admin_role"), "edit_users"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        new_status = status_data.get("account_status")
        if new_status not in ["active", "suspended", "inactive"]:
            raise HTTPException(status_code=400, detail="Invalid account status")
        
        # Update user
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "account_status": new_status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Log admin action
        audit_log = log_admin_action(
            admin_user["id"], admin_user["email"], "user_status_updated", "user", user_id,
            details={"new_status": new_status},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        if audit_log:
            await db.audit_logs.insert_one(audit_log.dict())
        
        return {"message": "User status updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating user status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user status")

@admin_router.get("/analytics/dashboard")
async def get_dashboard_analytics(
    request: Request,
    period: str = "7d",  # 1d, 7d, 30d
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get dashboard analytics data"""
    try:
        # Check permission
        if not has_admin_permission(admin_user.get("admin_role"), "view_analytics"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Calculate date range
        now = datetime.now(timezone.utc)
        if period == "1d":
            start_date = now - timedelta(days=1)
        elif period == "7d":
            start_date = now - timedelta(days=7)
        elif period == "30d":
            start_date = now - timedelta(days=30)
        else:
            raise HTTPException(status_code=400, detail="Invalid period")
        
        # Get user statistics
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({"account_status": "active"})
        verified_users = await db.users.count_documents({"email_verified": True})
        
        # Get recent registrations
        recent_registrations = await db.users.count_documents({
            "created_at": {"$gte": start_date.isoformat()}
        })
        
        # Get calculation statistics
        paye_calculations = await db.tax_calculations.count_documents({
            "timestamp": {"$gte": start_date.isoformat()}
        })
        
        cit_calculations = await db.cit_calculations.count_documents({
            "timestamp": {"$gte": start_date.isoformat()}
        })
        
        # Log admin action
        audit_log = log_admin_action(
            admin_user["id"], admin_user["email"], "view_analytics", "system",
            details={"period": period},
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        if audit_log:
            await db.audit_logs.insert_one(audit_log.dict())
        
        return {
            "period": period,
            "user_stats": {
                "total_users": total_users,
                "active_users": active_users,
                "verified_users": verified_users,
                "recent_registrations": recent_registrations
            },
            "calculation_stats": {
                "paye_calculations": paye_calculations,
                "cit_calculations": cit_calculations,
                "total_calculations": paye_calculations + cit_calculations
            },
            "generated_at": now.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")

@admin_router.get("/audit-logs")
async def get_audit_logs(
    request: Request,
    page: int = 1,
    limit: int = 50,
    action_filter: Optional[str] = None,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get audit logs with pagination and filtering"""
    try:
        # Check permission
        if not has_admin_permission(admin_user.get("admin_role"), "view_logs"):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        # Build query
        query = {}
        if action_filter:
            query["action"] = {"$regex": action_filter, "$options": "i"}
        
        # Get total count
        total_count = await db.audit_logs.count_documents(query)
        
        # Get logs with pagination (newest first)
        skip = (page - 1) * limit
        logs = await db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(length=None)
        
        return {
            "logs": logs,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve audit logs")

# Initialize super admin endpoint (public - use with caution)
@admin_router.post("/initialize-super-admin")
async def initialize_super_admin(email_data: dict):
    """Initialize the first super admin account - use only once for setup"""
    try:
        email = email_data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Check if any super admin exists
        super_admin = await db.users.find_one({"admin_role": "super_admin"})
        if super_admin:
            raise HTTPException(status_code=400, detail="Super admin already exists")
        
        # Find user and promote to super admin
        user_data = await db.users.find_one({"email": email})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        result = await db.users.update_one(
            {"email": email},
            {"$set": {
                "admin_role": "super_admin",
                "admin_enabled": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count > 0:
            print(f"Super admin privileges granted to {email}")
            return {"message": f"Super admin privileges granted to {email}"}
        else:
            raise HTTPException(status_code=404, detail="Failed to update user")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error initializing super admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize super admin")

# Special admin setup for specific user (one-time use)
@admin_router.post("/setup-owner-admin")
async def setup_owner_admin():
    """Setup the platform owner as super admin with verification bypass"""
    try:
        owner_email = "douyeegberipou@yahoo.com"
        owner_name = "Doutimiye Alfred-Egberipou"
        
        # Check if user exists
        user_data = await db.users.find_one({"email": owner_email})
        if not user_data:
            raise HTTPException(status_code=404, detail="Owner account not found. Please register first.")
        
        # Update user with super admin privileges and verification bypass
        result = await db.users.update_one(
            {"email": owner_email},
            {"$set": {
                "admin_role": "super_admin",
                "admin_enabled": True,
                "email_verified": True,
                "phone_verified": True,
                "account_status": "active",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count > 0:
            print(f"Owner admin setup completed for {owner_email}")
            
            # Log the admin action
            audit_log = log_admin_action(
                user_data["id"], owner_email, "owner_admin_setup", "user", user_data["id"],
                details={"verification_bypassed": True, "admin_role": "super_admin"},
                ip_address="system",
                user_agent="system_setup"
            )
            if audit_log:
                await db.audit_logs.insert_one(audit_log.dict())
            
            return {
                "message": f"Owner admin setup completed for {owner_email}",
                "verification_bypassed": True,
                "admin_privileges": True
            }
        else:
            raise HTTPException(status_code=404, detail="Failed to update owner account")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error setting up owner admin: {e}")
        raise HTTPException(status_code=500, detail="Failed to setup owner admin")

# Owner password reset (one-time use)
@admin_router.post("/reset-owner-password")
async def reset_owner_password():
    """Reset password for the platform owner"""
    try:
        owner_email = "douyeegberipou@yahoo.com"
        new_password = "AdminPass123!"
        
        # Check if user exists
        user_data = await db.users.find_one({"email": owner_email})
        if not user_data:
            raise HTTPException(status_code=404, detail="Owner account not found")
        
        # Hash the new password
        password_hash = hash_password(new_password)
        
        # Update password
        result = await db.users.update_one(
            {"email": owner_email},
            {"$set": {
                "password_hash": password_hash,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count > 0:
            print(f"Password reset completed for {owner_email}")
            return {
                "message": f"Password reset completed for {owner_email}",
                "new_password": new_password,
                "note": "Please change this password after first login"
            }
        else:
            raise HTTPException(status_code=404, detail="Failed to reset password")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error resetting owner password: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset owner password")

# ============================
# ADMIN MONETIZATION ENDPOINTS
# ============================

@admin_router.get("/monetization/analytics/dashboard")
async def get_monetization_dashboard(
    days: int = 30,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get comprehensive monetization analytics dashboard"""
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Get user statistics
        total_users = await db.users.count_documents({})
        
        # Get active users (last 30 days)
        month_ago = datetime.now(timezone.utc) - timedelta(days=30)
        mau = await db.daily_activities.distinct("user_id", {
            "created_at": {"$gte": month_ago}
        })
        
        # Get daily active users (last 24 hours)
        day_ago = datetime.now(timezone.utc) - timedelta(days=1)
        dau = await db.daily_activities.distinct("user_id", {
            "created_at": {"$gte": day_ago}
        })
        
        # Get conversion funnel data
        funnel_data = await db.conversion_funnel.find({
            "date": {"$gte": start_date.strftime("%Y-%m-%d")}
        }).to_list(length=None)
        
        # Get subscription statistics
        subscription_stats = {}
        for tier in UserTier:
            count = await db.subscriptions.count_documents({"tier": tier.value})
            subscription_stats[tier.value] = count
        
        # Get ad revenue data
        ad_revenue_data = await db.ad_revenue.find({
            "date": {"$gte": start_date.strftime("%Y-%m-%d")}
        }).sort("date", -1).to_list(length=None)
        
        return {
            "total_users": total_users,
            "mau": len(mau) if mau else 0,
            "dau": len(dau) if dau else 0,
            "subscription_stats": subscription_stats,
            "funnel_data": funnel_data,
            "ad_revenue_data": ad_revenue_data
        }
    except Exception as e:
        print(f"Error getting monetization dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics data")

@admin_router.get("/monetization/tiers")
async def get_tier_configurations(admin_user: dict = Depends(get_admin_middleware)):
    """Get all tier configurations"""
    try:
        tier_configs = await db.tier_configurations.find({}).to_list(length=None)
        
        # Remove ObjectId and convert datetime fields for JSON serialization
        serialized_configs = []
        for config in tier_configs:
            if "_id" in config:
                del config["_id"]
            if "created_at" in config and isinstance(config["created_at"], datetime):
                config["created_at"] = config["created_at"].isoformat()
            if "updated_at" in config and isinstance(config["updated_at"], datetime):
                config["updated_at"] = config["updated_at"].isoformat()
            serialized_configs.append(config)
        
        return serialized_configs
    except Exception as e:
        print(f"Error getting tier configurations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get tier configurations")

@admin_router.put("/monetization/tiers/{tier}")
async def update_tier_configuration(
    tier: UserTier,
    config: TierConfiguration,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Update tier configuration"""
    try:
        config.tier = tier
        config.updated_at = datetime.now(timezone.utc)
        
        await db.tier_configurations.update_one(
            {"tier": tier.value},
            {"$set": config.dict()},
            upsert=True
        )
        
        return {"message": "Tier configuration updated successfully"}
    except Exception as e:
        print(f"Error updating tier configuration: {e}")
        raise HTTPException(status_code=500, detail="Failed to update tier configuration")

@admin_router.get("/monetization/users")
async def get_user_subscriptions(
    page: int = 1,
    limit: int = 50,
    tier_filter: Optional[str] = None,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get users with subscription information"""
    try:
        skip = (page - 1) * limit
        
        # Build query
        user_query = {}
        if tier_filter:
            user_query["account_tier"] = tier_filter
        
        # Get users
        users = await db.users.find(user_query).skip(skip).limit(limit).to_list(length=None)
        
        # Get subscription data for each user
        user_subscriptions = []
        for user in users:
            subscription = await db.subscriptions.find_one({"user_id": user["id"]})
            trial = await db.user_trials.find_one({"user_id": user["id"]})
            
            # Clean up subscription data
            if subscription and "_id" in subscription:
                del subscription["_id"]
                # Convert datetime fields
                for field in ["created_at", "updated_at", "trial_ends_at", "expires_at"]:
                    if field in subscription and isinstance(subscription[field], datetime):
                        subscription[field] = subscription[field].isoformat()
            
            # Clean up trial data
            if trial and "_id" in trial:
                del trial["_id"]
                # Convert datetime fields
                for field in ["created_at", "updated_at", "started_at", "expires_at"]:
                    if field in trial and isinstance(trial[field], datetime):
                        trial[field] = trial[field].isoformat()
            
            user_subscriptions.append({
                "id": user["id"],
                "full_name": user["full_name"],
                "email": user["email"],
                "account_tier": user.get("account_tier", "free"),
                "subscription": subscription,
                "trial": trial,
                "created_at": user.get("created_at")
            })
        
        total_count = await db.users.count_documents(user_query)
        
        return {
            "users": user_subscriptions,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit
        }
    except Exception as e:
        print(f"Error getting user subscriptions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user subscriptions")

@admin_router.post("/monetization/manual-change")
async def apply_manual_subscription_change(
    change: ManualSubscriptionChange,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Apply manual subscription change"""
    try:
        user = await db.users.find_one({"id": change.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get current subscription
        current_subscription = await db.subscriptions.find_one({"user_id": change.user_id})
        old_tier = UserTier(user.get("account_tier", "free"))
        
        # Create subscription event
        event = SubscriptionEvent(
            user_id=change.user_id,
            event_type=change.action,
            from_tier=old_tier,
            to_tier=change.tier,
            reason=change.reason,
            admin_initiated=True,
            admin_user_id=admin_user["id"]
        )
        
        # Apply the change
        if change.action == "upgrade":
            # Update user tier
            await db.users.update_one(
                {"id": change.user_id},
                {"$set": {"account_tier": change.tier.value}}
            )
            
            # Create or update subscription
            subscription_data = {
                "user_id": change.user_id,
                "tier": change.tier,
                "status": SubscriptionStatus.ACTIVE,
                "is_annual": False,
                "created_at": datetime.now(timezone.utc)
            }
            
            if change.duration_months:
                subscription_data["ends_at"] = datetime.now(timezone.utc) + timedelta(days=change.duration_months * 30)
            
            await db.subscriptions.update_one(
                {"user_id": change.user_id},
                {"$set": subscription_data},
                upsert=True
            )
            
        elif change.action == "trial":
            # Start trial
            trial_data = {
                "user_id": change.user_id,
                "trial_type": "admin_granted",
                "tier": change.tier,
                "status": "TRIAL_ACTIVE",
                "started_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(days=change.duration_months * 30 if change.duration_months else 7)
            }
            
            await db.user_trials.update_one(
                {"user_id": change.user_id},
                {"$set": trial_data},
                upsert=True
            )
            
            # Update subscription to trial
            await db.subscriptions.update_one(
                {"user_id": change.user_id},
                {"$set": {
                    "tier": change.tier,
                    "is_trial_active": True,
                    "trial_ends_at": trial_data["expires_at"]
                }},
                upsert=True
            )
        
        # Log the event
        await db.subscription_events.insert_one(event.dict())
        
        return {"message": f"Successfully applied {change.action} for user"}
        
    except Exception as e:
        print(f"Error applying manual subscription change: {e}")
        raise HTTPException(status_code=500, detail="Failed to apply subscription change")

@admin_router.get("/monetization/events")
async def get_subscription_events(
    days: int = 30,
    event_type: Optional[str] = None,
    admin_user: dict = Depends(get_admin_middleware)
):
    """Get subscription events log"""
    try:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        query = {"created_at": {"$gte": start_date}}
        if event_type:
            query["event_type"] = event_type
        
        events = await db.subscription_events.find(query).sort("created_at", -1).to_list(length=None)
        
        # Convert datetime fields and remove ObjectId for JSON serialization
        serialized_events = []
        for event in events:
            if "_id" in event:
                del event["_id"]  # Remove MongoDB ObjectId
            if "created_at" in event and isinstance(event["created_at"], datetime):
                event["created_at"] = event["created_at"].isoformat()
            serialized_events.append(event)
        
        return serialized_events
    except Exception as e:
        print(f"Error getting subscription events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get subscription events")

# Include admin router
app.include_router(admin_router)

# Start the app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)