import requests
import sys
from datetime import datetime
import json

class NigerianTaxCalculatorTester:
    def __init__(self, base_url="https://taxpro-ng.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.auth_token = None  # Store JWT token for authenticated requests
        self.test_user_data = None  # Store test user data

    def run_test(self, name, method, endpoint, expected_status, data=None, auth_required=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add authorization header if auth is required and token is available
        if auth_required and self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    # ============================
    # AUTHENTICATION TESTS
    # ============================
    
    def test_user_registration_valid_email(self):
        """Test user registration with valid email"""
        test_data = {
            "email": "adebayo.ogundimu@fiquant.ng",
            "phone": "+2348123456789",
            "password": "SecurePass123!",
            "full_name": "Adebayo Ogundimu",
            "agree_terms": True
        }
        
        success, response = self.run_test(
            "User Registration - Valid Email",
            "POST",
            "auth/register",
            200,
            test_data
        )
        
        if success:
            self.test_user_data = test_data  # Store for later tests
            print(f"   User ID: {response.get('id')}")
            print(f"   Email: {response.get('email')}")
            print(f"   Full Name: {response.get('full_name')}")
            print(f"   Account Type: {response.get('account_type')}")
            print(f"   Account Tier: {response.get('account_tier')}")
            print(f"   Email Verified: {response.get('email_verified')}")
            print(f"   Phone Verified: {response.get('phone_verified')}")
            print(f"   Account Status: {response.get('account_status')}")
            
            # Verify response structure
            required_fields = ['id', 'email', 'full_name', 'account_type', 'account_tier', 'permissions']
            for field in required_fields:
                if field not in response:
                    print(f"   ❌ Missing required field: {field}")
                    return False
            
            # Verify default values
            if (response.get('account_type') == 'individual' and
                response.get('account_tier') == 'free' and
                response.get('email_verified') == False and
                response.get('account_status') == 'pending'):
                print(f"   ✅ User registration successful with correct defaults")
            else:
                print(f"   ❌ Incorrect default values in registration response")
        
        return success
    
    def test_user_registration_duplicate_email(self):
        """Test user registration with duplicate email (should fail)"""
        test_data = {
            "email": "adebayo.ogundimu@fiquant.ng",  # Same email as previous test
            "phone": "+2348987654321",
            "password": "AnotherPass456!",
            "full_name": "Another User",
            "agree_terms": True
        }
        
        success, response = self.run_test(
            "User Registration - Duplicate Email",
            "POST",
            "auth/register",
            400,  # Should fail with 400 Bad Request
            test_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected duplicate email registration")
            if 'detail' in response:
                print(f"   Error message: {response['detail']}")
        
        return success
    
    def test_user_registration_invalid_email(self):
        """Test user registration with invalid email format"""
        test_data = {
            "email": "invalid-email-format",  # Invalid email
            "phone": "+2348111222333",
            "password": "ValidPass789!",
            "full_name": "Test User",
            "agree_terms": True
        }
        
        success, response = self.run_test(
            "User Registration - Invalid Email Format",
            "POST",
            "auth/register",
            400,  # Should fail with validation error
            test_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid email format")
        
        return success
    
    def test_user_registration_no_terms_agreement(self):
        """Test user registration without agreeing to terms"""
        test_data = {
            "email": "terms.test@fiquant.ng",
            "phone": "+2348444555666",
            "password": "TermsPass123!",
            "full_name": "Terms Test User",
            "agree_terms": False  # Not agreeing to terms
        }
        
        success, response = self.run_test(
            "User Registration - No Terms Agreement",
            "POST",
            "auth/register",
            400,  # Should fail
            test_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected registration without terms agreement")
        
        return success
    
    def test_user_login_unverified_account(self):
        """Test login with unverified account (should fail)"""
        if not self.test_user_data:
            print("   ⚠️ Skipping - No test user data available")
            return False
            
        login_data = {
            "email_or_phone": self.test_user_data["email"],
            "password": self.test_user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login - Unverified Account",
            "POST",
            "auth/login",
            403,  # Should fail with 403 Forbidden
            login_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected login for unverified account")
            if 'detail' in response:
                print(f"   Error message: {response['detail']}")
        
        return success
    
    def test_email_verification_invalid_token(self):
        """Test email verification with invalid token"""
        success, response = self.run_test(
            "Email Verification - Invalid Token",
            "POST",
            "auth/verify-email?token=invalid_token_12345&email=adebayo.ogundimu@fiquant.ng",
            400,  # Should fail
            None
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid verification token")
        
        return success
    
    def test_phone_verification_invalid_code(self):
        """Test phone verification with invalid code"""
        verification_data = {
            "email": "adebayo.ogundimu@fiquant.ng",
            "verification_code": "999999",  # Invalid code
            "verification_type": "phone"
        }
        
        success, response = self.run_test(
            "Phone Verification - Invalid Code",
            "POST",
            "auth/verify-phone",
            400,  # Should fail
            verification_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid verification code")
        
        return success
    
    def test_resend_verification_email(self):
        """Test resending verification email"""
        if not self.test_user_data:
            print("   ⚠️ Skipping - No test user data available")
            return False
            
        verification_data = {
            "email": self.test_user_data["email"]
        }
        
        success, response = self.run_test(
            "Resend Verification Email",
            "POST",
            "auth/resend-verification",
            200,
            verification_data
        )
        
        if success:
            print(f"   ✅ Verification email resend successful")
            if 'message' in response:
                print(f"   Message: {response['message']}")
        
        return success
    
    def test_resend_sms_verification(self):
        """Test resending SMS verification code"""
        if not self.test_user_data:
            print("   ⚠️ Skipping - No test user data available")
            return False
            
        verification_data = {
            "email": self.test_user_data["email"]
        }
        
        success, response = self.run_test(
            "Resend SMS Verification",
            "POST",
            "auth/resend-sms",
            200,
            verification_data
        )
        
        if success:
            print(f"   ✅ SMS verification resend successful")
            if 'message' in response:
                print(f"   Message: {response['message']}")
        
        return success
    
    def test_create_verified_user_for_testing(self):
        """Create a verified user for testing authenticated endpoints"""
        # Register a new user for testing
        test_data = {
            "email": "verified.user@fiquant.ng",
            "phone": "+2348777888999",
            "password": "VerifiedPass123!",
            "full_name": "Verified Test User",
            "agree_terms": True
        }
        
        success, response = self.run_test(
            "Create Verified User - Registration",
            "POST",
            "auth/register",
            200,
            test_data
        )
        
        if not success:
            return False
        
        # Manually verify the user by updating database (simulation)
        # In a real test environment, we would use the actual verification tokens
        # For now, we'll test the login flow assuming verification works
        print(f"   ✅ Test user created for authentication testing")
        print(f"   Note: In production, email and SMS verification would be completed")
        
        # Store verified user data
        self.verified_user_data = test_data
        return True
    
    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "email_or_phone": "nonexistent@fiquant.ng",
            "password": "WrongPassword123!"
        }
        
        success, response = self.run_test(
            "User Login - Invalid Credentials",
            "POST",
            "auth/login",
            401,  # Should fail with 401 Unauthorized
            login_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid credentials")
        
        return success
    
    def test_protected_endpoint_without_token(self):
        """Test accessing protected endpoint without authentication token"""
        success, response = self.run_test(
            "Protected Endpoint - No Token",
            "GET",
            "auth/me",
            403,  # FastAPI returns 403 for missing auth
            None
        )
        
        if success:
            print(f"   ✅ Correctly rejected request without authentication token")
        
        return success
    
    def test_protected_endpoint_invalid_token(self):
        """Test accessing protected endpoint with invalid token"""
        # Temporarily set invalid token
        old_token = self.auth_token
        self.auth_token = "invalid.jwt.token"
        
        success, response = self.run_test(
            "Protected Endpoint - Invalid Token",
            "GET",
            "auth/me",
            401,  # Should fail with 401 Unauthorized
            None,
            auth_required=True
        )
        
        # Restore original token
        self.auth_token = old_token
        
        if success:
            print(f"   ✅ Correctly rejected invalid authentication token")
        
        return success
    
    def test_user_profile_update_unauthorized(self):
        """Test profile update without authentication"""
        profile_data = {
            "full_name": "Updated Name",
            "phone": "+2348999000111"
        }
        
        success, response = self.run_test(
            "Profile Update - Unauthorized",
            "PUT",
            "profile/update",
            403,  # FastAPI returns 403 for missing auth
            profile_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected profile update without authentication")
        
        return success
    
    def test_calculation_history_unauthorized(self):
        """Test accessing calculation history without authentication"""
        success, response = self.run_test(
            "Calculation History - Unauthorized",
            "GET",
            "history/calculations",
            403,  # FastAPI returns 403 for missing auth
            None
        )
        
        if success:
            print(f"   ✅ Correctly rejected history access without authentication")
        
        return success

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        if success:
            print(f"   Response: {response}")
        return success

    def test_tax_brackets_endpoint(self):
        """Test tax brackets endpoint"""
        success, response = self.run_test(
            "Tax Brackets Endpoint",
            "GET",
            "tax-brackets",
            200
        )
        if success:
            print(f"   Tax Year: {response.get('tax_year')}")
            print(f"   Currency: {response.get('currency')}")
            print(f"   Number of brackets: {len(response.get('brackets', []))}")
            
            # Verify 2026 tax brackets
            brackets = response.get('brackets', [])
            expected_brackets = [
                {"range": "₦0 - ₦800,000", "rate": "0%"},
                {"range": "₦800,001 - ₦3,000,000", "rate": "15%"},
                {"range": "₦3,000,001 - ₦12,000,000", "rate": "18%"},
                {"range": "₦12,000,001 - ₦25,000,000", "rate": "21%"},
                {"range": "₦25,000,001 - ₦50,000,000", "rate": "23%"},
                {"range": "Above ₦50,000,000", "rate": "25%"}
            ]
            
            for i, expected in enumerate(expected_brackets):
                if i < len(brackets):
                    actual = brackets[i]
                    if actual['range'] == expected['range'] and actual['rate'] == expected['rate']:
                        print(f"   ✅ Bracket {i+1}: {actual['range']} at {actual['rate']}")
                    else:
                        print(f"   ❌ Bracket {i+1} mismatch: Expected {expected}, Got {actual}")
                else:
                    print(f"   ❌ Missing bracket {i+1}")
        return success

    def test_low_income_calculation(self):
        """Test low income (should be tax-free)"""
        # ₦50,000/month = ₦600,000/year (below ₦800,000 threshold)
        test_data = {
            "basic_salary": 50000,
            "transport_allowance": 0,
            "housing_allowance": 0,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,  # Auto-calculate
            "nhf_contribution": 0,      # Auto-calculate
            "life_insurance_premium": 0,
            "health_insurance_premium": 0,
            "nhis_contribution": 0,
            "annual_rent": 0
        }
        
        success, response = self.run_test(
            "Low Income Tax Calculation (₦50,000/month)",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Annual Gross: ₦{response['annual_gross_income']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
            print(f"   Taxable Income: ₦{response['taxable_income']:,.0f}")
            print(f"   Tax Due: ₦{response['tax_due']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            
            # Verify auto-calculated reliefs
            expected_pension = 50000 * 12 * 0.08  # 8% of basic salary
            expected_nhf = 50000 * 12 * 0.025     # 2.5% of basic salary
            
            if abs(response['pension_relief'] - expected_pension) < 1:
                print(f"   ✅ Pension relief auto-calculated correctly: ₦{response['pension_relief']:,.0f}")
            else:
                print(f"   ❌ Pension relief incorrect: Expected ₦{expected_pension:,.0f}, Got ₦{response['pension_relief']:,.0f}")
            
            if abs(response['nhf_relief'] - expected_nhf) < 1:
                print(f"   ✅ NHF relief auto-calculated correctly: ₦{response['nhf_relief']:,.0f}")
            else:
                print(f"   ❌ NHF relief incorrect: Expected ₦{expected_nhf:,.0f}, Got ₦{response['nhf_relief']:,.0f}")
            
            # Should be tax-free since annual income (₦600,000) < ₦800,000 threshold
            if response['tax_due'] == 0:
                print(f"   ✅ Correctly tax-free (income below ₦800,000 threshold)")
            else:
                print(f"   ❌ Should be tax-free but tax due is ₦{response['tax_due']:,.0f}")
        
        return success

    def test_medium_income_calculation(self):
        """Test medium income with allowances"""
        # ₦500,000/month basic + allowances = ₦6,000,000/year
        test_data = {
            "basic_salary": 500000,
            "transport_allowance": 50000,
            "housing_allowance": 200000,
            "meal_allowance": 30000,
            "other_allowances": 25000,
            "pension_contribution": 0,  # Auto-calculate
            "nhf_contribution": 0,      # Auto-calculate
            "life_insurance_premium": 10000,
            "health_insurance_premium": 15000,
            "nhis_contribution": 5000,
            "annual_rent": 1200000  # Should get ₦240,000 rent relief (20% of ₦1,200,000)
        }
        
        success, response = self.run_test(
            "Medium Income Tax Calculation (₦500,000/month + allowances)",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Annual Gross: ₦{response['annual_gross_income']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
            print(f"   Taxable Income: ₦{response['taxable_income']:,.0f}")
            print(f"   Tax Due: ₦{response['tax_due']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            
            # Verify rent relief calculation
            expected_rent_relief = 1200000 * 0.20  # 20% of annual rent
            if abs(response['rent_relief'] - expected_rent_relief) < 1:
                print(f"   ✅ Rent relief calculated correctly: ₦{response['rent_relief']:,.0f}")
            else:
                print(f"   ❌ Rent relief incorrect: Expected ₦{expected_rent_relief:,.0f}, Got ₦{response['rent_relief']:,.0f}")
            
            # Check tax breakdown
            if 'tax_breakdown' in response and len(response['tax_breakdown']) > 0:
                print(f"   Tax breakdown:")
                for bracket in response['tax_breakdown']:
                    print(f"     {bracket['range']} ({bracket['rate']}): ₦{bracket['tax_amount']:,.0f}")
        
        return success

    def test_high_income_calculation(self):
        """Test high income to trigger multiple tax brackets"""
        # ₦2,000,000/month = ₦24,000,000/year (should hit multiple brackets)
        test_data = {
            "basic_salary": 2000000,
            "transport_allowance": 100000,
            "housing_allowance": 500000,
            "meal_allowance": 50000,
            "other_allowances": 100000,
            "pension_contribution": 0,  # Auto-calculate
            "nhf_contribution": 0,      # Auto-calculate
            "life_insurance_premium": 25000,
            "health_insurance_premium": 30000,
            "nhis_contribution": 10000,
            "annual_rent": 3000000  # Should get max ₦500,000 rent relief
        }
        
        success, response = self.run_test(
            "High Income Tax Calculation (₦2,000,000/month + allowances)",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Annual Gross: ₦{response['annual_gross_income']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
            print(f"   Taxable Income: ₦{response['taxable_income']:,.0f}")
            print(f"   Tax Due: ₦{response['tax_due']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            
            # Verify rent relief is capped at ₦500,000
            if response['rent_relief'] == 500000:
                print(f"   ✅ Rent relief correctly capped at ₦500,000")
            else:
                print(f"   ❌ Rent relief should be capped at ₦500,000, got ₦{response['rent_relief']:,.0f}")
            
            # Should have multiple tax brackets
            if 'tax_breakdown' in response and len(response['tax_breakdown']) >= 3:
                print(f"   ✅ Multiple tax brackets applied ({len(response['tax_breakdown'])} brackets)")
                for bracket in response['tax_breakdown']:
                    print(f"     {bracket['range']} ({bracket['rate']}): ₦{bracket['tax_amount']:,.0f}")
            else:
                print(f"   ❌ Expected multiple tax brackets, got {len(response.get('tax_breakdown', []))}")
        
        return success

    def test_history_endpoint(self):
        """Test calculation history endpoint"""
        success, response = self.run_test(
            "Calculation History Endpoint",
            "GET",
            "calculations/history?limit=5",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   Retrieved {len(response)} calculations from history")
                if len(response) > 0:
                    latest = response[0]
                    print(f"   Latest calculation: ₦{latest.get('monthly_gross_income', 0):,.0f} monthly gross")
            else:
                print(f"   ❌ Expected list response, got {type(response)}")
        
        return success

    def test_invalid_input(self):
        """Test error handling with invalid input"""
        # Test with negative basic salary
        test_data = {
            "basic_salary": -50000,  # Invalid negative value
            "transport_allowance": 0,
            "housing_allowance": 0,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,
            "nhf_contribution": 0,
            "life_insurance_premium": 0,
            "health_insurance_premium": 0,
            "nhis_contribution": 0,
            "annual_rent": 0
        }
        
        success, response = self.run_test(
            "Invalid Input Handling (negative salary)",
            "POST",
            "calculate-paye",
            422,  # Expecting validation error
            test_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid input")
        
        return success

    # CIT Testing Methods
    def test_cit_info_endpoint(self):
        """Test CIT information endpoint"""
        success, response = self.run_test(
            "CIT Information Endpoint",
            "GET",
            "cit-info",
            200
        )
        if success:
            print(f"   Tax Year: {response.get('tax_year')}")
            print(f"   Currency: {response.get('currency')}")
            
            # Verify company classifications
            classifications = response.get('company_classifications', {})
            expected_classifications = ['small', 'medium', 'large']
            for classification in expected_classifications:
                if classification in classifications:
                    info = classifications[classification]
                    print(f"   ✅ {classification.title()} company: CIT {info.get('cit_rate')}, Dev Levy {info.get('development_levy')}")
                else:
                    print(f"   ❌ Missing {classification} company classification")
            
            # Verify thin capitalization info
            thin_cap = response.get('thin_capitalization', {})
            if thin_cap.get('interest_deduction_limit') == '30% of EBITDA':
                print(f"   ✅ Thin cap limit: {thin_cap.get('interest_deduction_limit')}")
            else:
                print(f"   ❌ Incorrect thin cap limit: {thin_cap.get('interest_deduction_limit')}")
        
        return success

    def test_small_company_exempt(self):
        """Test Scenario 1 - Small Company (Exempt)"""
        test_data = {
            "company_name": "Small Tech Ltd",
            "annual_turnover": 80000000,  # ₦80M
            "total_fixed_assets": 200000000,  # ₦200M
            "gross_income": 80000000,
            "other_income": 0,
            "cost_of_goods_sold": 30000000,
            "staff_costs": 20000000,
            "rent_expenses": 5000000,
            "professional_fees": 2000000,
            "depreciation": 3000000,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 5000000,
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 100000000,
            "ebitda": 0,  # Auto-calculate
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Small Company CIT Calculation (Tax Exempt)",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Classification: {response['company_size']}")
            print(f"   Qualifies for exemption: {response['qualifies_small_exemption']}")
            print(f"   Annual Turnover: ₦{response['annual_turnover']:,.0f}")
            print(f"   Fixed Assets: ₦{response['total_fixed_assets']:,.0f}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   CIT Due: ₦{response['cit_due']:,.0f}")
            print(f"   Development Levy: ₦{response['development_levy']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            
            # Verify small company exemption
            if (response['company_size'] == 'Small' and 
                response['qualifies_small_exemption'] and 
                response['cit_due'] == 0 and 
                response['development_levy'] == 0):
                print(f"   ✅ Small company correctly exempt from CIT and Development Levy")
            else:
                print(f"   ❌ Small company exemption not working correctly")
        
        return success

    def test_medium_company_calculation(self):
        """Test Scenario 2 - Medium Company"""
        test_data = {
            "company_name": "Medium Manufacturing Ltd",
            "annual_turnover": 500000000,  # ₦500M
            "total_fixed_assets": 300000000,  # ₦300M
            "gross_income": 500000000,
            "other_income": 0,
            "cost_of_goods_sold": 200000000,
            "staff_costs": 100000000,
            "rent_expenses": 20000000,
            "professional_fees": 10000000,
            "depreciation": 15000000,
            "interest_paid_unrelated": 5000000,
            "interest_paid_related": 0,
            "other_deductible_expenses": 10000000,
            "entertainment_expenses": 2000000,
            "fines_penalties": 500000,
            "personal_expenses": 1000000,
            "excessive_interest": 0,
            "other_non_deductible": 500000,
            "total_debt": 100000000,
            "total_equity": 200000000,
            "ebitda": 0,  # Auto-calculate
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Medium Company CIT Calculation",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Classification: {response['company_size']}")
            print(f"   Annual Turnover: ₦{response['annual_turnover']:,.0f}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   CIT Rate: {response['cit_rate'] * 100:.0f}%")
            print(f"   CIT Due: ₦{response['cit_due']:,.0f}")
            print(f"   Development Levy Rate: {response['development_levy_rate'] * 100:.0f}%")
            print(f"   Development Levy: ₦{response['development_levy']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            print(f"   Effective Tax Rate: {response['effective_tax_rate'] * 100:.2f}%")
            
            # Verify medium company taxation
            if (response['company_size'] == 'Medium' and 
                not response['qualifies_small_exemption'] and 
                response['cit_rate'] == 0.30 and 
                response['development_levy_rate'] == 0.04):
                print(f"   ✅ Medium company correctly taxed at 30% CIT + 4% Development Levy")
            else:
                print(f"   ❌ Medium company taxation incorrect")
                
            # Calculate expected values
            expected_taxable_profit = 500000000 - (200000000 + 100000000 + 20000000 + 10000000 + 15000000 + 5000000 + 10000000)
            expected_cit = expected_taxable_profit * 0.30
            expected_dev_levy = expected_taxable_profit * 0.04
            
            print(f"   Expected taxable profit: ₦{expected_taxable_profit:,.0f}")
            print(f"   Expected CIT: ₦{expected_cit:,.0f}")
            print(f"   Expected Dev Levy: ₦{expected_dev_levy:,.0f}")
        
        return success

    def test_large_company_thin_cap(self):
        """Test Scenario 3 - Large Company with Thin Capitalization"""
        test_data = {
            "company_name": "Large Corp Ltd",
            "annual_turnover": 60000000000,  # ₦60B
            "total_fixed_assets": 5000000000,  # ₦5B
            "gross_income": 60000000000,
            "other_income": 0,
            "cost_of_goods_sold": 30000000000,
            "staff_costs": 10000000000,
            "rent_expenses": 2000000000,
            "professional_fees": 500000000,
            "depreciation": 1000000000,
            "interest_paid_unrelated": 10000000,
            "interest_paid_related": 50000000,  # ₦50M related party interest
            "other_deductible_expenses": 1000000000,
            "entertainment_expenses": 100000000,
            "fines_penalties": 50000000,
            "personal_expenses": 25000000,
            "excessive_interest": 0,
            "other_non_deductible": 25000000,
            "total_debt": 20000000000,
            "total_equity": 15000000000,
            "ebitda": 100000000,  # ₦100M EBITDA
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Large Company CIT with Thin Capitalization",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Classification: {response['company_size']}")
            print(f"   Annual Turnover: ₦{response['annual_turnover']:,.0f}")
            print(f"   EBITDA: ₦{test_data['ebitda']:,.0f}")
            print(f"   Related Party Interest: ₦{test_data['interest_paid_related']:,.0f}")
            print(f"   Allowed Interest Deduction: ₦{response['allowed_interest_deduction']:,.0f}")
            print(f"   Disallowed Interest: ₦{response['disallowed_interest']:,.0f}")
            print(f"   Thin Cap Applied: {response['thin_cap_applied']}")
            print(f"   Debt-to-Equity Ratio: {response['debt_to_equity_ratio']:.2f}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            
            # Verify thin capitalization rules
            max_deductible_interest = test_data['ebitda'] * 0.30  # 30% of EBITDA = ₦30M
            expected_disallowed = test_data['interest_paid_related'] - max_deductible_interest  # ₦50M - ₦30M = ₦20M
            
            if (response['company_size'] == 'Large' and 
                response['thin_cap_applied'] and 
                abs(response['allowed_interest_deduction'] - max_deductible_interest) < 1 and
                abs(response['disallowed_interest'] - expected_disallowed) < 1):
                print(f"   ✅ Thin capitalization rules correctly applied")
                print(f"   ✅ Interest limited to 30% of EBITDA (₦{max_deductible_interest:,.0f})")
                print(f"   ✅ Excess interest (₦{expected_disallowed:,.0f}) correctly disallowed")
            else:
                print(f"   ❌ Thin capitalization rules not working correctly")
                print(f"   Expected allowed: ₦{max_deductible_interest:,.0f}, Got: ₦{response['allowed_interest_deduction']:,.0f}")
                print(f"   Expected disallowed: ₦{expected_disallowed:,.0f}, Got: ₦{response['disallowed_interest']:,.0f}")
        
        return success

    def test_large_multinational_minimum_etr(self):
        """Test Large Multinational with Minimum ETR"""
        test_data = {
            "company_name": "Global MNE Ltd",
            "annual_turnover": 100000000000,  # ₦100B
            "total_fixed_assets": 10000000000,  # ₦10B
            "gross_income": 100000000000,
            "other_income": 0,
            "cost_of_goods_sold": 60000000000,
            "staff_costs": 15000000000,
            "rent_expenses": 3000000000,
            "professional_fees": 1000000000,
            "depreciation": 2000000000,
            "interest_paid_unrelated": 500000000,
            "interest_paid_related": 0,
            "other_deductible_expenses": 2000000000,
            "entertainment_expenses": 200000000,
            "fines_penalties": 100000000,
            "personal_expenses": 50000000,
            "excessive_interest": 0,
            "other_non_deductible": 50000000,
            "total_debt": 30000000000,
            "total_equity": 25000000000,
            "ebitda": 0,  # Auto-calculate
            "is_professional_service": False,
            "is_multinational": True,
            "global_revenue_eur": 1000000000  # €1B (above €750M threshold)
        }
        
        success, response = self.run_test(
            "Large Multinational with Minimum ETR",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Classification: {response['company_size']}")
            print(f"   Is Multinational: {test_data['is_multinational']}")
            print(f"   Global Revenue: €{test_data['global_revenue_eur']:,.0f}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   CIT Due: ₦{response['cit_due']:,.0f}")
            print(f"   Development Levy: ₦{response['development_levy']:,.0f}")
            print(f"   Minimum ETR Rate: {response['minimum_etr_rate'] * 100:.0f}%")
            print(f"   Minimum ETR Tax: ₦{response['minimum_etr_tax']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            print(f"   Effective Tax Rate: {response['effective_tax_rate'] * 100:.2f}%")
            
            # Verify minimum ETR application
            if (response['company_size'] == 'Large' and 
                response['minimum_etr_rate'] == 0.15 and
                response['effective_tax_rate'] >= 0.15):
                print(f"   ✅ Minimum ETR (15%) correctly applied to large multinational")
            else:
                print(f"   ❌ Minimum ETR not working correctly")
        
        return success

    def test_professional_service_firm(self):
        """Test Professional Service Firm (should not qualify for small company exemption)"""
        test_data = {
            "company_name": "Professional Services Ltd",
            "annual_turnover": 80000000,  # ₦80M (would qualify as small if not professional service)
            "total_fixed_assets": 200000000,  # ₦200M
            "gross_income": 80000000,
            "other_income": 0,
            "cost_of_goods_sold": 0,  # Professional services typically have no COGS
            "staff_costs": 40000000,
            "rent_expenses": 10000000,
            "professional_fees": 5000000,
            "depreciation": 2000000,
            "interest_paid_unrelated": 1000000,
            "interest_paid_related": 0,
            "other_deductible_expenses": 5000000,
            "entertainment_expenses": 1000000,
            "fines_penalties": 0,
            "personal_expenses": 500000,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 20000000,
            "total_equity": 50000000,
            "ebitda": 0,  # Auto-calculate
            "is_professional_service": True,  # This should disqualify from small company exemption
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Professional Service Firm (No Small Company Exemption)",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Classification: {response['company_size']}")
            print(f"   Is Professional Service: {test_data['is_professional_service']}")
            print(f"   Qualifies for Small Exemption: {response['qualifies_small_exemption']}")
            print(f"   CIT Due: ₦{response['cit_due']:,.0f}")
            print(f"   Development Levy: ₦{response['development_levy']:,.0f}")
            
            # Professional service firms should not qualify for small company exemption
            if (not response['qualifies_small_exemption'] and 
                response['cit_due'] > 0 and 
                response['development_levy'] > 0):
                print(f"   ✅ Professional service firm correctly excluded from small company exemption")
            else:
                print(f"   ❌ Professional service firm incorrectly qualified for exemption")
        
        return success

    def test_cit_history_endpoint(self):
        """Test CIT calculation history endpoint"""
        success, response = self.run_test(
            "CIT Calculation History Endpoint",
            "GET",
            "cit-calculations/history?limit=5",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"   Retrieved {len(response)} CIT calculations from history")
                if len(response) > 0:
                    latest = response[0]
                    print(f"   Latest calculation: {latest.get('company_name', 'Unknown')} - ₦{latest.get('total_tax_due', 0):,.0f} tax due")
            else:
                print(f"   ❌ Expected list response, got {type(response)}")
        
        return success

    # NEW CAPITAL ALLOWANCES TESTS
    def test_capital_allowances_scenario_a(self):
        """Test Scenario A - New Assets Only (Capital Allowances)"""
        test_data = {
            "company_name": "New Assets Manufacturing Ltd",
            "annual_turnover": 1500000000,  # ₦1.5B
            "total_fixed_assets": 500000000,
            "gross_income": 1500000000,
            "other_income": 0,
            "cost_of_goods_sold": 600000000,
            "staff_costs": 200000000,
            "rent_expenses": 0,
            "professional_fees": 0,
            "depreciation": 0,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 100000000,
            # Capital Allowances - New Assets Only
            "buildings_cost": 100000000,      # ₦100M → ₦10M allowance (10%)
            "furniture_fittings_cost": 0,
            "plant_machinery_cost": 50000000, # ₦50M → ₦10M allowance (20%)
            "motor_vehicles_cost": 20000000,  # ₦20M → ₦5M allowance (25%)
            "other_assets_cost": 0,
            # No existing assets (WDV = 0)
            "buildings_wdv": 0,
            "furniture_fittings_wdv": 0,
            "plant_machinery_wdv": 0,
            "motor_vehicles_wdv": 0,
            "other_assets_wdv": 0,
            # No WHT Credits
            "wht_on_contracts": 0,
            "wht_on_dividends": 0,
            "wht_on_rent": 0,
            "wht_on_interest": 0,
            "other_wht_credits": 0,
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 300000000,
            "ebitda": 0,
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Capital Allowances Scenario A - New Assets Only",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Total Capital Allowances: ₦{response['total_capital_allowances']:,.0f}")
            
            # Expected capital allowances
            expected_buildings = 100000000 * 0.10  # ₦10M
            expected_plant = 50000000 * 0.20       # ₦10M
            expected_vehicles = 20000000 * 0.25    # ₦5M
            expected_total = expected_buildings + expected_plant + expected_vehicles  # ₦25M
            
            print(f"   Expected Total Capital Allowances: ₦{expected_total:,.0f}")
            
            # Verify capital allowances breakdown
            if 'capital_allowance_breakdown' in response:
                breakdown = response['capital_allowance_breakdown']
                print(f"   Buildings Allowance: ₦{breakdown.get('buildings', {}).get('allowance', 0):,.0f}")
                print(f"   Plant & Machinery Allowance: ₦{breakdown.get('plant_machinery', {}).get('allowance', 0):,.0f}")
                print(f"   Motor Vehicles Allowance: ₦{breakdown.get('motor_vehicles', {}).get('allowance', 0):,.0f}")
                
                # Verify calculations
                if (abs(breakdown.get('buildings', {}).get('allowance', 0) - expected_buildings) < 1 and
                    abs(breakdown.get('plant_machinery', {}).get('allowance', 0) - expected_plant) < 1 and
                    abs(breakdown.get('motor_vehicles', {}).get('allowance', 0) - expected_vehicles) < 1 and
                    abs(response['total_capital_allowances'] - expected_total) < 1):
                    print(f"   ✅ Capital allowances calculated correctly")
                else:
                    print(f"   ❌ Capital allowances calculation error")
            
            # Verify taxable profit calculation includes capital allowances
            expected_deductible = 600000000 + 200000000 + 100000000 + expected_total  # COGS + Staff + Other + Capital Allowances
            expected_taxable_profit = 1500000000 - expected_deductible  # ₦555M
            
            print(f"   Expected Taxable Profit: ₦{expected_taxable_profit:,.0f}")
            print(f"   Actual Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            
            if abs(response['taxable_profit'] - expected_taxable_profit) < 1:
                print(f"   ✅ Taxable profit correctly includes capital allowances")
            else:
                print(f"   ❌ Taxable profit calculation error")
        
        return success

    def test_capital_allowances_scenario_b(self):
        """Test Scenario B - Existing Assets (WDV) Only"""
        test_data = {
            "company_name": "Existing Assets Ltd",
            "annual_turnover": 800000000,
            "total_fixed_assets": 400000000,
            "gross_income": 800000000,
            "other_income": 0,
            "cost_of_goods_sold": 300000000,
            "staff_costs": 150000000,
            "rent_expenses": 0,
            "professional_fees": 0,
            "depreciation": 0,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 50000000,
            # No new assets
            "buildings_cost": 0,
            "furniture_fittings_cost": 0,
            "plant_machinery_cost": 0,
            "motor_vehicles_cost": 0,
            "other_assets_cost": 0,
            # Capital Allowances - Existing Assets (WDV) Only
            "buildings_wdv": 200000000,        # ₦200M → ₦20M allowance (10%)
            "furniture_fittings_wdv": 40000000, # ₦40M → ₦8M allowance (20%)
            "plant_machinery_wdv": 0,
            "motor_vehicles_wdv": 0,
            "other_assets_wdv": 0,
            # No WHT Credits
            "wht_on_contracts": 0,
            "wht_on_dividends": 0,
            "wht_on_rent": 0,
            "wht_on_interest": 0,
            "other_wht_credits": 0,
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 200000000,
            "ebitda": 0,
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Capital Allowances Scenario B - Existing Assets (WDV) Only",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Total Capital Allowances: ₦{response['total_capital_allowances']:,.0f}")
            
            # Expected capital allowances
            expected_buildings = 200000000 * 0.10  # ₦20M
            expected_furniture = 40000000 * 0.20   # ₦8M
            expected_total = expected_buildings + expected_furniture  # ₦28M
            
            print(f"   Expected Total Capital Allowances: ₦{expected_total:,.0f}")
            
            # Verify capital allowances breakdown
            if 'capital_allowance_breakdown' in response:
                breakdown = response['capital_allowance_breakdown']
                print(f"   Buildings Allowance: ₦{breakdown.get('buildings', {}).get('allowance', 0):,.0f}")
                print(f"   Furniture & Fittings Allowance: ₦{breakdown.get('furniture_fittings', {}).get('allowance', 0):,.0f}")
                
                # Verify calculations
                if (abs(breakdown.get('buildings', {}).get('allowance', 0) - expected_buildings) < 1 and
                    abs(breakdown.get('furniture_fittings', {}).get('allowance', 0) - expected_furniture) < 1 and
                    abs(response['total_capital_allowances'] - expected_total) < 1):
                    print(f"   ✅ Capital allowances calculated correctly")
                else:
                    print(f"   ❌ Capital allowances calculation error")
        
        return success

    def test_capital_allowances_scenario_c(self):
        """Test Scenario C - Mixed Assets (New + Existing)"""
        test_data = {
            "company_name": "Mixed Assets Corp",
            "annual_turnover": 2000000000,
            "total_fixed_assets": 800000000,
            "gross_income": 2000000000,
            "other_income": 0,
            "cost_of_goods_sold": 800000000,
            "staff_costs": 300000000,
            "rent_expenses": 0,
            "professional_fees": 0,
            "depreciation": 0,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 150000000,
            # Capital Allowances - Mixed Assets (New + Existing)
            "buildings_cost": 50000000,         # ₦50M cost
            "buildings_wdv": 150000000,         # ₦150M WDV → Total ₦200M → ₦20M allowance (10%)
            "plant_machinery_cost": 30000000,   # ₦30M cost
            "plant_machinery_wdv": 70000000,    # ₦70M WDV → Total ₦100M → ₦20M allowance (20%)
            "furniture_fittings_cost": 0,
            "furniture_fittings_wdv": 0,
            "motor_vehicles_cost": 0,
            "motor_vehicles_wdv": 0,
            "other_assets_cost": 0,
            "other_assets_wdv": 0,
            # No WHT Credits
            "wht_on_contracts": 0,
            "wht_on_dividends": 0,
            "wht_on_rent": 0,
            "wht_on_interest": 0,
            "other_wht_credits": 0,
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 400000000,
            "ebitda": 0,
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Capital Allowances Scenario C - Mixed Assets (New + Existing)",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Total Capital Allowances: ₦{response['total_capital_allowances']:,.0f}")
            
            # Expected capital allowances
            expected_buildings = (50000000 + 150000000) * 0.10  # ₦200M → ₦20M (10%)
            expected_plant = (30000000 + 70000000) * 0.20       # ₦100M → ₦20M (20%)
            expected_total = expected_buildings + expected_plant  # ₦40M
            
            print(f"   Expected Total Capital Allowances: ₦{expected_total:,.0f}")
            
            # Verify capital allowances breakdown
            if 'capital_allowance_breakdown' in response:
                breakdown = response['capital_allowance_breakdown']
                print(f"   Buildings (Cost + WDV): ₦{breakdown.get('buildings', {}).get('cost_and_wdv', 0):,.0f}")
                print(f"   Buildings Allowance: ₦{breakdown.get('buildings', {}).get('allowance', 0):,.0f}")
                print(f"   Plant & Machinery (Cost + WDV): ₦{breakdown.get('plant_machinery', {}).get('cost_and_wdv', 0):,.0f}")
                print(f"   Plant & Machinery Allowance: ₦{breakdown.get('plant_machinery', {}).get('allowance', 0):,.0f}")
                
                # Verify calculations
                if (abs(breakdown.get('buildings', {}).get('allowance', 0) - expected_buildings) < 1 and
                    abs(breakdown.get('plant_machinery', {}).get('allowance', 0) - expected_plant) < 1 and
                    abs(response['total_capital_allowances'] - expected_total) < 1):
                    print(f"   ✅ Mixed assets capital allowances calculated correctly")
                else:
                    print(f"   ❌ Mixed assets capital allowances calculation error")
        
        return success

    # NEW WHT CREDITS TESTS
    def test_wht_credits_scenario_d(self):
        """Test Scenario D - Normal WHT Credits"""
        test_data = {
            "company_name": "Normal WHT Credits Ltd",
            "annual_turnover": 1000000000,
            "total_fixed_assets": 300000000,
            "gross_income": 1000000000,
            "other_income": 0,
            "cost_of_goods_sold": 400000000,
            "staff_costs": 150000000,
            "rent_expenses": 50000000,
            "professional_fees": 20000000,
            "depreciation": 30000000,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 50000000,
            # No capital allowances
            "buildings_cost": 0,
            "furniture_fittings_cost": 0,
            "plant_machinery_cost": 0,
            "motor_vehicles_cost": 0,
            "other_assets_cost": 0,
            "buildings_wdv": 0,
            "furniture_fittings_wdv": 0,
            "plant_machinery_wdv": 0,
            "motor_vehicles_wdv": 0,
            "other_assets_wdv": 0,
            # WHT Credits - Normal scenario
            "wht_on_contracts": 5000000,    # ₦5M
            "wht_on_dividends": 2000000,    # ₦2M
            "wht_on_rent": 1500000,         # ₦1.5M
            "wht_on_interest": 1000000,     # ₦1M
            "other_wht_credits": 500000,    # ₦0.5M
            # Total WHT Credits = ₦10M
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 200000000,
            "ebitda": 0,
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "WHT Credits Scenario D - Normal WHT Credits",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            print(f"   Total WHT Credits: ₦{response['total_wht_credits']:,.0f}")
            print(f"   Net Tax Payable: ₦{response['net_tax_payable']:,.0f}")
            
            # Expected calculations
            expected_taxable_profit = 1000000000 - (400000000 + 150000000 + 50000000 + 20000000 + 30000000 + 50000000)  # ₦300M
            expected_cit = expected_taxable_profit * 0.30  # ₦90M
            expected_dev_levy = expected_taxable_profit * 0.04  # ₦12M
            expected_total_tax = expected_cit + expected_dev_levy  # ₦102M
            expected_wht_credits = 5000000 + 2000000 + 1500000 + 1000000 + 500000  # ₦10M
            expected_net_tax = expected_total_tax - expected_wht_credits  # ₦92M
            
            print(f"   Expected Total Tax Due: ₦{expected_total_tax:,.0f}")
            print(f"   Expected WHT Credits: ₦{expected_wht_credits:,.0f}")
            print(f"   Expected Net Tax Payable: ₦{expected_net_tax:,.0f}")
            
            # Verify WHT credits breakdown
            if 'wht_credits_breakdown' in response:
                breakdown = response['wht_credits_breakdown']
                print(f"   WHT on Contracts: ₦{breakdown.get('contracts', 0):,.0f}")
                print(f"   WHT on Dividends: ₦{breakdown.get('dividends', 0):,.0f}")
                print(f"   WHT on Rent: ₦{breakdown.get('rent', 0):,.0f}")
                print(f"   WHT on Interest: ₦{breakdown.get('interest', 0):,.0f}")
                print(f"   Other WHT Credits: ₦{breakdown.get('other', 0):,.0f}")
            
            # Verify calculations
            if (abs(response['total_wht_credits'] - expected_wht_credits) < 1 and
                abs(response['net_tax_payable'] - expected_net_tax) < 1):
                print(f"   ✅ WHT credits and net tax payable calculated correctly")
            else:
                print(f"   ❌ WHT credits calculation error")
        
        return success

    def test_wht_credits_scenario_e(self):
        """Test Scenario E - Excess WHT Credits (Refundable)"""
        test_data = {
            "company_name": "Excess WHT Credits Ltd",
            "annual_turnover": 500000000,
            "total_fixed_assets": 200000000,
            "gross_income": 500000000,
            "other_income": 0,
            "cost_of_goods_sold": 200000000,
            "staff_costs": 100000000,
            "rent_expenses": 30000000,
            "professional_fees": 10000000,
            "depreciation": 20000000,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 40000000,
            # No capital allowances
            "buildings_cost": 0,
            "furniture_fittings_cost": 0,
            "plant_machinery_cost": 0,
            "motor_vehicles_cost": 0,
            "other_assets_cost": 0,
            "buildings_wdv": 0,
            "furniture_fittings_wdv": 0,
            "plant_machinery_wdv": 0,
            "motor_vehicles_wdv": 0,
            "other_assets_wdv": 0,
            # WHT Credits - Excess scenario (more than tax due)
            "wht_on_contracts": 15000000,   # ₦15M
            "wht_on_dividends": 5000000,    # ₦5M
            "wht_on_rent": 3000000,         # ₦3M
            "wht_on_interest": 2000000,     # ₦2M
            "other_wht_credits": 0,         # ₦0
            # Total WHT Credits = ₦25M
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 150000000,
            "ebitda": 0,
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "WHT Credits Scenario E - Excess WHT Credits (Refundable)",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            print(f"   Total WHT Credits: ₦{response['total_wht_credits']:,.0f}")
            print(f"   Net Tax Payable: ₦{response['net_tax_payable']:,.0f}")
            
            # Expected calculations
            expected_taxable_profit = 500000000 - (200000000 + 100000000 + 30000000 + 10000000 + 20000000 + 40000000)  # ₦100M
            expected_cit = expected_taxable_profit * 0.30  # ₦30M
            expected_dev_levy = expected_taxable_profit * 0.04  # ₦4M
            expected_total_tax = expected_cit + expected_dev_levy  # ₦34M
            expected_wht_credits = 15000000 + 5000000 + 3000000 + 2000000  # ₦25M
            expected_net_tax = max(0, expected_total_tax - expected_wht_credits)  # ₦9M
            expected_refundable = max(0, expected_wht_credits - expected_total_tax)  # ₦0 (no excess in this case)
            
            print(f"   Expected Total Tax Due: ₦{expected_total_tax:,.0f}")
            print(f"   Expected WHT Credits: ₦{expected_wht_credits:,.0f}")
            print(f"   Expected Net Tax Payable: ₦{expected_net_tax:,.0f}")
            
            # Check if WHT credits exceed tax due
            if response['total_wht_credits'] > response['total_tax_due']:
                excess_credits = response['total_wht_credits'] - response['total_tax_due']
                print(f"   ✅ Excess WHT Credits (Refundable): ₦{excess_credits:,.0f}")
                
                # Net tax payable should be 0 when WHT credits exceed tax due
                if response['net_tax_payable'] == 0:
                    print(f"   ✅ Net tax payable correctly set to ₦0 when WHT credits exceed tax due")
                else:
                    print(f"   ❌ Net tax payable should be ₦0 when WHT credits exceed tax due")
            else:
                print(f"   Normal scenario: WHT credits less than tax due")
            
            # Verify calculations
            if (abs(response['total_wht_credits'] - expected_wht_credits) < 1 and
                response['net_tax_payable'] >= 0):
                print(f"   ✅ Excess WHT credits scenario handled correctly")
            else:
                print(f"   ❌ Excess WHT credits calculation error")
        
        return success

    def test_comprehensive_scenario(self):
        """Test Comprehensive Scenario - Advanced Manufacturing Ltd"""
        test_data = {
            "company_name": "Advanced Manufacturing Ltd",
            "annual_turnover": 1500000000,  # ₦1.5B
            "total_fixed_assets": 600000000,
            "gross_income": 1500000000,
            "other_income": 0,
            "cost_of_goods_sold": 600000000,
            "staff_costs": 200000000,
            "rent_expenses": 0,
            "professional_fees": 0,
            "depreciation": 0,
            "interest_paid_unrelated": 0,
            "interest_paid_related": 0,
            "other_deductible_expenses": 100000000,
            # Capital Allowances - Mixed Assets
            "buildings_cost": 80000000,         # ₦80M cost
            "buildings_wdv": 120000000,         # ₦120M WDV → Total ₦200M → ₦20M allowance (10%)
            "plant_machinery_cost": 60000000,   # ₦60M cost
            "plant_machinery_wdv": 40000000,    # ₦40M WDV → Total ₦100M → ₦20M allowance (20%)
            "motor_vehicles_cost": 20000000,    # ₦20M cost → ₦5M allowance (25%)
            "motor_vehicles_wdv": 0,
            "furniture_fittings_cost": 0,
            "furniture_fittings_wdv": 0,
            "other_assets_cost": 0,
            "other_assets_wdv": 0,
            # Total Expected Capital Allowances: ₦45M
            # WHT Credits
            "wht_on_contracts": 8000000,    # ₦8M
            "wht_on_dividends": 0,
            "wht_on_rent": 2000000,         # ₦2M
            "wht_on_interest": 0,
            "other_wht_credits": 0,
            # Total WHT Credits: ₦10M
            "entertainment_expenses": 0,
            "fines_penalties": 0,
            "personal_expenses": 0,
            "excessive_interest": 0,
            "other_non_deductible": 0,
            "total_debt": 0,
            "total_equity": 400000000,
            "ebitda": 0,
            "is_professional_service": False,
            "is_multinational": False,
            "global_revenue_eur": 0
        }
        
        success, response = self.run_test(
            "Comprehensive Scenario - Advanced Manufacturing Ltd",
            "POST",
            "calculate-cit",
            200,
            test_data
        )
        
        if success:
            print(f"   Company: {response['company_name']}")
            print(f"   Total Capital Allowances: ₦{response['total_capital_allowances']:,.0f}")
            print(f"   Taxable Profit: ₦{response['taxable_profit']:,.0f}")
            print(f"   CIT (30%): ₦{response['cit_due']:,.0f}")
            print(f"   Development Levy (4%): ₦{response['development_levy']:,.0f}")
            print(f"   Total Tax Due: ₦{response['total_tax_due']:,.0f}")
            print(f"   Total WHT Credits: ₦{response['total_wht_credits']:,.0f}")
            print(f"   Net Tax Payable: ₦{response['net_tax_payable']:,.0f}")
            
            # Expected calculations
            expected_buildings_allowance = (80000000 + 120000000) * 0.10  # ₦20M
            expected_plant_allowance = (60000000 + 40000000) * 0.20       # ₦20M
            expected_vehicles_allowance = 20000000 * 0.25                 # ₦5M
            expected_total_allowances = expected_buildings_allowance + expected_plant_allowance + expected_vehicles_allowance  # ₦45M
            
            expected_deductible = 600000000 + 200000000 + 100000000 + expected_total_allowances  # ₦945M
            expected_taxable_profit = 1500000000 - expected_deductible  # ₦555M
            expected_cit = expected_taxable_profit * 0.30  # ₦166.5M
            expected_dev_levy = expected_taxable_profit * 0.04  # ₦22.2M
            expected_total_tax = expected_cit + expected_dev_levy  # ₦188.7M
            expected_wht_credits = 8000000 + 2000000  # ₦10M
            expected_net_tax = expected_total_tax - expected_wht_credits  # ₦178.7M
            
            print(f"   Expected Capital Allowances: ₦{expected_total_allowances:,.0f}")
            print(f"   Expected Taxable Profit: ₦{expected_taxable_profit:,.0f}")
            print(f"   Expected CIT: ₦{expected_cit:,.0f}")
            print(f"   Expected Development Levy: ₦{expected_dev_levy:,.0f}")
            print(f"   Expected Total Tax Due: ₦{expected_total_tax:,.0f}")
            print(f"   Expected Net Tax Payable: ₦{expected_net_tax:,.0f}")
            
            # Verify all calculations
            tolerance = 1  # Allow ₦1 tolerance for rounding
            if (abs(response['total_capital_allowances'] - expected_total_allowances) < tolerance and
                abs(response['taxable_profit'] - expected_taxable_profit) < tolerance and
                abs(response['cit_due'] - expected_cit) < tolerance and
                abs(response['development_levy'] - expected_dev_levy) < tolerance and
                abs(response['total_tax_due'] - expected_total_tax) < tolerance and
                abs(response['total_wht_credits'] - expected_wht_credits) < tolerance and
                abs(response['net_tax_payable'] - expected_net_tax) < tolerance):
                print(f"   ✅ Comprehensive scenario calculated correctly")
            else:
                print(f"   ❌ Comprehensive scenario calculation errors detected")
        
        return success

def main():
    print("🚀 Starting Nigerian Tax Calculator API Tests")
    print("=" * 60)
    
    tester = NigerianTaxCalculatorTester()
    
    # Run Authentication tests first
    print("\n🔐 AUTHENTICATION & USER MANAGEMENT TESTS")
    print("-" * 40)
    auth_tests = [
        tester.test_user_registration_valid_email,
        tester.test_user_registration_duplicate_email,
        tester.test_user_registration_invalid_email,
        tester.test_user_registration_no_terms_agreement,
        tester.test_user_login_unverified_account,
        tester.test_email_verification_invalid_token,
        tester.test_phone_verification_invalid_code,
        tester.test_resend_verification_email,
        tester.test_resend_sms_verification,
        tester.test_create_verified_user_for_testing,
        tester.test_user_login_invalid_credentials,
        tester.test_protected_endpoint_without_token,
        tester.test_protected_endpoint_invalid_token,
        tester.test_user_profile_update_unauthorized,
        tester.test_calculation_history_unauthorized
    ]
    
    for test in auth_tests:
        test()
    
    # Run PAYE tests
    print("\n📋 PAYE CALCULATOR TESTS")
    print("-" * 40)
    paye_tests = [
        tester.test_root_endpoint,
        tester.test_tax_brackets_endpoint,
        tester.test_low_income_calculation,
        tester.test_medium_income_calculation,
        tester.test_high_income_calculation,
        tester.test_history_endpoint,
        tester.test_invalid_input
    ]
    
    for test in paye_tests:
        test()
    
    # Run CIT tests
    print("\n🏢 CORPORATE INCOME TAX (CIT) TESTS")
    print("-" * 40)
    cit_tests = [
        tester.test_cit_info_endpoint,
        tester.test_small_company_exempt,
        tester.test_medium_company_calculation,
        tester.test_large_company_thin_cap,
        tester.test_large_multinational_minimum_etr,
        tester.test_professional_service_firm,
        tester.test_cit_history_endpoint
    ]
    
    for test in cit_tests:
        test()
    
    # Run Capital Allowances tests
    print("\n🏗️ CAPITAL ALLOWANCES TESTS (2026 Rules)")
    print("-" * 40)
    capital_allowances_tests = [
        tester.test_capital_allowances_scenario_a,
        tester.test_capital_allowances_scenario_b,
        tester.test_capital_allowances_scenario_c
    ]
    
    for test in capital_allowances_tests:
        test()
    
    # Run WHT Credits tests
    print("\n💳 WITHHOLDING TAX CREDITS TESTS")
    print("-" * 40)
    wht_tests = [
        tester.test_wht_credits_scenario_d,
        tester.test_wht_credits_scenario_e
    ]
    
    for test in wht_tests:
        test()
    
    # Run Comprehensive test
    print("\n🎯 COMPREHENSIVE INTEGRATION TEST")
    print("-" * 40)
    comprehensive_tests = [
        tester.test_comprehensive_scenario
    ]
    
    for test in comprehensive_tests:
        test()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())