import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { useDevice } from '../../hooks/useDevice';

/**
 * Mobile-optimized card component
 * Adjusts padding and spacing for small screens
 */
export const MobileCard = ({ title, children, className = '', headerAction }) => {
  const { isMobileOrLargeMobile } = useDevice();

  return (
    <Card className={`${isMobileOrLargeMobile ? 'rounded-lg shadow-sm' : ''} ${className}`}>
      {title && (
        <CardHeader className={isMobileOrLargeMobile ? 'px-4 py-3' : ''}>
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${
              isMobileOrLargeMobile ? 'text-base' : 'text-lg'
            }`}>
              {title}
            </h3>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={isMobileOrLargeMobile ? 'px-4 py-3' : ''}>
        {children}
      </CardContent>
    </Card>
  );
};
