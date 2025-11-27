"""
Simple database test script
Run this on Railway to test MongoDB connection
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    try:
        # Get MongoDB URL from environment
        mongo_url = os.environ.get('MONGO_URL', 'NOT_SET')
        db_name = os.environ.get('DB_NAME', 'NOT_SET')
        
        print("=" * 50)
        print("MongoDB Connection Test")
        print("=" * 50)
        print(f"MONGO_URL prefix: {mongo_url[:50]}..." if len(mongo_url) > 50 else f"MONGO_URL: {mongo_url}")
        print(f"DB_NAME: {db_name}")
        print("=" * 50)
        
        if mongo_url == 'NOT_SET':
            print("ERROR: MONGO_URL environment variable not set!")
            return
        
        # Try to connect
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await db.command("ping")
        print("✅ MongoDB connection successful!")
        
        # Try to count documents
        count = await db.users.count_documents({})
        print(f"✅ User count: {count}")
        
        print("=" * 50)
        print("All tests passed!")
        
    except Exception as e:
        print("=" * 50)
        print("❌ ERROR:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_connection())
