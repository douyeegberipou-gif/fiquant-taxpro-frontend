import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Country codes with flags
const COUNTRY_CODES = [
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', name: 'NG' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸', name: 'US' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', name: 'GB' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', name: 'GH' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', name: 'KE' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', name: 'ZA' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', name: 'DE' },
  { code: '+33', country: 'France', flag: '🇫🇷', name: 'FR' },
  { code: '+91', country: 'India', flag: '🇮🇳', name: 'IN' },
  { code: '+86', country: 'China', flag: '🇨🇳', name: 'CN' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', name: 'JP' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', name: 'AE' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', name: 'SA' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', name: 'EG' },
  { code: '+237', country: 'Cameroon', flag: '🇨🇲', name: 'CM' },
];

// Parse function to extract country code and number
const parsePhoneValue = (val) => {
  if (!val) return { countryCode: '+234', phoneNumber: '' };
  
  for (const country of COUNTRY_CODES) {
    if (val.startsWith(country.code)) {
      return {
        countryCode: country.code,
        phoneNumber: val.slice(country.code.length).replace(/^[\s-]+/, '')
      };
    }
  }
  
  if (val.startsWith('+')) {
    const match = val.match(/^(\+\d{1,4})(.*)/);
    if (match) {
      return {
        countryCode: match[1],
        phoneNumber: match[2].replace(/^[\s-]+/, '')
      };
    }
  }
  
  return { countryCode: '+234', phoneNumber: val };
};

export const PhoneInput = ({ 
  value = '', 
  onChange, 
  placeholder = "8012345678",
  className = "",
  id,
  disabled = false
}) => {
  // Parse initial value
  const initialParsed = parsePhoneValue(value);
  const initialCountry = COUNTRY_CODES.find(c => c.code === initialParsed.countryCode) || COUNTRY_CODES[0];
  
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [localNumber, setLocalNumber] = useState(initialParsed.phoneNumber);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine and notify parent
  const notifyChange = (countryCode, number) => {
    const cleanNumber = number.replace(/[\s-]/g, '');
    const combinedValue = cleanNumber ? `${countryCode}${cleanNumber}` : '';
    onChange(combinedValue);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    notifyChange(country.code, localNumber);
  };

  const handlePhoneChange = (e) => {
    const newValue = e.target.value.replace(/[^\d\s-]/g, '');
    setLocalNumber(newValue);
    notifyChange(selectedCountry.code, newValue);
  };

  return (
    <div className={`flex ${className}`}>
      {/* Country Code Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="flex items-center h-10 px-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md hover:bg-gray-200 transition-colors min-w-[85px] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        >
          <span className="text-lg mr-1">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
          <ChevronDown className="h-3 w-3 ml-1 text-gray-500" />
        </button>
        
        {isDropdownOpen && (
          <div 
            className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto min-w-[220px]"
            style={{ zIndex: 9999 }}
          >
            {COUNTRY_CODES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={`w-full flex items-center px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                  selectedCountry.code === country.code ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-lg mr-2">{country.flag}</span>
                <span className="text-sm font-medium text-gray-700 mr-2">{country.code}</span>
                <span className="text-sm text-gray-500 truncate">{country.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Phone Number Input */}
      <div className="relative flex-1">
        <input
          id={id}
          type="tel"
          placeholder={placeholder}
          value={localNumber}
          onChange={handlePhoneChange}
          disabled={disabled}
          className="w-full h-10 pl-3 pr-3 bg-white text-black placeholder:text-gray-400 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
