"""
Fix admin user by adding admin_enabled and admin_role fields
"""
import os
import sys
from pymongo import MongoClient
from datetime import datetime, timezone

# Railway sets this in environment
MONGO_URL = os.environ.get('MONGO_URL')

if not MONGO_URL:
    print("ERROR: MONGO_URL environment variable not set")
    print("This script needs to run on Railway or with Railway environment variables")
    sys.exit(1)

try:
    client = MongoClient(MONGO_URL)
    db = client.fiquant_db
    
    owner_email = "douyeegberipou@yahoo.com"
    
    # Check current user data
    user = db.users.find_one({"email": owner_email}, {"_id": 0})
    
    if not user:
        print(f"❌ User {owner_email} not found in database!")
        sys.exit(1)
    
    print(f"✅ Found user: {owner_email}")
    print(f"Current admin_enabled: {user.get('admin_enabled', 'NOT SET')}")
    print(f"Current admin_role: {user.get('admin_role', 'NOT SET')}")
    print(f"Email verified: {user.get('email_verified')}")
    print(f"Phone verified: {user.get('phone_verified')}")
    
    # Update with admin privileges
    result = db.users.update_one(
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
    
    if result.modified_count > 0:
        print(f"\n✅ Successfully updated {owner_email} with super_admin privileges!")
        
        # Verify the update
        updated_user = db.users.find_one({"email": owner_email}, {"_id": 0})
        print(f"\nVerification:")
        print(f"admin_enabled: {updated_user.get('admin_enabled')}")
        print(f"admin_role: {updated_user.get('admin_role')}")
    else:
        print(f"\n⚠️ No changes made (fields might already be set)")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
