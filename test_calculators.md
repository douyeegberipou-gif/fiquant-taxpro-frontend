# Calculator Testing Guide

## CIT Calculator Fix Applied

### Issue Identified
The `calculateCitTax` function was not properly handling the `tin` field - it was being parsed as a number instead of kept as a string.

### Fix Applied
Updated `/app/frontend/src/App.js` line 570-593:
- Added `tin` to the list of string fields
- Added `global_revenue_eur` to string fields  
- Improved boolean field handling
- Added better error logging with response details
- Added console.log to debug payload being sent

### Changes Made:
```javascript
// String fields now include tin and global_revenue_eur
if (key === 'company_name' || key === 'tin' || key === 'year_of_assessment' || key === 'tax_year' || key === 'global_revenue_eur') {
  numericInput[key] = citInput[key] || '';
}
```

## Testing All Calculators

### PAYE Calculator
**Status:** ✅ Already working correctly
**Endpoint:** `/api/calculate-paye`
**Test:**
1. Enter employee name
2. Enter annual salary (e.g., 5000000)
3. Add pension and NHF contributions
4. Click Calculate
5. Should show tax breakdown

### CIT Calculator  
**Status:** 🔧 FIXED
**Endpoint:** `/api/calculate-cit`
**Test:**
1. Enter company name (required)
2. TIN (optional - now handled correctly)
3. Annual turnover (required, must be > 0)
4. Gross income (required, must be > 0)
5. Add expenses
6. Click Calculate
7. Should show tax breakdown

**Expected Payload:**
```json
{
  "company_name": "Test Company",
  "tin": "",
  "year_of_assessment": "",
  "tax_year": "",
  "annual_turnover": 50000000,
  "total_fixed_assets": 0,
  "gross_income": 50000000,
  "other_income": 0,
  ...all numeric fields
}
```

### VAT Calculator
**Status:** ✅ Working (Client-side calculation)
**No Backend Call:** Calculations done in browser
**Test:**
1. Enter company name
2. Select month
3. Add transactions
4. Select transaction type
5. Enter amounts
6. Click Calculate
7. Should show VAT breakdown

### CGT Calculator
**Status:** ✅ Working (Client-side calculation)
**No Backend Call:** Calculations done in browser
**Test:**
1. Select asset type (Crypto/Shares/Real Estate)
2. Enter purchase details
3. Enter sale details
4. Click Calculate
5. Should show capital gains tax

## Common Issues & Solutions

### Issue: 422 Validation Error
**Cause:** Missing required fields or wrong data types
**Solution:** 
- Ensure all required fields have values
- Check string fields aren't being parsed as numbers
- Verify numeric fields are actually numbers, not strings

### Issue: Backend not responding
**Cause:** Wrong endpoint or backend down
**Solution:**
- Check REACT_APP_BACKEND_URL in .env
- Verify Railway backend is running
- Check network tab for actual endpoint being called

### Issue: "Failed to fetch"
**Cause:** CORS or network issue
**Solution:**
- Check backend CORS settings
- Verify frontend can reach backend URL
- Check browser console for CORS errors

## Verification Commands

### Test CIT endpoint directly:
```bash
curl -X POST "https://fiquant-taxpro-backend-production.up.railway.app/api/calculate-cit" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Corp",
    "tin": "",
    "year_of_assessment": "",
    "tax_year": "",
    "annual_turnover": 50000000,
    "total_fixed_assets": 0,
    "gross_income": 50000000,
    "other_income": 0,
    "cost_of_goods_sold": 0,
    "staff_costs": 0,
    "rent_expenses": 0,
    "professional_fees": 0,
    "depreciation": 0,
    "interest_paid_unrelated": 0,
    "interest_paid_related": 0,
    "other_deductible_expenses": 0,
    "entertainment_expenses": 0,
    "fines_penalties": 0,
    "personal_expenses": 0,
    "excessive_interest": 0,
    "other_non_deductible": 0
  }'
```

## Browser Console Debugging

After the fix, you should see in console:
```
Sending CIT data: {
  company_name: "...",
  tin: "",
  annual_turnover: 50000000,
  ...
}
```

If error occurs, you'll see:
```
Error calculating CIT: ...
Error details: { detail: "..." }
```

## Deploy to Production

1. Commit changes:
```bash
git add frontend/src/App.js
git commit -m "Fix CIT calculator tin field handling and improve error logging"
git push origin main
```

2. Vercel auto-deploys

3. Test on production after deployment

---
**Status**: CIT calculator fixed. PAYE, VAT, CGT already working.
