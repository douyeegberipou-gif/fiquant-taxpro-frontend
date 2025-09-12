import os
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from enum import Enum
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, HtmlContent, PlainTextContent
import uuid
from motor.motor_asyncio import AsyncIOMotorDatabase

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailType(str, Enum):
    VERIFICATION = "verification"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"
    TAX_REMINDER = "tax_reminder"
    OVERDUE_NOTICE = "overdue_notice"
    CALCULATION_RESULT = "calculation_result"
    ADMIN_BROADCAST = "admin_broadcast"
    GENERAL = "general"

class EmailStatus(str, Enum):
    QUEUED = "queued"
    SENT = "sent"
    DELIVERED = "delivered"
    BOUNCED = "bounced"
    FAILED = "failed"
    OPENED = "opened"
    CLICKED = "clicked"

class EmailDeliveryError(Exception):
    """Custom exception for email delivery errors"""
    pass

class EmailService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@fiquantconsult.com')
        self.sender_name = os.getenv('SENDER_NAME', 'Fiquant Consult')
        self.db = db
        
        if not self.api_key:
            raise ValueError("SENDGRID_API_KEY environment variable is required")
        
        self.client = SendGridAPIClient(api_key=self.api_key)
        
        # Email templates mapping
        self.templates = {
            EmailType.VERIFICATION: "d-verification-template-id",
            EmailType.WELCOME: "d-welcome-template-id", 
            EmailType.PASSWORD_RESET: "d-password-reset-template-id",
            EmailType.TAX_REMINDER: "d-tax-reminder-template-id",
            EmailType.OVERDUE_NOTICE: "d-overdue-notice-template-id",
            EmailType.CALCULATION_RESULT: "d-calculation-result-template-id",
            EmailType.ADMIN_BROADCAST: "d-admin-broadcast-template-id"
        }

    async def send_email(
        self,
        to_email: str,
        email_type: EmailType,
        subject: str,
        dynamic_data: Dict[str, Any] = None,
        html_content: str = None,
        plain_content: str = None,
        user_id: str = None
    ) -> Dict[str, Any]:
        """
        Send an email using SendGrid with comprehensive logging
        
        Args:
            to_email: Recipient email address
            email_type: Type of email from EmailType enum
            subject: Email subject line
            dynamic_data: Dynamic template data
            html_content: HTML content (if not using template)
            plain_content: Plain text content
            user_id: User ID for logging purposes
            
        Returns:
            Dict containing email log information
        """
        email_id = str(uuid.uuid4())
        
        try:
            # Create email log entry
            email_log = {
                "email_id": email_id,
                "user_id": user_id,
                "recipient_email": to_email,
                "email_type": email_type.value,
                "subject": subject,
                "status": EmailStatus.QUEUED.value,
                "created_at": datetime.now(timezone.utc),
                "sent_at": None,
                "delivery_status": None,
                "error_message": None,
                "template_id": self.templates.get(email_type),
                "dynamic_data": dynamic_data or {}
            }
            
            # Insert initial log
            await self.db.email_logs.insert_one(email_log)
            
            # Prepare the email
            from_email = From(self.sender_email, self.sender_name)
            to = To(to_email)
            
            # Use template if available, otherwise use content
            template_id = self.templates.get(email_type)
            
            if template_id and template_id.startswith('d-'):
                # Use SendGrid dynamic template
                mail = Mail(
                    from_email=from_email,
                    to_emails=to,
                    subject=Subject(subject)
                )
                mail.template_id = template_id
                if dynamic_data:
                    mail.dynamic_template_data = dynamic_data
            else:
                # Use content-based email
                mail = Mail(
                    from_email=from_email,
                    to_emails=to,
                    subject=Subject(subject),
                    html_content=HtmlContent(html_content) if html_content else None,
                    plain_text_content=PlainTextContent(plain_content) if plain_content else None
                )
            
            # Send the email
            response = self.client.send(mail)
            
            # Update log with success
            await self.db.email_logs.update_one(
                {"email_id": email_id},
                {
                    "$set": {
                        "status": EmailStatus.SENT.value,
                        "sent_at": datetime.now(timezone.utc),
                        "sendgrid_message_id": response.headers.get('X-Message-Id', ''),
                        "response_status_code": response.status_code
                    }
                }
            )
            
            logger.info(f"Email sent successfully: {email_id} to {to_email}")
            return {"email_id": email_id, "status": "sent", "status_code": response.status_code}
            
        except Exception as e:
            # Update log with error
            error_message = str(e)
            await self.db.email_logs.update_one(
                {"email_id": email_id},
                {
                    "$set": {
                        "status": EmailStatus.FAILED.value,
                        "error_message": error_message,
                        "failed_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            logger.error(f"Failed to send email {email_id}: {error_message}")
            raise EmailDeliveryError(f"Failed to send email: {error_message}")

    async def send_verification_email(self, to_email: str, verification_token: str, user_name: str = None) -> Dict[str, Any]:
        """Send account verification email"""
        verification_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token={verification_token}"
        
        dynamic_data = {
            "user_name": user_name or "User",
            "verification_url": verification_url,
            "company_name": "Fiquant Consult",
            "support_email": self.sender_email
        }
        
        html_content = f"""
        <html>
            <head>
                <style>
                    .email-container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                    .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center; }}
                    .header h1 {{ color: white; margin: 0; }}
                    .content {{ padding: 30px 20px; }}
                    .btn {{ background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }}
                    .footer {{ background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Welcome to Fiquant TaxPro</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user_name or 'User'},</h2>
                        <p>Thank you for registering with Fiquant TaxPro! Please verify your email address to complete your account setup.</p>
                        <p>Click the button below to verify your email:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{verification_url}" class="btn">Verify Email Address</a>
                        </p>
                        <p>If you didn't create an account with us, please ignore this email.</p>
                        <p>This link will expire in 24 hours.</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Fiquant Consult Limited. All rights reserved.</p>
                        <p>Nigerian Tax Management Solutions</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(
            to_email=to_email,
            email_type=EmailType.VERIFICATION,
            subject="Verify Your Fiquant TaxPro Account",
            dynamic_data=dynamic_data,
            html_content=html_content
        )

    async def send_welcome_email(self, to_email: str, user_name: str) -> Dict[str, Any]:
        """Send welcome email after successful verification"""
        dynamic_data = {
            "user_name": user_name,
            "dashboard_url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard",
            "company_name": "Fiquant Consult"
        }
        
        html_content = f"""
        <html>
            <head>
                <style>
                    .email-container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                    .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center; }}
                    .header h1 {{ color: white; margin: 0; }}
                    .content {{ padding: 30px 20px; }}
                    .feature {{ margin: 20px 0; padding: 15px; border-left: 4px solid #f59e0b; }}
                    .btn {{ background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }}
                    .footer {{ background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Welcome to Fiquant TaxPro!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user_name},</h2>
                        <p>Your account is now verified and ready to use! Welcome to Nigeria's premier tax management platform.</p>
                        
                        <h3>What you can do now:</h3>
                        <div class="feature">
                            <strong>PAYE Calculator</strong> - Calculate personal income tax with Nigerian tax bands
                        </div>
                        <div class="feature">
                            <strong>CIT Calculator</strong> - Compute corporate income tax for your business
                        </div>
                        <div class="feature">
                            <strong>Bulk Processing</strong> - Handle multiple employee payroll calculations
                        </div>
                        <div class="feature">
                            <strong>PDF Reports</strong> - Generate professional tax computation reports
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{dynamic_data['dashboard_url']}" class="btn">Start Calculating Taxes</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Fiquant Consult Limited. All rights reserved.</p>
                        <p>Need help? Contact us at support@fiquantconsult.com</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(
            to_email=to_email,
            email_type=EmailType.WELCOME,
            subject="Welcome to Fiquant TaxPro - Your Account is Ready!",
            dynamic_data=dynamic_data,
            html_content=html_content
        )

    async def send_password_reset_email(self, to_email: str, reset_token: str, user_name: str = None) -> Dict[str, Any]:
        """Send password reset email"""
        reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
        
        dynamic_data = {
            "user_name": user_name or "User",
            "reset_url": reset_url,
            "company_name": "Fiquant Consult"
        }
        
        html_content = f"""
        <html>
            <head>
                <style>
                    .email-container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                    .header {{ background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center; }}
                    .header h1 {{ color: white; margin: 0; }}
                    .content {{ padding: 30px 20px; }}
                    .btn {{ background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }}
                    .footer {{ background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
                    .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user_name or 'User'},</h2>
                        <p>We received a request to reset your password for your Fiquant TaxPro account.</p>
                        
                        <div class="warning">
                            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
                        </div>
                        
                        <p>Click the button below to reset your password:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{reset_url}" class="btn">Reset Password</a>
                        </p>
                        <p><strong>This link will expire in 1 hour for your security.</strong></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Fiquant Consult Limited. All rights reserved.</p>
                        <p>For security questions, contact support@fiquantconsult.com</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(
            to_email=to_email,
            email_type=EmailType.PASSWORD_RESET,
            subject="Reset Your Fiquant TaxPro Password",
            dynamic_data=dynamic_data,
            html_content=html_content
        )

    async def send_tax_reminder_email(self, to_email: str, tax_type: str, due_date: str, user_name: str = None) -> Dict[str, Any]:
        """Send tax payment reminder email"""
        dynamic_data = {
            "user_name": user_name or "User",
            "tax_type": tax_type,
            "due_date": due_date,
            "company_name": "Fiquant Consult"
        }
        
        tax_info = {
            "PAYE": {"due": "10th of each month", "description": "Personal Income Tax"},
            "VAT": {"due": "21st of each month", "description": "Value Added Tax"},
            "CIT": {"due": "Annual deadline", "description": "Corporate Income Tax"},
            "Pension": {"due": "7 days after month end", "description": "Pension Contributions"},
            "WHT": {"due": "21st of each month", "description": "Withholding Tax"}
        }
        
        info = tax_info.get(tax_type, {"due": due_date, "description": tax_type})
        
        html_content = f"""
        <html>
            <head>
                <style>
                    .email-container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                    .header {{ background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center; }}
                    .header h1 {{ color: white; margin: 0; }}
                    .content {{ padding: 30px 20px; }}
                    .alert {{ background: #fef2f2; border: 1px solid #f87171; padding: 20px; border-radius: 6px; margin: 20px 0; }}
                    .btn {{ background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; }}
                    .footer {{ background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Tax Payment Reminder</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {user_name or 'User'},</h2>
                        
                        <div class="alert">
                            <h3>🚨 {tax_type} Payment Due</h3>
                            <p><strong>{info['description']}</strong> payment is due on <strong>{due_date}</strong></p>
                            <p>Regular due date: {info['due']}</p>
                        </div>
                        
                        <p>Don't forget to file and pay your {tax_type} to avoid penalties and interest charges.</p>
                        
                        <p>Use Fiquant TaxPro to calculate your tax obligations accurately:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}" class="btn">Calculate Tax Now</a>
                        </p>
                        
                        <p><em>This is an automated reminder. Please ensure timely compliance with Nigerian tax regulations.</em></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 Fiquant Consult Limited. All rights reserved.</p>
                        <p>Tax compliance made simple for Nigerian businesses</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        return await self.send_email(
            to_email=to_email,
            email_type=EmailType.TAX_REMINDER,
            subject=f"Tax Reminder: {tax_type} Payment Due {due_date}",
            dynamic_data=dynamic_data,
            html_content=html_content
        )

    async def send_admin_broadcast(self, recipients: List[str], subject: str, content: str, admin_user: str) -> List[Dict[str, Any]]:
        """Send broadcast email to multiple recipients"""
        results = []
        
        for recipient in recipients:
            try:
                result = await self.send_email(
                    to_email=recipient,
                    email_type=EmailType.ADMIN_BROADCAST,
                    subject=f"[Fiquant TaxPro] {subject}",
                    html_content=f"""
                    <html>
                        <head>
                            <style>
                                .email-container {{ max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }}
                                .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center; }}
                                .header h1 {{ color: white; margin: 0; }}
                                .content {{ padding: 30px 20px; line-height: 1.6; }}
                                .footer {{ background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }}
                            </style>
                        </head>
                        <body>
                            <div class="email-container">
                                <div class="header">
                                    <h1>Fiquant TaxPro Update</h1>
                                </div>
                                <div class="content">
                                    {content}
                                </div>
                                <div class="footer">
                                    <p>© 2025 Fiquant Consult Limited. All rights reserved.</p>
                                    <p>This message was sent by: {admin_user}</p>
                                </div>
                            </div>
                        </body>
                    </html>
                    """
                )
                results.append({"recipient": recipient, "status": "sent", "email_id": result["email_id"]})
            except Exception as e:
                results.append({"recipient": recipient, "status": "failed", "error": str(e)})
        
        return results

    async def get_email_stats(self, start_date: datetime = None, end_date: datetime = None) -> Dict[str, Any]:
        """Get email delivery statistics"""
        match_filter = {}
        
        if start_date or end_date:
            date_filter = {}
            if start_date:
                date_filter["$gte"] = start_date
            if end_date:
                date_filter["$lte"] = end_date
            match_filter["created_at"] = date_filter
        
        pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        status_counts = {}
        async for doc in self.db.email_logs.aggregate(pipeline):
            status_counts[doc["_id"]] = doc["count"]
        
        # Get email type breakdown
        type_pipeline = [
            {"$match": match_filter},
            {
                "$group": {
                    "_id": "$email_type",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        type_counts = {}
        async for doc in self.db.email_logs.aggregate(type_pipeline):
            type_counts[doc["_id"]] = doc["count"]
        
        total_sent = sum(status_counts.values())
        success_rate = (status_counts.get("sent", 0) / total_sent * 100) if total_sent > 0 else 0
        
        return {
            "total_emails": total_sent,
            "status_breakdown": status_counts,
            "type_breakdown": type_counts,
            "success_rate": round(success_rate, 2)
        }

    async def get_user_email_logs(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get email logs for a specific user"""
        cursor = self.db.email_logs.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit)
        
        logs = []
        async for log in cursor:
            log["_id"] = str(log["_id"])
            logs.append(log)
        
        return logs