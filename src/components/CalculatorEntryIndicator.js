import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Bobbing arrow indicator for calculator data entry sections
 * Displays a bouncing arrow with "Enter details to calculate" text
 * Place this component ABOVE calculator input cards
 */
const CalculatorEntryIndicator = ({ text = "Enter details to calculate", className = "" }) => {
  return (
    <div 
      className={`w-full flex items-center justify-center gap-2 py-1 animate-bounce ${className}`}
      data-testid="calculator-entry-indicator"
    >
      <ChevronDown className="h-5 w-5 text-amber-500" />
      <span className="text-sm font-medium text-amber-600">{text}</span>
      <ChevronDown className="h-5 w-5 text-amber-500" />
    </div>
  );
};

export default CalculatorEntryIndicator;
