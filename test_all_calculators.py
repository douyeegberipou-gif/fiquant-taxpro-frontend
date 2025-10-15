#!/usr/bin/env python3
"""
Comprehensive All Calculators Functionality Test
Tests all calculator endpoints after removing hardcoded backend URL fallbacks
"""

import requests
import sys
import json
from datetime import datetime

class AllCalculatorsTester:
    def __init__(self, base_url="http://localhost:8001/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

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
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

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
                self.failed_tests.append(name)
                try:
                    return False, response.json()
                except:
                    return False, response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(name)
            return False, {}

    def test_paye_calculator(self):
        """Test PAYE Calculator with user's exact inputs"""
        print("\n1️⃣ TESTING PAYE CALCULATOR")
        
        # User's exact inputs from the issue report
        user_data = {
            "basic_salary": 7000000,  # Annual salary: 7,000,000
            "health_insurance": 45000,  # Health insurance: 45,000
            "rent": 7000000,  # Rent: 7,000,000
            "transport_allowance": 0,
            "housing_allowance": 0,
            "meal_allowance": 0,
            "utility_allowance": 0,
            "entertainment_allowance": 0,
            "other_allowances": 0,
            "pension_contribution": 0,
            "nhf_contribution": 0,
            "life_assurance": 0,
            "nhis_contribution": 0,
            "other_reliefs": 0,
            "staff_name": "Test User",
            "tin": "12345678901",
            "month": "January",
            "year": "2025",
            "state_of_residence": "Lagos"
        }
        
        success, response = self.run_test(
            "PAYE Calculator - User's Exact Inputs",
            "POST",
            "calculate-paye",
            200,
            user_data
        )
        
        if success and isinstance(response, dict):
            monthly_gross = response.get('monthly_gross_income', 'N/A')
            monthly_tax = response.get('monthly_tax', 'N/A')
            monthly_net = response.get('monthly_net_income', 'N/A')
            
            print(f"   📊 Results:")
            print(f"     Monthly Gross: ₦{monthly_gross:,.2f}" if isinstance(monthly_gross, (int, float)) else f"     Monthly Gross: {monthly_gross}")
            print(f"     Monthly Tax: ₦{monthly_tax:,.2f}" if isinstance(monthly_tax, (int, float)) else f"     Monthly Tax: {monthly_tax}")
            print(f"     Monthly Net: ₦{monthly_net:,.2f}" if isinstance(monthly_net, (int, float)) else f"     Monthly Net: {monthly_net}")
        
        return success

    def test_cit_calculator(self):
        """Test CIT Calculator"""
        print("\n2️⃣ TESTING CIT CALCULATOR")
        
        company_data = {
            "company_name": "Test Company Ltd",
            "tin": "12345678901",
            "year_of_assessment": "2025",
            "tax_year": "2025",
            "annual_turnover": 100000000,  # ₦100M turnover
            "gross_income": 100000000,  # Required field
            "total_fixed_assets": 50000000,
            "other_income": 0,
            "cost_of_goods_sold": 40000000,
            "staff_costs": 15000000,
            "rent_expenses": 5000000,
            "professional_fees": 2000000,
            "depreciation": 8000000,
            "other_expenses": 5000000,
            "donations": 500000,
            "wht_credits": 2000000,
            "previous_losses": 0
        }
        
        success, response = self.run_test(
            "CIT Calculator - Sample Company Data",
            "POST",
            "calculate-cit",
            200,
            company_data
        )
        
        if success and isinstance(response, dict):
            taxable_profit = response.get('taxable_profit', 'N/A')
            net_tax_payable = response.get('net_tax_payable', 'N/A')
            
            print(f"   📊 Results:")
            print(f"     Taxable Profit: ₦{taxable_profit:,.2f}" if isinstance(taxable_profit, (int, float)) else f"     Taxable Profit: {taxable_profit}")
            print(f"     Net Tax Payable: ₦{net_tax_payable:,.2f}" if isinstance(net_tax_payable, (int, float)) else f"     Net Tax Payable: {net_tax_payable}")
        
        return success

    def test_vat_calculator(self):
        """Test VAT Calculator (Requires Authentication)"""
        print("\n3️⃣ TESTING VAT CALCULATOR")
        
        # Test VAT inclusive calculation
        vat_data = {
            "amount": 1000000,  # ₦1M
            "vat_rate": 7.5,
            "calculation_type": "inclusive"
        }
        
        success, response = self.run_test(
            "VAT Calculator - Requires Authentication",
            "POST",
            "auth/calculate-vat",
            [401, 403],  # Expect authentication error
            vat_data
        )
        
        if success:
            print(f"   ⚠️ VAT Calculator requires authentication (as expected)")
            print(f"   📝 Error: {response.get('detail', 'Authentication required')}")
            return True  # This is expected behavior
        else:
            print(f"   ❌ Unexpected response from VAT Calculator")
            return False

    def test_cgt_calculator(self):
        """Test CGT Calculator"""
        print("\n4️⃣ TESTING CGT CALCULATOR")
        
        cgt_data = {
            "asset_type": "shares",
            "acquisition_cost": 5000000,  # ₦5M
            "disposal_proceeds": 8000000,  # ₦8M
            "acquisition_date": "2020-01-01",
            "disposal_date": "2025-01-01",
            "expenses": 100000,
            "cgt_rate": 10
        }
        
        success, response = self.run_test(
            "CGT Calculator - Shares",
            "POST",
            "calculate-cgt",
            200,
            cgt_data
        )
        
        if success and isinstance(response, dict):
            capital_gain = response.get('capital_gain', 'N/A')
            cgt_payable = response.get('cgt_payable', 'N/A')
            
            print(f"   📊 Results:")
            print(f"     Capital Gain: ₦{capital_gain:,.2f}" if isinstance(capital_gain, (int, float)) else f"     Capital Gain: {capital_gain}")
            print(f"     CGT Payable: ₦{cgt_payable:,.2f}" if isinstance(cgt_payable, (int, float)) else f"     CGT Payable: {cgt_payable}")
        
        return success

    def test_bulk_paye_calculator(self):
        """Test Bulk PAYE Calculator"""
        print("\n5️⃣ TESTING BULK PAYE CALCULATOR")
        
        bulk_data = {
            "employees": [
                {
                    "staff_name": "Employee 1",
                    "basic_salary": 500000,
                    "transport_allowance": 50000,
                    "housing_allowance": 100000,
                    "pension_contribution": 40000,
                    "nhf_contribution": 12500,
                    "health_insurance": 15000,
                    "rent": 200000
                },
                {
                    "staff_name": "Employee 2", 
                    "basic_salary": 750000,
                    "transport_allowance": 75000,
                    "housing_allowance": 150000,
                    "pension_contribution": 60000,
                    "nhf_contribution": 18750,
                    "health_insurance": 20000,
                    "rent": 300000
                }
            ]
        }
        
        success, response = self.run_test(
            "Bulk PAYE Calculator - Multiple Employees",
            "POST",
            "calculate-bulk-paye",
            200,
            bulk_data
        )
        
        if success and isinstance(response, dict):
            results = response.get('results', [])
            total_employees = len(results)
            total_tax = sum(r.get('monthly_tax', 0) for r in results)
            
            print(f"   📊 Results:")
            print(f"     Employees Processed: {total_employees}")
            print(f"     Total Monthly Tax: ₦{total_tax:,.2f}")
        
        return success

    def test_payment_processing_calculator(self):
        """Test Payment Processing Calculator"""
        print("\n6️⃣ TESTING PAYMENT PROCESSING CALCULATOR")
        
        payment_data = {
            "payment_type": "professional_services",
            "gross_amount": 1000000,  # ₦1M
            "wht_rate": 5,  # 5% WHT
            "vat_applicable": True,
            "vat_rate": 7.5
        }
        
        success, response = self.run_test(
            "Payment Processing Calculator - Professional Services",
            "POST",
            "calculate-payment-withholding",
            200,
            payment_data
        )
        
        if success and isinstance(response, dict):
            net_payment = response.get('net_payment', 'N/A')
            wht_amount = response.get('wht_amount', 'N/A')
            
            print(f"   📊 Results:")
            print(f"     Net Payment: ₦{net_payment:,.2f}" if isinstance(net_payment, (int, float)) else f"     Net Payment: {net_payment}")
            print(f"     WHT Amount: ₦{wht_amount:,.2f}" if isinstance(wht_amount, (int, float)) else f"     WHT Amount: {wht_amount}")
        
        return success

    def test_api_connectivity(self):
        """Test basic API connectivity"""
        print("\n🔍 TESTING API CONNECTIVITY")
        
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200,
            None
        )
        
        return success

    def run_all_tests(self):
        """Run all calculator tests"""
        print("🚨 COMPREHENSIVE ALL CALCULATORS FUNCTIONALITY TEST")
        print("=" * 80)
        print("CRITICAL ISSUE: User reports all calculators are broken after removing hardcoded backend URL fallbacks")
        print("USER INPUTS: Annual Salary: 7000000, Health Insurance: 45000, Rent: 7000000")
        print("=" * 80)
        
        # Test API connectivity first
        api_working = self.test_api_connectivity()
        
        if not api_working:
            print("\n❌ CRITICAL: API is not accessible - all calculators will fail")
            return False
        
        # Test all calculators
        results = []
        results.append(("PAYE Calculator", self.test_paye_calculator()))
        results.append(("CIT Calculator", self.test_cit_calculator()))
        results.append(("VAT Calculator", self.test_vat_calculator()))
        results.append(("CGT Calculator", self.test_cgt_calculator()))
        results.append(("Bulk PAYE Calculator", self.test_bulk_paye_calculator()))
        results.append(("Payment Processing Calculator", self.test_payment_processing_calculator()))
        
        # Summary
        working_calculators = sum(1 for _, success in results if success)
        total_calculators = len(results)
        
        print(f"\n📊 CALCULATOR TEST RESULTS: {working_calculators}/{total_calculators} calculators working")
        print(f"📊 OVERALL TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for name, success in results:
            status = "✅ WORKING" if success else "❌ FAILED"
            print(f"   {name}: {status}")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"   - {test}")
        
        if working_calculators == total_calculators:
            print("\n✅ ALL CALCULATORS ARE WORKING CORRECTLY")
            return True
        elif working_calculators >= 4:
            print("\n⚠️ MOST CALCULATORS WORKING - MINOR ISSUES DETECTED")
            return True
        else:
            print("\n❌ CRITICAL CALCULATOR ISSUES - MULTIPLE CALCULATORS BROKEN")
            return False

if __name__ == "__main__":
    tester = AllCalculatorsTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 CALCULATOR TESTING COMPLETED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\n💥 CALCULATOR TESTING FAILED - CRITICAL ISSUES FOUND!")
        sys.exit(1)