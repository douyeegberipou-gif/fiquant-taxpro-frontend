#!/usr/bin/env python3
"""
URGENT ADMIN BYPASS INVESTIGATION - Focused Test
Investigating douyeegberipou@yahoo.com login bypass issue
"""

import requests
import time
import json

class FocusedAdminTester:
    def __init__(self, base_url="https://tax-manager-5.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.auth_token = None

    def test_single_login_attempt(self, email, password):
        """Test a single login attempt"""
        url = f"{self.base_url}/auth/login"
        headers = {'Content-Type': 'application/json'}
        data = {
            "email_or_phone": email,
            "password": password
        }
        
        try:
            response = requests.post(url, json=data, headers=headers, timeout=30)
            print(f"🔍 Login Test: {email}")
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ LOGIN SUCCESSFUL")
                print(f"   Token: {result.get('access_token', 'N/A')[:50]}...")
                print(f"   User ID: {result.get('user_id')}")
                print(f"   Expires In: {result.get('expires_in')} seconds")
                return True, result
            elif response.status_code == 401:
                result = response.json()
                print(f"   ❌ LOGIN FAILED: {result.get('detail', 'Invalid credentials')}")
                return False, result
            elif response.status_code == 403:
                result = response.json()
                print(f"   🚫 VERIFICATION REQUIRED: {result.get('detail', 'Account not verified')}")
                return False, result
            elif response.status_code == 429:
                print(f"   ⏱️ RATE LIMITED: Too many requests")
                return False, {"detail": "Rate limited"}
            else:
                print(f"   ❓ UNEXPECTED STATUS: {response.status_code}")
                try:
                    result = response.json()
                except:
                    result = {"detail": response.text}
                return False, result
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            return False, {"error": str(e)}

    def get_user_profile(self, token):
        """Get user profile with token"""
        url = f"{self.base_url}/auth/me"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            print(f"🔍 Profile Request:")
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ PROFILE RETRIEVED")
                return True, result
            else:
                print(f"   ❌ PROFILE FAILED")
                try:
                    result = response.json()
                except:
                    result = {"detail": response.text}
                return False, result
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            return False, {"error": str(e)}

    def check_account_exists(self, email):
        """Check if account exists by attempting registration"""
        url = f"{self.base_url}/auth/register"
        headers = {'Content-Type': 'application/json'}
        data = {
            "email": email,
            "phone": "+2348123456789",
            "password": "TestPassword123!",
            "full_name": "Test Registration Check",
            "agree_terms": True
        }
        
        try:
            response = requests.post(url, json=data, headers=headers, timeout=30)
            print(f"🔍 Account Existence Check: {email}")
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 400:
                result = response.json()
                if "already registered" in str(result.get('detail', '')):
                    print(f"   ✅ ACCOUNT EXISTS: Email already registered")
                    return True, result
                else:
                    print(f"   ❓ VALIDATION ERROR: {result.get('detail')}")
                    return False, result
            elif response.status_code == 200:
                result = response.json()
                print(f"   ❌ ACCOUNT DOES NOT EXIST: Registration succeeded")
                return False, result
            else:
                print(f"   ❓ UNEXPECTED STATUS: {response.status_code}")
                try:
                    result = response.json()
                except:
                    result = {"detail": response.text}
                return False, result
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            return False, {"error": str(e)}

    def run_focused_investigation(self):
        """Run focused admin bypass investigation"""
        print("🚨 URGENT ADMIN BYPASS INVESTIGATION - FOCUSED TEST")
        print("=" * 80)
        print("CRITICAL ISSUE: douyeegberipou@yahoo.com can still login without verification")
        print("HYPOTHESIS: Account already marked as verified in database")
        print("=" * 80)
        
        # Step 1: Check if account exists
        print("\n1️⃣ CHECKING IF ACCOUNT EXISTS")
        exists, _ = self.check_account_exists("douyeegberipou@yahoo.com")
        
        if not exists:
            print("❌ CRITICAL: Account does not exist in database")
            return False
        
        # Wait to avoid rate limiting
        print("\n⏱️ Waiting 5 seconds to avoid rate limiting...")
        time.sleep(5)
        
        # Step 2: Test login with common passwords
        print("\n2️⃣ TESTING LOGIN WITH COMMON PASSWORDS")
        test_passwords = [
            "test_password",
            "admin123", 
            "password",
            "123456"
        ]
        
        login_successful = False
        successful_password = None
        user_token = None
        
        for password in test_passwords:
            success, result = self.test_single_login_attempt("douyeegberipou@yahoo.com", password)
            
            if success:
                login_successful = True
                successful_password = password
                user_token = result.get("access_token")
                break
            
            # Wait between attempts to avoid rate limiting
            time.sleep(2)
        
        if not login_successful:
            print("\n❌ LOGIN FAILED WITH ALL PASSWORDS")
            print("🎯 CONCLUSION: Admin bypass has been removed or password is different")
            print("📝 RECOMMENDATION: Check if admin bypass logic was modified")
            return False
        
        # Step 3: Get user profile to check verification status
        print(f"\n3️⃣ ANALYZING ACCOUNT VERIFICATION STATUS")
        print(f"   Successful login with password: '{successful_password}'")
        
        if user_token:
            profile_success, profile_data = self.get_user_profile(user_token)
            
            if profile_success:
                print(f"\n📊 ACCOUNT ANALYSIS:")
                print(f"   Email: {profile_data.get('email')}")
                print(f"   Full Name: {profile_data.get('full_name')}")
                print(f"   Email Verified: {profile_data.get('email_verified')}")
                print(f"   Phone Verified: {profile_data.get('phone_verified')}")
                print(f"   Account Status: {profile_data.get('account_status')}")
                print(f"   Admin Role: {profile_data.get('admin_role')}")
                print(f"   Admin Enabled: {profile_data.get('admin_enabled')}")
                
                # Analyze verification status
                email_verified = profile_data.get('email_verified')
                phone_verified = profile_data.get('phone_verified')
                
                print(f"\n🎯 ROOT CAUSE ANALYSIS:")
                if email_verified and phone_verified:
                    print("   ✅ HYPOTHESIS CONFIRMED: Account is fully verified")
                    print("   📝 email_verified: true, phone_verified: true")
                    print("   💡 SOLUTION: Set email_verified: false to force verification")
                elif email_verified or phone_verified:
                    print("   ⚠️ PARTIAL VERIFICATION: Account has partial verification")
                    print(f"   📝 email_verified: {email_verified}, phone_verified: {phone_verified}")
                    print("   💡 SOLUTION: Set both verification fields to false")
                else:
                    print("   🔍 SPECIAL BYPASS: Account not verified but can login")
                    print("   📝 Special admin bypass logic is active")
                    print("   💡 SOLUTION: Review admin bypass logic in login endpoint")
                
                return True
            else:
                print("❌ Failed to get user profile")
                return False
        else:
            print("❌ No token available for profile check")
            return False

if __name__ == "__main__":
    tester = FocusedAdminTester()
    success = tester.run_focused_investigation()
    
    print("\n" + "=" * 80)
    if success:
        print("✅ INVESTIGATION COMPLETE - ROOT CAUSE IDENTIFIED")
        print("📋 Check detailed analysis above for solution")
    else:
        print("❌ INVESTIGATION INCOMPLETE - FURTHER ANALYSIS NEEDED")
        print("🔍 Admin bypass may have been removed or modified")
    print("=" * 80)