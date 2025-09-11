from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal, ROUND_HALF_UP
import jwt
import bcrypt
import re
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

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
    account_tier: str = Field(default="free", description="free, basic, premium, enterprise")
    permissions: List[str] = Field(default_factory=lambda: ["basic_calculator"], description="Account permissions")
    
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

class EmailVerification(BaseModel):
    email: EmailStr

class PhoneVerification(BaseModel):
    phone: str

class VerifyCode(BaseModel):
    email: EmailStr
    verification_code: str
    verification_type: str = Field(description="email or phone")

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
    except jwt.JWTError:
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
    """Register new user"""
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
    
    # Create user profile
    user_profile = UserProfile(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        account_type="individual",
        employment_status="salaried",
        account_tier="free",
        permissions=["basic_calculator"]
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
    
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_profile.id,
        email=user_profile.email,
        full_name=user_profile.full_name,
        account_type=user_profile.account_type,
        employment_status=user_profile.employment_status,
        account_tier=user_profile.account_tier,
        permissions=user_profile.permissions,
        created_at=user_profile.created_at,
        last_login=user_profile.last_login
    )

@api_router.post("/auth/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """Login user and return JWT token"""
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
    
    # Verify password
    if not verify_password(login_data.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Update last login
    await db.users.update_one(
        {"id": user_data["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_data["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        user_id=user_data["id"]
    )

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
        last_login=current_user.last_login
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
        last_login=updated_user.last_login
    )

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
    company_name: str = Field(description="Company name")
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
    
    # Classify company size
    is_small = (cit_input.annual_turnover <= 100_000_000 and 
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
    
    # Minimum Effective Tax Rate (15% for large multinationals)
    minimum_etr_rate = 0.0
    minimum_etr_tax = 0.0
    if (is_large and cit_input.is_multinational and 
        cit_input.global_revenue_eur >= 750_000_000):  # €750 million threshold
        minimum_etr_rate = 0.15
        minimum_required_tax = taxable_profit * minimum_etr_rate
        current_tax = cit_due + development_levy
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
async def calculate_paye_tax(
    tax_input: TaxInput, 
    current_user: Optional[UserProfile] = Depends(get_current_user) if True else None
):
    """Calculate PAYE tax (Nigerian Income Tax) for 2026 with optional history saving"""
    try:
        result = calculate_nigerian_paye_2026(tax_input)
        calculation_result = [result]
        
        # Save to history if user is authenticated
        if current_user:
            history_record = TaxCalculationHistory(
                user_id=current_user.id,
                calculation_type="paye",
                input_data=tax_input.dict(),
                result_data=result.dict(),
                employee_count=1,
                notes=f"PAYE calculation for {tax_input.basic_salary}"
            )
            
            # Convert datetime to ISO string
            history_doc = history_record.dict()
            history_doc["calculation_date"] = history_doc["calculation_date"].isoformat()
            
            await db.tax_history.insert_one(history_doc)
        
        # Save calculation to database (existing functionality)
        calculation_dict = result.dict()
        # Convert datetime to ISO string for MongoDB
        calculation_dict['timestamp'] = result.timestamp.isoformat()
        await db.tax_calculations.insert_one(calculation_dict)
        
        return calculation_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

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
                "criteria": "Turnover ≤ ₦100M AND Fixed Assets ≤ ₦250M",
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


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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