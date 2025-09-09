import requests
import sys
from datetime import datetime
import json

class NigerianTaxCalculatorTester:
    def __init__(self, base_url="https://fiquant-taxpro.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

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

def main():
    print("🚀 Starting Nigerian Tax Calculator API Tests")
    print("=" * 60)
    
    tester = NigerianTaxCalculatorTester()
    
    # Run all tests
    tests = [
        tester.test_root_endpoint,
        tester.test_tax_brackets_endpoint,
        tester.test_low_income_calculation,
        tester.test_medium_income_calculation,
        tester.test_high_income_calculation,
        tester.test_history_endpoint,
        tester.test_invalid_input
    ]
    
    for test in tests:
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