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


# Tax Models
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


# Tax calculation logic
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