import React from 'react';
import { useDevice } from '../../hooks/useDevice';
import { ChevronRight } from 'lucide-react';

/**
 * Converts tables to cards on mobile for better readability
 * Desktop view remains as table
 */
export const MobileTable = ({ columns, data, onRowClick }) => {
  const { isMobileOrLargeMobile } = useDevice();

  if (isMobileOrLargeMobile) {
    // Mobile: Card view
    return (
      <div className="space-y-3">
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick && onRowClick(row)}
            className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${
              onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
            }`}
          >
            {columns.map((column, colIndex) => (
              <div
                key={colIndex}
                className={`flex justify-between items-center ${
                  colIndex < columns.length - 1 ? 'mb-2 pb-2 border-b border-gray-100' : ''
                }`}
              >
                <span className="text-sm font-medium text-gray-600">
                  {column.header}
                </span>
                <span className="text-sm text-gray-900">
                  {column.render ? column.render(row) : row[column.accessor]}
                </span>
              </div>
            ))}
            {onRowClick && (
              <ChevronRight className="h-5 w-5 text-gray-400 ml-auto mt-2" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: Standard table
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
