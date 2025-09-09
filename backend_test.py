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

def main():
    print("🚀 Starting Nigerian Tax Calculator API Tests")
    print("=" * 60)
    
    tester = NigerianTaxCalculatorTester()
    
    # Run PAYE tests first
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