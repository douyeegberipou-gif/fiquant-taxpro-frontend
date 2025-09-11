from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Fiquant TaxPro API", description="Nigerian Tax Calculator API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# PAYE Tax Models
class TaxInput(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    basic_salary: float = Field(gt=0, description="Basic salary per month")
    transport_allowance: float = Field(default=0, description="Transport allowance per month")
    housing_allowance: float = Field(default=0, description="Housing allowance per month")
    meal_allowance: float = Field(default=0, description="Meal allowance per month")
    other_allowances: float = Field(default=0, description="Other allowances per month")
    pension_contribution: float = Field(default=0, description="Pension contribution per month (auto-calculated if 0)")
    nhf_contribution: float = Field(default=0, description="NHF contribution per month (auto-calculated if 0)")
    life_insurance_premium: float = Field(default=0, description="Life insurance premium per month")
    health_insurance_premium: float = Field(default=0, description="Health insurance premium per month")
    nhis_contribution: float = Field(default=0, description="NHIS contribution per month")
    annual_rent: float = Field(default=0, description="Annual rent paid")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Corporate Income Tax Models
class CITInput(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str = Field(description="Company name")
    annual_turnover: float = Field(gt=0, description="Annual gross turnover")
    total_fixed_assets: float = Field(default=0, description="Total fixed assets value")
    
    # Revenue and Income
    gross_income: float = Field(gt=0, description="Total gross income/revenue")
    other_income: float = Field(default=0, description="Other income (dividends, rental, etc.)")
    
    # Deductible Expenses
    cost_of_goods_sold: float = Field(default=0, description="Cost of goods sold")
    staff_costs: float = Field(default=0, description="Staff salaries and benefits")
    rent_expenses: float = Field(default=0, description="Rent and utilities")
    professional_fees: float = Field(default=0, description="Professional and legal fees")
    depreciation: float = Field(default=0, description="Depreciation allowances")
    interest_paid_unrelated: float = Field(default=0, description="Interest to unrelated parties")
    interest_paid_related: float = Field(default=0, description="Interest to related parties")
    other_deductible_expenses: float = Field(default=0, description="Other allowable deductions")
    
    # Non-deductible Expenses
    entertainment_expenses: float = Field(default=0, description="Entertainment and gifts")
    fines_penalties: float = Field(default=0, description="Fines and penalties")
    personal_expenses: float = Field(default=0, description="Personal/non-business expenses")
    excessive_interest: float = Field(default=0, description="Interest above thin cap limits")
    other_non_deductible: float = Field(default=0, description="Other non-deductible expenses")
    
    # Loss Relief
    carry_forward_losses: float = Field(default=0, description="Losses carried forward from previous years")
    
    # Financial info for thin cap calculation
    total_debt: float = Field(default=0, description="Total debt outstanding")
    total_equity: float = Field(default=0, description="Total equity")
    ebitda: float = Field(default=0, description="EBITDA (auto-calculated if 0)")
    
    # Capital Allowances (2026 - Annual allowances only, initial allowances abolished)
    buildings_cost: float = Field(default=0, description="Cost of buildings (industrial & non-industrial)")
    furniture_fittings_cost: float = Field(default=0, description="Cost of furniture and fittings")
    plant_machinery_cost: float = Field(default=0, description="Cost of plant and machinery")
    motor_vehicles_cost: float = Field(default=0, description="Cost of motor vehicles")
    other_assets_cost: float = Field(default=0, description="Cost of other qualifying assets")
    
    # Existing written down values (for continuing assets)
    buildings_wdv: float = Field(default=0, description="Written down value of buildings")
    furniture_fittings_wdv: float = Field(default=0, description="Written down value of furniture & fittings")
    plant_machinery_wdv: float = Field(default=0, description="Written down value of plant & machinery")
    motor_vehicles_wdv: float = Field(default=0, description="Written down value of motor vehicles")
    other_assets_wdv: float = Field(default=0, description="Written down value of other assets")
    
    # Withholding Tax Credits
    wht_on_contracts: float = Field(default=0, description="WHT deducted on contract payments")
    wht_on_dividends: float = Field(default=0, description="WHT deducted on dividend income")
    wht_on_rent: float = Field(default=0, description="WHT deducted on rent payments")
    wht_on_interest: float = Field(default=0, description="WHT deducted on interest income")
    other_wht_credits: float = Field(default=0, description="Other WHT credits available")
    
    # Company type indicators
    is_professional_service: bool = Field(default=False, description="Professional service firm")
    is_multinational: bool = Field(default=False, description="Part of multinational group")
    global_revenue_eur: float = Field(default=0, description="Global group revenue in EUR")
    
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CITCalculationResult(BaseModel):
    id: str
    company_name: str
    
    # Company classification
    company_size: str  # "Small", "Medium", "Large"
    qualifies_small_exemption: bool
    
    # Financial summary
    annual_turnover: float
    total_fixed_assets: float
    gross_income: float
    total_deductible_expenses: float
    total_non_deductible_expenses: float
    
    # Thin capitalization
    debt_to_equity_ratio: float
    allowed_interest_deduction: float
    disallowed_interest: float
    thin_cap_applied: bool
    
    # Capital Allowances
    total_capital_allowances: float
    capital_allowance_breakdown: dict
    
    # Tax calculations
    taxable_profit: float
    cit_rate: float
    cit_due: float
    development_levy_rate: float
    development_levy: float
    minimum_etr_rate: float
    minimum_etr_tax: float
    total_tax_due: float
    
    # Withholding Tax Credits
    total_wht_credits: float
    wht_credits_breakdown: dict
    net_tax_payable: float
    
    # Effective rates
    effective_tax_rate: float
    
    # Compliance info
    filing_deadline: str
    payment_deadline: str
    
    # Expense breakdown
    expense_breakdown: dict
    
    timestamp: datetime

class TaxCalculationResult(BaseModel):
    id: str
    # Input values (annualized)
    annual_gross_income: float
    annual_basic_salary: float
    annual_transport_allowance: float
    annual_housing_allowance: float
    annual_meal_allowance: float
    annual_other_allowances: float
    
    # Reliefs and deductions (annual)
    pension_relief: float
    nhf_relief: float
    life_insurance_relief: float
    health_insurance_relief: float
    nhis_relief: float
    rent_relief: float
    total_reliefs: float
    
    # Tax calculation
    taxable_income: float
    tax_due: float
    net_annual_income: float
    
    # Monthly breakdown
    monthly_gross_income: float
    monthly_tax: float
    monthly_net_income: float
    
    # Tax breakdown by bands
    tax_breakdown: List[dict]
    
    timestamp: datetime

class TaxHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    calculation_id: str
    user_identifier: str = Field(default="anonymous")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# CIT calculation logic
def calculate_nigerian_cit_2026(cit_input: CITInput) -> CITCalculationResult:
    """Calculate Nigerian Corporate Income Tax based on 2026 tax laws"""
    
    # Classify company size
    is_small = (cit_input.annual_turnover <= 100_000_000 and 
                cit_input.total_fixed_assets <= 250_000_000 and 
                not cit_input.is_professional_service)
    
    is_large = cit_input.annual_turnover > 50_000_000_000  # ₦50 billion threshold for minimum ETR
    
    if is_small:
        company_size = "Small"
    elif is_large:
        company_size = "Large"
    else:
        company_size = "Medium"
    
    # Calculate Capital Allowances (2026 rates - annual allowances only)
    # Buildings: 10% annual allowance
    buildings_allowance = (cit_input.buildings_cost + cit_input.buildings_wdv) * 0.10
    
    # Furniture & Fittings: 20% annual allowance
    furniture_allowance = (cit_input.furniture_fittings_cost + cit_input.furniture_fittings_wdv) * 0.20
    
    # Plant & Machinery: 20% annual allowance
    plant_machinery_allowance = (cit_input.plant_machinery_cost + cit_input.plant_machinery_wdv) * 0.20
    
    # Motor Vehicles: 25% annual allowance (standard rate)
    motor_vehicles_allowance = (cit_input.motor_vehicles_cost + cit_input.motor_vehicles_wdv) * 0.25
    
    # Other Assets: 20% annual allowance (default rate)
    other_assets_allowance = (cit_input.other_assets_cost + cit_input.other_assets_wdv) * 0.20
    
    # Total Capital Allowances
    total_capital_allowances = (
        buildings_allowance +
        furniture_allowance +
        plant_machinery_allowance +
        motor_vehicles_allowance +
        other_assets_allowance
    )
    
    # Capital Allowance Breakdown
    capital_allowance_breakdown = {
        "buildings": {
            "cost_and_wdv": cit_input.buildings_cost + cit_input.buildings_wdv,
            "rate": "10%",
            "allowance": buildings_allowance
        },
        "furniture_fittings": {
            "cost_and_wdv": cit_input.furniture_fittings_cost + cit_input.furniture_fittings_wdv,
            "rate": "20%",
            "allowance": furniture_allowance
        },
        "plant_machinery": {
            "cost_and_wdv": cit_input.plant_machinery_cost + cit_input.plant_machinery_wdv,
            "rate": "20%",
            "allowance": plant_machinery_allowance
        },
        "motor_vehicles": {
            "cost_and_wdv": cit_input.motor_vehicles_cost + cit_input.motor_vehicles_wdv,
            "rate": "25%",
            "allowance": motor_vehicles_allowance
        },
        "other_assets": {
            "cost_and_wdv": cit_input.other_assets_cost + cit_input.other_assets_wdv,
            "rate": "20%",
            "allowance": other_assets_allowance
        }
    }
    
    # Calculate total deductible expenses (before thin cap adjustments, including capital allowances)
    total_deductible_before_thin_cap = (
        cit_input.cost_of_goods_sold +
        cit_input.staff_costs +
        cit_input.rent_expenses +
        cit_input.professional_fees +
        cit_input.depreciation +
        cit_input.interest_paid_unrelated +
        cit_input.interest_paid_related +
        cit_input.other_deductible_expenses +
        total_capital_allowances
    )
    
    # Calculate total non-deductible expenses
    total_non_deductible = (
        cit_input.entertainment_expenses +
        cit_input.fines_penalties +
        cit_input.personal_expenses +
        cit_input.excessive_interest +
        cit_input.other_non_deductible
    )
    
    # Apply thin capitalization rules (30% of EBITDA limit for related party interest)
    total_interest_related = cit_input.interest_paid_related
    ebitda = cit_input.ebitda
    
    # Auto-calculate EBITDA if not provided
    if ebitda == 0:
        gross_profit = cit_input.gross_income + cit_input.other_income - cit_input.cost_of_goods_sold
        ebitda = max(0, gross_profit - cit_input.staff_costs - cit_input.rent_expenses - cit_input.professional_fees)
    
    # Thin cap calculation - interest deduction limited to 30% of EBITDA
    max_deductible_interest = ebitda * 0.30
    allowed_interest_deduction = min(total_interest_related, max_deductible_interest)
    disallowed_interest = max(0, total_interest_related - allowed_interest_deduction)
    thin_cap_applied = disallowed_interest > 0
    
    # Adjust total deductible expenses for thin cap
    total_deductible_expenses = (
        total_deductible_before_thin_cap - 
        cit_input.interest_paid_related + 
        allowed_interest_deduction
    )
    
    # Calculate debt-to-equity ratio
    debt_to_equity_ratio = 0
    if cit_input.total_equity > 0:
        debt_to_equity_ratio = cit_input.total_debt / cit_input.total_equity
    
    # Calculate taxable profit
    total_income = cit_input.gross_income + cit_input.other_income
    taxable_profit = max(0, total_income - total_deductible_expenses)
    
    # Determine CIT rate and calculate tax
    if is_small:
        cit_rate = 0.0  # Small companies exempt
        cit_due = 0
    else:
        cit_rate = 0.30  # 30% for medium and large companies
        cit_due = taxable_profit * cit_rate
    
    # Development Levy (4% for non-small companies)
    development_levy_rate = 0.0 if is_small else 0.04
    development_levy = taxable_profit * development_levy_rate
    
    # Minimum Effective Tax Rate (15% for large multinationals)
    minimum_etr_rate = 0.0
    minimum_etr_tax = 0.0
    if (is_large and cit_input.is_multinational and 
        cit_input.global_revenue_eur >= 750_000_000):  # €750 million threshold
        minimum_etr_rate = 0.15
        minimum_required_tax = taxable_profit * minimum_etr_rate
        current_tax = cit_due + development_levy
        if current_tax < minimum_required_tax:
            minimum_etr_tax = minimum_required_tax - current_tax
    
    # Total tax due
    total_tax_due = cit_due + development_levy + minimum_etr_tax
    
    # Calculate Withholding Tax Credits
    total_wht_credits = (
        cit_input.wht_on_contracts +
        cit_input.wht_on_dividends +
        cit_input.wht_on_rent +
        cit_input.wht_on_interest +
        cit_input.other_wht_credits
    )
    
    # WHT Credits Breakdown
    wht_credits_breakdown = {
        "contracts": cit_input.wht_on_contracts,
        "dividends": cit_input.wht_on_dividends,
        "rent": cit_input.wht_on_rent,
        "interest": cit_input.wht_on_interest,
        "other": cit_input.other_wht_credits
    }
    
    # Calculate Net Tax Payable (Total Tax Due - WHT Credits)
    net_tax_payable = max(0, total_tax_due - total_wht_credits)
    
    # Calculate effective tax rate
    effective_tax_rate = 0.0
    if taxable_profit > 0:
        effective_tax_rate = total_tax_due / taxable_profit
    
    # Generate compliance deadlines (simplified - actual dates depend on company year-end)
    filing_deadline = "90 days after year-end"
    payment_deadline = "60 days after year-end"
    
    # Expense breakdown
    expense_breakdown = {
        "deductible_expenses": {
            "cost_of_goods_sold": cit_input.cost_of_goods_sold,
            "staff_costs": cit_input.staff_costs,
            "rent_expenses": cit_input.rent_expenses,
            "professional_fees": cit_input.professional_fees,
            "depreciation": cit_input.depreciation,
            "interest_unrelated": cit_input.interest_paid_unrelated,
            "interest_related_allowed": allowed_interest_deduction,
            "other_deductible": cit_input.other_deductible_expenses,
            "capital_allowances": total_capital_allowances
        },
        "non_deductible_expenses": {
            "entertainment": cit_input.entertainment_expenses,
            "fines_penalties": cit_input.fines_penalties,
            "personal_expenses": cit_input.personal_expenses,
            "interest_disallowed": disallowed_interest,
            "other_non_deductible": cit_input.other_non_deductible
        }
    }
    
    return CITCalculationResult(
        id=cit_input.id,
        company_name=cit_input.company_name,
        company_size=company_size,
        qualifies_small_exemption=is_small,
        annual_turnover=cit_input.annual_turnover,
        total_fixed_assets=cit_input.total_fixed_assets,
        gross_income=total_income,
        total_deductible_expenses=total_deductible_expenses,
        total_non_deductible_expenses=total_non_deductible + disallowed_interest,
        debt_to_equity_ratio=debt_to_equity_ratio,
        allowed_interest_deduction=allowed_interest_deduction,
        disallowed_interest=disallowed_interest,
        thin_cap_applied=thin_cap_applied,
        total_capital_allowances=total_capital_allowances,
        capital_allowance_breakdown=capital_allowance_breakdown,
        taxable_profit=taxable_profit,
        cit_rate=cit_rate,
        cit_due=cit_due,
        development_levy_rate=development_levy_rate,
        development_levy=development_levy,
        minimum_etr_rate=minimum_etr_rate,
        minimum_etr_tax=minimum_etr_tax,
        total_tax_due=total_tax_due,
        total_wht_credits=total_wht_credits,
        wht_credits_breakdown=wht_credits_breakdown,
        net_tax_payable=net_tax_payable,
        effective_tax_rate=effective_tax_rate,
        filing_deadline=filing_deadline,
        payment_deadline=payment_deadline,
        expense_breakdown=expense_breakdown,
        timestamp=cit_input.timestamp
    )


# PAYE calculation logic
def calculate_nigerian_paye_2026(tax_input: TaxInput) -> TaxCalculationResult:
    """Calculate Nigerian PAYE tax based on 2026 tax laws"""
    
    # Annualize all monthly inputs
    annual_basic = tax_input.basic_salary * 12
    annual_transport = tax_input.transport_allowance * 12
    annual_housing = tax_input.housing_allowance * 12
    annual_meal = tax_input.meal_allowance * 12
    annual_other = tax_input.other_allowances * 12
    annual_gross = annual_basic + annual_transport + annual_housing + annual_meal + annual_other
    
    # Calculate reliefs
    # Pension relief (8% of basic salary if not provided)
    pension_relief = tax_input.pension_contribution * 12 if tax_input.pension_contribution > 0 else annual_basic * 0.08
    
    # NHF relief (2.5% of basic salary if not provided)
    nhf_relief = tax_input.nhf_contribution * 12 if tax_input.nhf_contribution > 0 else annual_basic * 0.025
    
    # Life insurance relief (annual premium)
    life_insurance_relief = tax_input.life_insurance_premium * 12
    
    # Health insurance relief (annual premium)
    health_insurance_relief = tax_input.health_insurance_premium * 12
    
    # NHIS relief (annual contribution)
    nhis_relief = tax_input.nhis_contribution * 12
    
    # Rent relief (20% of annual rent, max ₦500,000)
    rent_relief = min(tax_input.annual_rent * 0.20, 500000) if tax_input.annual_rent > 0 else 0
    
    # Total reliefs
    total_reliefs = pension_relief + nhf_relief + life_insurance_relief + health_insurance_relief + nhis_relief + rent_relief
    
    # Calculate taxable income
    taxable_income = max(0, annual_gross - total_reliefs)
    
    # Nigerian 2026 tax brackets
    tax_brackets = [
        (800000, 0.00),      # First ₦800,000: 0%
        (2200000, 0.15),     # Next ₦2,200,000: 15%
        (9000000, 0.18),     # Next ₦9,000,000: 18%
        (13000000, 0.21),    # Next ₦13,000,000: 21%
        (25000000, 0.23),    # Next ₦25,000,000: 23%
        (float('inf'), 0.25) # Above ₦50,000,000: 25%
    ]
    
    # Calculate tax due
    tax_due = 0
    remaining_income = taxable_income
    tax_breakdown = []
    cumulative_limit = 0
    
    for bracket_limit, rate in tax_brackets:
        if remaining_income <= 0:
            break
            
        # Calculate taxable amount in this bracket
        if bracket_limit == float('inf'):
            taxable_in_bracket = remaining_income
            upper_limit = "Above"
        else:
            taxable_in_bracket = min(remaining_income, bracket_limit)
            upper_limit = cumulative_limit + bracket_limit
        
        # Calculate tax for this bracket
        tax_in_bracket = taxable_in_bracket * rate
        tax_due += tax_in_bracket
        
        # Store breakdown
        if taxable_in_bracket > 0:
            tax_breakdown.append({
                "range": f"₦{cumulative_limit:,.0f} - ₦{upper_limit:,.0f}" if upper_limit != "Above" else f"Above ₦{cumulative_limit:,.0f}",
                "rate": f"{rate * 100:.0f}%",
                "taxable_amount": taxable_in_bracket,
                "tax_amount": tax_in_bracket
            })
        
        remaining_income -= taxable_in_bracket
        cumulative_limit += bracket_limit
    
    # Calculate net income
    net_annual_income = annual_gross - tax_due
    
    return TaxCalculationResult(
        id=tax_input.id,
        annual_gross_income=annual_gross,
        annual_basic_salary=annual_basic,
        annual_transport_allowance=annual_transport,
        annual_housing_allowance=annual_housing,
        annual_meal_allowance=annual_meal,
        annual_other_allowances=annual_other,
        pension_relief=pension_relief,
        nhf_relief=nhf_relief,
        life_insurance_relief=life_insurance_relief,
        health_insurance_relief=health_insurance_relief,
        nhis_relief=nhis_relief,
        rent_relief=rent_relief,
        total_reliefs=total_reliefs,
        taxable_income=taxable_income,
        tax_due=tax_due,
        net_annual_income=net_annual_income,
        monthly_gross_income=annual_gross / 12,
        monthly_tax=tax_due / 12,
        monthly_net_income=net_annual_income / 12,
        tax_breakdown=tax_breakdown,
        timestamp=tax_input.timestamp
    )


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Fiquant TaxPro API - Nigerian Tax Calculator"}

@api_router.post("/calculate-paye", response_model=TaxCalculationResult)
async def calculate_paye_tax(tax_input: TaxInput):
    """Calculate Nigerian PAYE tax based on 2026 tax laws"""
    try:
        result = calculate_nigerian_paye_2026(tax_input)
        
        # Save calculation to database
        calculation_dict = result.dict()
        # Convert datetime to ISO string for MongoDB
        calculation_dict['timestamp'] = result.timestamp.isoformat()
        await db.tax_calculations.insert_one(calculation_dict)
        
        return result
    except Exception as e:
        logging.error(f"Tax calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tax calculation failed: {str(e)}")

@api_router.get("/tax-brackets")
async def get_tax_brackets():
    """Get Nigerian 2026 tax brackets information"""
    return {
        "tax_year": 2026,
        "currency": "NGN",
        "brackets": [
            {"range": "₦0 - ₦800,000", "rate": "0%", "description": "Tax-free threshold"},
            {"range": "₦800,001 - ₦3,000,000", "rate": "15%", "description": "Low income bracket"},
            {"range": "₦3,000,001 - ₦12,000,000", "rate": "18%", "description": "Middle income bracket"},
            {"range": "₦12,000,001 - ₦25,000,000", "rate": "21%", "description": "Upper middle income bracket"},
            {"range": "₦25,000,001 - ₦50,000,000", "rate": "23%", "description": "High income bracket"},
            {"range": "Above ₦50,000,000", "rate": "25%", "description": "Top income bracket"}
        ],
        "reliefs": {
            "pension_contribution": "8% of basic salary",
            "nhf_contribution": "2.5% of basic salary",
            "rent_relief": "20% of annual rent (max ₦500,000)",
            "life_insurance": "Annual premium paid",
            "health_insurance": "Annual premium paid",
            "nhis_contribution": "Annual contribution"
        }
    }

@api_router.get("/calculations/history", response_model=List[TaxCalculationResult])
async def get_calculation_history(limit: int = 20):
    """Get recent tax calculations"""
    calculations = await db.tax_calculations.find().sort("timestamp", -1).limit(limit).to_list(length=None)
    result = []
    for calc in calculations:
        # Convert ISO string back to datetime
        calc['timestamp'] = datetime.fromisoformat(calc['timestamp'])
        result.append(TaxCalculationResult(**calc))
    return result

@api_router.post("/calculate-cit", response_model=CITCalculationResult)
async def calculate_cit_tax(cit_input: CITInput):
    """Calculate Nigerian Corporate Income Tax based on 2026 tax laws"""
    try:
        result = calculate_nigerian_cit_2026(cit_input)
        
        # Save calculation to database
        calculation_dict = result.dict()
        # Convert datetime to ISO string for MongoDB
        calculation_dict['timestamp'] = result.timestamp.isoformat()
        await db.cit_calculations.insert_one(calculation_dict)
        
        return result
    except Exception as e:
        logging.error(f"CIT calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"CIT calculation failed: {str(e)}")

@api_router.get("/cit-info")
async def get_cit_info():
    """Get Nigerian 2026 CIT information"""
    return {
        "tax_year": 2026,
        "currency": "NGN",
        "company_classifications": {
            "small": {
                "criteria": "Turnover ≤ ₦100M AND Fixed Assets ≤ ₦250M",
                "cit_rate": "0%",
                "development_levy": "0%",
                "exemptions": "Excludes professional service firms"
            },
            "medium": {
                "criteria": "Above small thresholds, Turnover < ₦50B",
                "cit_rate": "30%",
                "development_levy": "4%",
                "minimum_etr": "Not applicable"
            },
            "large": {
                "criteria": "Turnover ≥ ₦50B or MNE with €750M+ global revenue",
                "cit_rate": "30%",
                "development_levy": "4%",
                "minimum_etr": "15% (for qualifying MNEs)"
            }
        },
        "thin_capitalization": {
            "interest_deduction_limit": "30% of EBITDA",
            "applies_to": "Related party interest payments",
            "excess_treatment": "Non-deductible"
        },
        "development_levy": {
            "rate": "4%",
            "replaces": "Tertiary Education Tax, IT Levy, NASENI Levy",
            "exemptions": "Small companies and non-residents"
        },
        "compliance_deadlines": {
            "filing": "90 days after year-end",
            "payment": "60 days after year-end",
            "installments": "Quarterly advance payments required"
        }
    }

@api_router.get("/cit-calculations/history", response_model=List[CITCalculationResult])
async def get_cit_calculation_history(limit: int = 20):
    """Get recent CIT calculations"""
    calculations = await db.cit_calculations.find().sort("timestamp", -1).limit(limit).to_list(length=None)
    result = []
    for calc in calculations:
        # Convert ISO string back to datetime
        calc['timestamp'] = datetime.fromisoformat(calc['timestamp'])
        result.append(CITCalculationResult(**calc))
    return result


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()