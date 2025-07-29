import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const countryCodes = [
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+1', country: 'CA', name: 'Canada' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
  { code: '+46', country: 'SE', name: 'Sweden' },
  { code: '+47', country: 'NO', name: 'Norway' },
  { code: '+45', country: 'DK', name: 'Denmark' },
  { code: '+358', country: 'FI', name: 'Finland' },
  { code: '+48', country: 'PL', name: 'Poland' },
  { code: '+420', country: 'CZ', name: 'Czech Republic' },
  { code: '+36', country: 'HU', name: 'Hungary' },
  { code: '+43', country: 'AT', name: 'Austria' },
  { code: '+41', country: 'CH', name: 'Switzerland' },
  { code: '+32', country: 'BE', name: 'Belgium' },
  { code: '+351', country: 'PT', name: 'Portugal' },
  { code: '+353', country: 'IE', name: 'Ireland' },
  { code: '+30', country: 'GR', name: 'Greece' },
  { code: '+90', country: 'TR', name: 'Turkey' },
  { code: '+7', country: 'RU', name: 'Russia' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+55', country: 'BR', name: 'Brazil' },
  { code: '+52', country: 'MX', name: 'Mexico' },
  { code: '+54', country: 'AR', name: 'Argentina' },
  { code: '+56', country: 'CL', name: 'Chile' },
  { code: '+57', country: 'CO', name: 'Colombia' },
  { code: '+58', country: 'VE', name: 'Venezuela' },
  { code: '+51', country: 'PE', name: 'Peru' },
  { code: '+593', country: 'EC', name: 'Ecuador' },
  { code: '+595', country: 'PY', name: 'Paraguay' },
  { code: '+598', country: 'UY', name: 'Uruguay' },
  { code: '+591', country: 'BO', name: 'Bolivia' },
  { code: '+27', country: 'ZA', name: 'South Africa' },
  { code: '+234', country: 'NG', name: 'Nigeria' },
  { code: '+254', country: 'KE', name: 'Kenya' },
  { code: '+20', country: 'EG', name: 'Egypt' },
  { code: '+212', country: 'MA', name: 'Morocco' },
  { code: '+216', country: 'TN', name: 'Tunisia' },
  { code: '+213', country: 'DZ', name: 'Algeria' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia' },
  { code: '+971', country: 'AE', name: 'United Arab Emirates' },
  { code: '+972', country: 'IL', name: 'Israel' },
  { code: '+962', country: 'JO', name: 'Jordan' },
  { code: '+961', country: 'LB', name: 'Lebanon' },
  { code: '+964', country: 'IQ', name: 'Iraq' },
  { code: '+98', country: 'IR', name: 'Iran' },
  { code: '+93', country: 'AF', name: 'Afghanistan' },
  { code: '+92', country: 'PK', name: 'Pakistan' },
  { code: '+880', country: 'BD', name: 'Bangladesh' },
  { code: '+94', country: 'LK', name: 'Sri Lanka' },
  { code: '+95', country: 'MM', name: 'Myanmar' },
  { code: '+66', country: 'TH', name: 'Thailand' },
  { code: '+84', country: 'VN', name: 'Vietnam' },
  { code: '+60', country: 'MY', name: 'Malaysia' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+62', country: 'ID', name: 'Indonesia' },
  { code: '+63', country: 'PH', name: 'Philippines' },
  { code: '+64', country: 'NZ', name: 'New Zealand' }
];

export default function PhoneInput({ value, onChange, error, disabled = false }) {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (value) {
      // Parse existing phone number
      const match = value.match(/^(\+\d+)\s*(.+)$/);
      if (match) {
        const countryCode = match[1];
        const number = match[2];
        const country = countryCodes.find(c => c.code === countryCode) || countryCodes[0];
        setSelectedCountry(country);
        setPhoneNumber(number);
      } else {
        setPhoneNumber(value);
      }
    }
  }, [value]);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    updatePhoneValue(country.code, phoneNumber);
  };

  const handlePhoneChange = (e) => {
    const number = e.target.value.replace(/[^\d\s\-\(\)]/g, '');
    setPhoneNumber(number);
    updatePhoneValue(selectedCountry.code, number);
  };

  const updatePhoneValue = (countryCode, number) => {
    const fullNumber = `${countryCode} ${number}`.trim();
    onChange(fullNumber);
  };

  const validatePhone = (phone) => {
    const cleanNumber = phone.replace(/[^\d]/g, '');
    return cleanNumber.length >= 7 && cleanNumber.length <= 15;
  };

  const isValid = validatePhone(phoneNumber);

  return (
    <div className="space-y-2">
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center justify-between w-28 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed h-10"
          >
            <span className="font-medium">{selectedCountry.code}</span>
            <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute z-10 w-64 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {countryCodes.map((country) => (
                <button
                  key={country.country}
                  type="button"
                  onClick={() => handleCountryChange(country)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                >
                  <span className="font-medium">{country.code}</span>
                  <span className="ml-2 text-gray-600">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder="Enter phone number"
          className={`flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed h-10 text-sm ${
            error ? 'border-red-500' : ''
          }`}
        />
      </div>

      {/* Validation Message */}
      {phoneNumber && !isValid && (
        <p className="text-sm text-red-600">
          Please enter a valid phone number (7-15 digits)
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 