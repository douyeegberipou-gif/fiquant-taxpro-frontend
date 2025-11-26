import requests
import json

def test_admin_initialization():
    base_url = "https://tax-manager-5.preview.emergentagent.com/api"
    target_email = "douyeegberipou@gmail.com"
    target_name = "Doutimiye Alfred-Egberipou"
    
    print("🔍 DETAILED ADMIN ACCOUNT INVESTIGATION")
    print("=" * 60)
    
    # Test 1: Check super admin initialization response
    print("\n1. Testing Super Admin Initialization...")
    admin_data = {
        "email": target_email,
        "full_name": target_name
    }
    
    response = requests.post(
        f"{base_url}/admin/initialize-super-admin",
        json=admin_data,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 2: Try different login passwords
    print("\n2. Testing Different Login Passwords...")
    passwords_to_try = [
        "AdminPass123!",
        "password123",
        "admin123",
        "Password123!",
        "SecurePass123!"
    ]
    
    for password in passwords_to_try:
        login_data = {
            "email_or_phone": target_email,
            "password": password
        }
        
        response = requests.post(
            f"{base_url}/auth/login",
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Password '{password}': Status {response.status_code}")
        if response.status_code != 401:
            print(f"  Response: {response.text}")
    
    # Test 3: Check if we can get any info about existing super admin
    print("\n3. Checking Existing Super Admin Status...")
    
    # Try to initialize again to see the exact error message
    response = requests.post(
        f"{base_url}/admin/initialize-super-admin",
        json={"email": "any@email.com", "full_name": "Any Name"},
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"Generic initialization attempt: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 4: Try to register the account again to see current status
    print("\n4. Checking Account Registration Status...")
    reg_data = {
        "email": target_email,
        "phone": "+2348123456789",
        "password": "TestPass123!",
        "full_name": target_name,
        "agree_terms": True
    }
    
    response = requests.post(
        f"{base_url}/auth/register",
        json=reg_data,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"Registration attempt: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_admin_initialization()