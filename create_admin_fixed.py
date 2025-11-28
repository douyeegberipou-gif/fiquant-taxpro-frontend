"""
Create admin user - Fixed version that uses actual Railway env vars
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import bcrypt
import uuid

async def create_admin_user():
    print("=" * 60)
    print("Fiquant TaxPro - Admin User Creator (Fixed)")
    print("=" * 60)
    
    # Get MongoDB connection from environment (Railway sets these)
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url:
        print("❌ ERROR: MONGO_URL environment variable not set!")
        print("   This script must be run on Railway where env vars are set")
        sys.exit(1)
    
    print(f"✓ Using DB: {db_name}")
    print(f"✓ Connecting to MongoDB...")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        
        # Test connection
        await db.command("ping")
        print("✓ MongoDB connection successful!")
        
        # Admin details
        admin_email = "douyeegberipou@yahoo.com"
        admin_password = "GntAve12345"
        admin_name = "Administrator"
        
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": admin_email}, {"_id": 0})
        
        if existing_admin:
            print(f"\n⚠️  User {admin_email} already exists!")
            print(f"   Updating to admin role...")
            
            # Update existing user to admin
            result = await db.users.update_one(
                {"email": admin_email},
                {"$set": {
                    "admin_enabled": True,
                    "admin_role": "super_admin",
                    "email_verified": True,
                    "phone_verified": True,
                    "account_status": "active",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            print(f"✓ Updated {result.modified_count} user(s)")
            print(f"✓ {admin_email} is now a super admin!")
        else:
            # Hash password using bcrypt
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(admin_password.encode('utf-8'), salt)
            hashed_password = hashed.decode('utf-8')
            
            print(f"\n✓ Creating new admin user...")
            
            # Create admin user
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "phone": None,
                "full_name": admin_name,
                "password_hash": hashed_password,
                "email_verified": True,
                "phone_verified": True,
                "account_status": "active",
                "verification_token": None,
                "phone_verification_code": None,
                "verification_expires": None,
                "account_type": "individual",
                "employment_status": "salaried",
                "income_streams": [],
                "default_reliefs": {},
                "tin": None,
                "company_name": None,
                "business_type": None,
                "account_tier": "enterprise",
                "permissions": ["basic_calculator", "admin_access"],
                "admin_role": "super_admin",
                "admin_enabled": True,
                "two_factor_enabled": False,
                "two_factor_secret": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "last_login": None,
                "email_notifications": True,
                "sms_notifications": False
            }
            
            result = await db.users.insert_one(admin_user)
            print(f"✓ Admin user created with ID: {result.inserted_id}")
        
        # Verify user exists
        verification = await db.users.find_one({"email": admin_email}, {"_id": 0, "email": 1, "admin_role": 1, "admin_enabled": 1})
        
        print("\n" + "=" * 60)
        print("✅ SUCCESS!")
        print("=" * 60)
        print(f"Admin user verified in database:")
        print(f"  Email: {verification.get('email')}")
        print(f"  Admin Role: {verification.get('admin_role')}")
        print(f"  Admin Enabled: {verification.get('admin_enabled')}")
        print("\n" + "=" * 60)
        print("Login Credentials:")
        print(f"  Email: {admin_email}")
        print(f"  Password: {admin_password}")
        print("=" * 60)
        
        client.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"   Error type: {type(e).__name__}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(create_admin_user())
