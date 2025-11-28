"""
Create admin user for Fiquant TaxPro
Run this script to create your first admin account
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import bcrypt
import uuid

async def create_admin_user():
    # Get MongoDB connection from environment
    mongo_url = os.environ.get('MONGO_URL', 'mongodb+srv://fiquant_admin:YOUR_PASSWORD@fiquant-cluster.om8ayy0.mongodb.net/fiquant_production?retryWrites=true&w=majority&appName=fiquant-cluster')
    db_name = os.environ.get('DB_NAME', 'fiquant_production')
    
    print("=" * 60)
    print("Fiquant TaxPro - Admin User Creator")
    print("=" * 60)
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Admin details
    admin_email = "douyeegberipou@yahoo.com"
    admin_password = "Admin123456"  # Change this after first login!
    admin_name = "Administrator"
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"⚠️  User with email {admin_email} already exists!")
        print(f"   Updating to admin role...")
        
        # Update existing user to admin
        await db.users.update_one(
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
        print(f"✅ User {admin_email} is now a super admin!")
    else:
        # Hash password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(admin_password.encode('utf-8'), salt)
        hashed_password = hashed.decode('utf-8')
        
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
            "account_type": "individual",
            "employment_status": "salaried",
            "account_tier": "enterprise",
            "permissions": ["basic_calculator", "admin_access"],
            "admin_role": "super_admin",
            "admin_enabled": True,
            "two_factor_enabled": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None,
            "email_notifications": True,
            "sms_notifications": False
        }
        
        await db.users.insert_one(admin_user)
        print(f"✅ Admin user created successfully!")
    
    print("=" * 60)
    print("Admin Login Credentials:")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print("=" * 60)
    print("⚠️  IMPORTANT: Change this password after first login!")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
