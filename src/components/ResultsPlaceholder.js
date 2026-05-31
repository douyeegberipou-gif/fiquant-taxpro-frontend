import React from 'react';
import { Card, CardContent } from './ui/card';

const ResultsPlaceholder = ({ className = '' }) => (
  <Card className={`bg-white shadow-lg flex-1 flex flex-col ${className}`} style={{ borderColor: '#e5e7eb' }}>
    <CardContent className="flex flex-col items-center pt-8 pb-6 px-8 text-center">
      <p className="text-base font-medium" style={{ color: '#9ca3af' }}>
        Your tax calculation results will appear here
      </p>
      <p className="text-xs mt-3 max-w-xs leading-relaxed" style={{ color: '#9ca3af' }}>
        Test calculations are anonymous unless saved by the user. Only tiered users' calculations are available in history
      </p>
    </CardContent>
  </Card>
);

export default ResultsPlaceholder;
