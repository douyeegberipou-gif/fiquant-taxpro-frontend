import requests
import sys
from datetime import datetime
import json

class BulkPayrollTester:
    def __init__(self, base_url="https://nigerian-taxapp.preview.emergentagent.com/api"):
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

    def test_auto_calculation_scenario(self):
        """Test auto-calculation for pension and NHF"""
        # Employee with ₦500,000 basic salary should auto-calculate:
        # Pension: ₦40,000 (8% of ₦500,000)
        # NHF: ₦12,500 (2.5% of ₦500,000)
        test_data = {
            "basic_salary": 500000,
            "transport_allowance": 0,
            "housing_allowance": 0,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,  # Should auto-calculate to 40,000
            "nhf_contribution": 0,      # Should auto-calculate to 12,500
            "life_insurance_premium": 0,
            "health_insurance_premium": 0,
            "nhis_contribution": 0,
            "annual_rent": 0
        }
        
        success, response = self.run_test(
            "Auto-calculation Test (₦500,000 basic salary)",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Annual Basic Salary: ₦{response['annual_basic_salary']:,.0f}")
            print(f"   Pension Relief: ₦{response['pension_relief']:,.0f}")
            print(f"   NHF Relief: ₦{response['nhf_relief']:,.0f}")
            
            # Verify auto-calculated reliefs
            expected_pension = 500000 * 12 * 0.08  # 8% of basic salary = ₦480,000
            expected_nhf = 500000 * 12 * 0.025     # 2.5% of basic salary = ₦150,000
            
            if abs(response['pension_relief'] - expected_pension) < 1:
                print(f"   ✅ Pension relief auto-calculated correctly: ₦{response['pension_relief']:,.0f}")
            else:
                print(f"   ❌ Pension relief incorrect: Expected ₦{expected_pension:,.0f}, Got ₦{response['pension_relief']:,.0f}")
            
            if abs(response['nhf_relief'] - expected_nhf) < 1:
                print(f"   ✅ NHF relief auto-calculated correctly: ₦{response['nhf_relief']:,.0f}")
            else:
                print(f"   ❌ NHF relief incorrect: Expected ₦{expected_nhf:,.0f}, Got ₦{response['nhf_relief']:,.0f}")
        
        return success

    def test_comprehensive_relief_scenario(self):
        """Test comprehensive relief scenario - Sarah Johnson"""
        # Test Scenario - Employee with Full Reliefs:
        # Name: "Sarah Johnson"
        # Basic Salary: ₦600,000
        # Housing Allowance: ₦250,000  
        # Transport: ₦75,000
        # Life Insurance: ₦15,000
        # Health Insurance: ₦20,000
        # NHIS: ₦8,000
        # Annual Rent: ₦1,800,000
        
        test_data = {
            "basic_salary": 600000,
            "transport_allowance": 75000,
            "housing_allowance": 250000,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,  # Auto-calculate: 8% of ₦600,000 = ₦48,000
            "nhf_contribution": 0,      # Auto-calculate: 2.5% of ₦600,000 = ₦15,000
            "life_insurance_premium": 15000,
            "health_insurance_premium": 20000,
            "nhis_contribution": 8000,
            "annual_rent": 1800000  # Should get ₦360,000 rent relief (20% of ₦1,800,000)
        }
        
        success, response = self.run_test(
            "Comprehensive Relief Test - Sarah Johnson",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Annual Gross Income: ₦{response['annual_gross_income']:,.0f}")
            print(f"   Pension Relief: ₦{response['pension_relief']:,.0f}")
            print(f"   NHF Relief: ₦{response['nhf_relief']:,.0f}")
            print(f"   Life Insurance Relief: ₦{response['life_insurance_relief']:,.0f}")
            print(f"   Health Insurance Relief: ₦{response['health_insurance_relief']:,.0f}")
            print(f"   NHIS Relief: ₦{response['nhis_relief']:,.0f}")
            print(f"   Rent Relief: ₦{response['rent_relief']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
            print(f"   Taxable Income: ₦{response['taxable_income']:,.0f}")
            print(f"   Tax Due: ₦{response['tax_due']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            
            # Expected Relief Calculations:
            expected_pension = 600000 * 12 * 0.08  # ₦576,000
            expected_nhf = 600000 * 12 * 0.025     # ₦180,000
            expected_rent = 1800000 * 0.20         # ₦360,000
            expected_life_insurance = 15000 * 12   # ₦180,000
            expected_health_insurance = 20000 * 12 # ₦240,000
            expected_nhis = 8000 * 12              # ₦96,000
            
            # Total Monthly Relief: ₦48,000 + ₦15,000 + ₦15,000 + ₦20,000 + ₦8,000 = ₦106,000
            expected_monthly_reliefs = 48000 + 15000 + 15000 + 20000 + 8000  # ₦106,000
            expected_total_reliefs = expected_pension + expected_nhf + expected_rent + expected_life_insurance + expected_health_insurance + expected_nhis
            
            print(f"   Expected Total Reliefs: ₦{expected_total_reliefs:,.0f}")
            print(f"   Expected Monthly Reliefs: ₦{expected_monthly_reliefs:,.0f}")
            
            # Verify calculations
            if abs(response['pension_relief'] - expected_pension) < 1:
                print(f"   ✅ Pension relief correct: ₦{response['pension_relief']:,.0f}")
            else:
                print(f"   ❌ Pension relief incorrect: Expected ₦{expected_pension:,.0f}, Got ₦{response['pension_relief']:,.0f}")
            
            if abs(response['nhf_relief'] - expected_nhf) < 1:
                print(f"   ✅ NHF relief correct: ₦{response['nhf_relief']:,.0f}")
            else:
                print(f"   ❌ NHF relief incorrect: Expected ₦{expected_nhf:,.0f}, Got ₦{response['nhf_relief']:,.0f}")
            
            if abs(response['rent_relief'] - expected_rent) < 1:
                print(f"   ✅ Rent relief correct: ₦{response['rent_relief']:,.0f}")
            else:
                print(f"   ❌ Rent relief incorrect: Expected ₦{expected_rent:,.0f}, Got ₦{response['rent_relief']:,.0f}")
            
            if abs(response['total_reliefs'] - expected_total_reliefs) < 1:
                print(f"   ✅ Total reliefs calculated correctly")
            else:
                print(f"   ❌ Total reliefs incorrect: Expected ₦{expected_total_reliefs:,.0f}, Got ₦{response['total_reliefs']:,.0f}")
        
        return success

    def test_mixed_relief_employee_1(self):
        """Test Employee 1: Full reliefs"""
        test_data = {
            "basic_salary": 600000,
            "transport_allowance": 75000,
            "housing_allowance": 250000,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,  # Auto-calculate
            "nhf_contribution": 0,      # Auto-calculate
            "life_insurance_premium": 15000,
            "health_insurance_premium": 20000,
            "nhis_contribution": 8000,
            "annual_rent": 1800000
        }
        
        success, response = self.run_test(
            "Mixed Relief Employee 1 - Full Reliefs",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Monthly Gross: ₦{response['monthly_gross_income']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            print(f"   Monthly Net: ₦{response['monthly_net_income']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
        
        return success, response if success else None

    def test_mixed_relief_employee_2(self):
        """Test Employee 2: Basic salary ₦400,000, only pension/NHF auto-calculated"""
        test_data = {
            "basic_salary": 400000,
            "transport_allowance": 0,
            "housing_allowance": 0,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,  # Auto-calculate: 8% of ₦400,000 = ₦32,000
            "nhf_contribution": 0,      # Auto-calculate: 2.5% of ₦400,000 = ₦10,000
            "life_insurance_premium": 0,
            "health_insurance_premium": 0,
            "nhis_contribution": 0,
            "annual_rent": 0
        }
        
        success, response = self.run_test(
            "Mixed Relief Employee 2 - Basic Only",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Monthly Gross: ₦{response['monthly_gross_income']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            print(f"   Monthly Net: ₦{response['monthly_net_income']:,.0f}")
            print(f"   Pension Relief: ₦{response['pension_relief']:,.0f}")
            print(f"   NHF Relief: ₦{response['nhf_relief']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
            
            # Verify auto-calculations
            expected_pension = 400000 * 12 * 0.08  # ₦384,000
            expected_nhf = 400000 * 12 * 0.025     # ₦120,000
            
            if abs(response['pension_relief'] - expected_pension) < 1:
                print(f"   ✅ Pension auto-calculated correctly")
            else:
                print(f"   ❌ Pension auto-calculation error")
            
            if abs(response['nhf_relief'] - expected_nhf) < 1:
                print(f"   ✅ NHF auto-calculated correctly")
            else:
                print(f"   ❌ NHF auto-calculation error")
        
        return success, response if success else None

    def test_mixed_relief_employee_3(self):
        """Test Employee 3: Basic salary ₦300,000, with life insurance ₦10,000, annual rent ₦1,200,000"""
        test_data = {
            "basic_salary": 300000,
            "transport_allowance": 0,
            "housing_allowance": 0,
            "meal_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,  # Auto-calculate: 8% of ₦300,000 = ₦24,000
            "nhf_contribution": 0,      # Auto-calculate: 2.5% of ₦300,000 = ₦7,500
            "life_insurance_premium": 10000,
            "health_insurance_premium": 0,
            "nhis_contribution": 0,
            "annual_rent": 1200000  # Should get ₦240,000 rent relief (20% of ₦1,200,000)
        }
        
        success, response = self.run_test(
            "Mixed Relief Employee 3 - Partial Reliefs",
            "POST",
            "calculate-paye",
            200,
            test_data
        )
        
        if success:
            print(f"   Monthly Gross: ₦{response['monthly_gross_income']:,.0f}")
            print(f"   Monthly Tax: ₦{response['monthly_tax']:,.0f}")
            print(f"   Monthly Net: ₦{response['monthly_net_income']:,.0f}")
            print(f"   Life Insurance Relief: ₦{response['life_insurance_relief']:,.0f}")
            print(f"   Rent Relief: ₦{response['rent_relief']:,.0f}")
            print(f"   Total Reliefs: ₦{response['total_reliefs']:,.0f}")
            
            # Verify calculations
            expected_rent = 1200000 * 0.20  # ₦240,000
            expected_life_insurance = 10000 * 12  # ₦120,000
            
            if abs(response['rent_relief'] - expected_rent) < 1:
                print(f"   ✅ Rent relief calculated correctly")
            else:
                print(f"   ❌ Rent relief error: Expected ₦{expected_rent:,.0f}, Got ₦{response['rent_relief']:,.0f}")
            
            if abs(response['life_insurance_relief'] - expected_life_insurance) < 1:
                print(f"   ✅ Life insurance relief calculated correctly")
            else:
                print(f"   ❌ Life insurance relief error")
        
        return success, response if success else None

    def test_bulk_calculation_comparison(self):
        """Test bulk calculation with mixed relief scenarios and compare results"""
        print(f"\n🔍 Testing Bulk Calculation with Mixed Relief Scenarios...")
        
        # Test all three employees
        emp1_success, emp1_result = self.test_mixed_relief_employee_1()
        emp2_success, emp2_result = self.test_mixed_relief_employee_2()
        emp3_success, emp3_result = self.test_mixed_relief_employee_3()
        
        if emp1_success and emp2_success and emp3_success:
            print(f"\n📊 BULK CALCULATION SUMMARY:")
            print(f"   Employee 1 (Full Reliefs):")
            print(f"     Monthly Gross: ₦{emp1_result['monthly_gross_income']:,.0f}")
            print(f"     Monthly Tax: ₦{emp1_result['monthly_tax']:,.0f}")
            print(f"     Monthly Net: ₦{emp1_result['monthly_net_income']:,.0f}")
            
            print(f"   Employee 2 (Basic Only):")
            print(f"     Monthly Gross: ₦{emp2_result['monthly_gross_income']:,.0f}")
            print(f"     Monthly Tax: ₦{emp2_result['monthly_tax']:,.0f}")
            print(f"     Monthly Net: ₦{emp2_result['monthly_net_income']:,.0f}")
            
            print(f"   Employee 3 (Partial Reliefs):")
            print(f"     Monthly Gross: ₦{emp3_result['monthly_gross_income']:,.0f}")
            print(f"     Monthly Tax: ₦{emp3_result['monthly_tax']:,.0f}")
            print(f"     Monthly Net: ₦{emp3_result['monthly_net_income']:,.0f}")
            
            # Calculate totals
            total_gross = emp1_result['monthly_gross_income'] + emp2_result['monthly_gross_income'] + emp3_result['monthly_gross_income']
            total_tax = emp1_result['monthly_tax'] + emp2_result['monthly_tax'] + emp3_result['monthly_tax']
            total_net = emp1_result['monthly_net_income'] + emp2_result['monthly_net_income'] + emp3_result['monthly_net_income']
            
            print(f"\n   TOTALS (3 employees):")
            print(f"     Total Monthly Gross: ₦{total_gross:,.0f}")
            print(f"     Total Monthly Tax: ₦{total_tax:,.0f}")
            print(f"     Total Monthly Net: ₦{total_net:,.0f}")
            
            print(f"   ✅ Bulk calculation scenarios completed successfully")
            return True
        else:
            print(f"   ❌ Some bulk calculation scenarios failed")
            return False

    def test_tax_calculation_accuracy(self):
        """Test tax calculation accuracy with comprehensive reliefs"""
        # Calculate for an employee with comprehensive reliefs and verify the tax calculation follows this logic:
        # 1. Annual Gross = (Basic + Allowances) × 12
        # 2. Annual Reliefs = Pension + NHF + Life Ins + Health Ins + NHIS + Rent Relief
        # 3. Taxable Income = Annual Gross - Annual Reliefs
        # 4. Apply 2026 Nigerian tax brackets to Taxable Income
        # 5. Result should show lower tax compared to same employee without reliefs
        
        # Test with reliefs
        test_data_with_reliefs = {
            "basic_salary": 800000,
            "transport_allowance": 100000,
            "housing_allowance": 300000,
            "meal_allowance": 50000,
            "other_allowances": 50000,
            "pension_contribution": 0,  # Auto-calculate: 8% of ₦800,000 = ₦64,000
            "nhf_contribution": 0,      # Auto-calculate: 2.5% of ₦800,000 = ₦20,000
            "life_insurance_premium": 20000,
            "health_insurance_premium": 25000,
            "nhis_contribution": 10000,
            "annual_rent": 2000000  # Should get ₦400,000 rent relief (20% of ₦2,000,000)
        }
        
        success_with_reliefs, response_with_reliefs = self.run_test(
            "Tax Accuracy Test - WITH Reliefs",
            "POST",
            "calculate-paye",
            200,
            test_data_with_reliefs
        )
        
        # Test without reliefs (same income, no reliefs)
        test_data_without_reliefs = {
            "basic_salary": 800000,
            "transport_allowance": 100000,
            "housing_allowance": 300000,
            "meal_allowance": 50000,
            "other_allowances": 50000,
            "pension_contribution": 0,  # Will still auto-calculate
            "nhf_contribution": 0,      # Will still auto-calculate
            "life_insurance_premium": 0,
            "health_insurance_premium": 0,
            "nhis_contribution": 0,
            "annual_rent": 0  # No rent relief
        }
        
        success_without_reliefs, response_without_reliefs = self.run_test(
            "Tax Accuracy Test - WITHOUT Additional Reliefs",
            "POST",
            "calculate-paye",
            200,
            test_data_without_reliefs
        )
        
        if success_with_reliefs and success_without_reliefs:
            print(f"\n📊 TAX CALCULATION ACCURACY COMPARISON:")
            
            # With reliefs
            print(f"   WITH Comprehensive Reliefs:")
            print(f"     Annual Gross: ₦{response_with_reliefs['annual_gross_income']:,.0f}")
            print(f"     Total Reliefs: ₦{response_with_reliefs['total_reliefs']:,.0f}")
            print(f"     Taxable Income: ₦{response_with_reliefs['taxable_income']:,.0f}")
            print(f"     Annual Tax: ₦{response_with_reliefs['tax_due']:,.0f}")
            print(f"     Monthly Tax: ₦{response_with_reliefs['monthly_tax']:,.0f}")
            
            # Without additional reliefs
            print(f"   WITHOUT Additional Reliefs:")
            print(f"     Annual Gross: ₦{response_without_reliefs['annual_gross_income']:,.0f}")
            print(f"     Total Reliefs: ₦{response_without_reliefs['total_reliefs']:,.0f}")
            print(f"     Taxable Income: ₦{response_without_reliefs['taxable_income']:,.0f}")
            print(f"     Annual Tax: ₦{response_without_reliefs['tax_due']:,.0f}")
            print(f"     Monthly Tax: ₦{response_without_reliefs['monthly_tax']:,.0f}")
            
            # Calculate tax savings
            tax_savings = response_without_reliefs['tax_due'] - response_with_reliefs['tax_due']
            monthly_tax_savings = response_without_reliefs['monthly_tax'] - response_with_reliefs['monthly_tax']
            
            print(f"   TAX SAVINGS:")
            print(f"     Annual Tax Savings: ₦{tax_savings:,.0f}")
            print(f"     Monthly Tax Savings: ₦{monthly_tax_savings:,.0f}")
            
            # Verify tax calculation logic
            expected_annual_gross = (800000 + 100000 + 300000 + 50000 + 50000) * 12  # ₦15,600,000
            expected_pension = 800000 * 12 * 0.08  # ₦768,000
            expected_nhf = 800000 * 12 * 0.025     # ₦240,000
            expected_rent = min(2000000 * 0.20, 500000)  # ₦400,000 (20% of ₦2M)
            expected_life_insurance = 20000 * 12   # ₦240,000
            expected_health_insurance = 25000 * 12 # ₦300,000
            expected_nhis = 10000 * 12             # ₦120,000
            
            expected_total_reliefs = expected_pension + expected_nhf + expected_rent + expected_life_insurance + expected_health_insurance + expected_nhis
            expected_taxable_income = expected_annual_gross - expected_total_reliefs
            
            print(f"   VERIFICATION:")
            print(f"     Expected Annual Gross: ₦{expected_annual_gross:,.0f}")
            print(f"     Expected Total Reliefs: ₦{expected_total_reliefs:,.0f}")
            print(f"     Expected Taxable Income: ₦{expected_taxable_income:,.0f}")
            
            # Verify calculations
            if (abs(response_with_reliefs['annual_gross_income'] - expected_annual_gross) < 1 and
                abs(response_with_reliefs['total_reliefs'] - expected_total_reliefs) < 1 and
                abs(response_with_reliefs['taxable_income'] - expected_taxable_income) < 1):
                print(f"     ✅ Tax calculation logic verified correctly")
            else:
                print(f"     ❌ Tax calculation logic verification failed")
            
            # Verify that reliefs reduce tax
            if tax_savings > 0:
                print(f"     ✅ Reliefs correctly reduce tax burden")
            else:
                print(f"     ❌ Reliefs should reduce tax burden")
            
            return True
        else:
            print(f"   ❌ Tax accuracy comparison failed")
            return False

def main():
    print("🚀 Starting Bulk Payroll Calculator Relief Tests")
    print("=" * 60)
    
    tester = BulkPayrollTester()
    
    # Run relief-specific tests
    print("\n📋 RELIEF CALCULATION TESTS")
    print("-" * 40)
    relief_tests = [
        tester.test_auto_calculation_scenario,
        tester.test_comprehensive_relief_scenario,
        tester.test_bulk_calculation_comparison,
        tester.test_tax_calculation_accuracy
    ]
    
    for test in relief_tests:
        test()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All bulk payroll relief tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())