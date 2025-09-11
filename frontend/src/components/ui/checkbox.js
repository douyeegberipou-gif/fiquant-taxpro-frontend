import React from 'react';

export const Checkbox = React.forwardRef(({ checked, onCheckedChange, className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      ref={ref}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className || ''}`}
      {...props}
    />
  );
});

Checkbox.displayName = 'Checkbox';