import React from 'react';
import { Lightbulb, Calculator, ArrowRight, Lock } from 'lucide-react';
import { Button } from './ui/button';

const NetPaymentsCTA = ({ 
  onOpenNetPayments,
  isLocked = false,
  formatCurrency,
  payeResult
}) => {
  return (
    <div 
      className="mt-6 p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50"
      data-testid="net-payments-cta"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <Lightbulb className="h-6 w-6 text-emerald-600" />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg mb-1">
            Want to know what to pay this employee?
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Calculate take-home pay after PAYE, pension, NHF, and other deductions.
            {payeResult && (
              <span className="text-emerald-600 font-medium">
                {' '}Based on {formatCurrency(payeResult.monthly_tax || 0)}/month PAYE.
              </span>
            )}
          </p>
          
          {/* Button */}
          <Button
            onClick={onOpenNetPayments}
            className={`${
              isLocked 
                ? 'bg-gray-600 hover:bg-gray-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white flex items-center gap-2`}
            data-testid="open-net-payments-btn"
          >
            <Calculator className="h-4 w-4" />
            <span>Calculate & Draft Staff Net Payments Schedule</span>
            {isLocked ? (
              <Lock className="h-4 w-4 ml-1" />
            ) : (
              <ArrowRight className="h-4 w-4 ml-1" />
            )}
          </Button>
          
          {isLocked && (
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Available in Starter plan and above
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetPaymentsCTA;
