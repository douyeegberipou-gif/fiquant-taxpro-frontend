import React from 'react';
import { Input } from '../ui/input';
import { useDevice } from '../../hooks/useDevice';
import { getInputMode } from '../../utils/mobileOptimization';

/**
 * Mobile-optimized input component
 * - Larger touch targets
 * - Proper keyboard types
 * - Native mobile input behaviors
 */
export const MobileInput = ({ 
  type = 'text', 
  className = '', 
  ...props 
}) => {
  const { isMobileOrLargeMobile } = useDevice();

  const inputMode = getInputMode(type);
  
  // Mobile-specific attributes
  const mobileProps = isMobileOrLargeMobile ? {
    inputMode,
    autoCapitalize: type === 'email' ? 'none' : 'sentences',
    autoCorrect: type === 'email' || type === 'tel' ? 'off' : 'on',
    spellCheck: type === 'email' || type === 'tel' ? 'false' : 'true',
    style: { fontSize: '16px' } // Prevents iOS zoom
  } : {};

  return (
    <Input
      type={type}
      className={`${className} ${
        isMobileOrLargeMobile ? 'min-h-[44px] text-base px-4 py-3' : ''
      }`}
      {...mobileProps}
      {...props}
    />
  );
};
