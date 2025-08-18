import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// IP-based location detection
const detectUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name,
      city: data.city,
      nationality: getNationalityFromCountry(data.country_name)
    };
  } catch (error) {
    console.log('Could not detect location, using defaults');
    return {
      country: 'United States',
      city: 'Los Angeles', 
      nationality: 'American'
    };
  }
};

// Convert country to nationality
const getNationalityFromCountry = (country) => {
  const countryToNationality = {
    'United States': 'American',
    'United Kingdom': 'British',
    'Canada': 'Canadian',
    'Australia': 'Australian',
    'Germany': 'German',
    'France': 'French',
    'Netherlands': 'Dutch',
    'Sweden': 'Swedish',
    'Norway': 'Norwegian',
    'Denmark': 'Danish',
    'Finland': 'Finnish',
    'Ireland': 'Irish',
    'Belgium': 'Belgian',
    'Switzerland': 'Swiss',
    'Austria': 'Austrian',
    'Italy': 'Italian',
    'Spain': 'Spanish',
    'Portugal': 'Portuguese',
    'Japan': 'Japanese',
    'South Korea': 'South Korean',
    'Singapore': 'Singaporean',
    'New Zealand': 'New Zealander',
    'Brazil': 'Brazilian',
    'Mexico': 'Mexican',
    'Argentina': 'Argentinian',
    'Chile': 'Chilean',
    'Colombia': 'Colombian',
    'India': 'Indian',
    'China': 'Chinese'
  };
  
  return countryToNationality[country] || country + 'n';
};

// Comprehensive list of countries
const ALL_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland', 'Belgium', 'Switzerland', 'Austria',
  'Italy', 'Spain', 'Portugal', 'Japan', 'South Korea', 'Singapore', 'New Zealand', 'Brazil',
  'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'India', 'China',
  'Thailand', 'Philippines', 'Indonesia', 'Malaysia', 'Vietnam', 'South Africa', 'Nigeria',
  'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Israel', 'Turkey', 'Russia', 'Poland', 'Czech Republic',
  'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Slovenia', 'Slovakia', 'Lithuania',
  'Latvia', 'Estonia', 'Ukraine', 'Belarus', 'Greece', 'Cyprus', 'Malta', 'Luxembourg',
  'Iceland', 'Liechtenstein', 'Monaco', 'San Marino', 'Vatican City', 'Andorra', 'Albania',
  'Bosnia and Herzegovina', 'Montenegro', 'North Macedonia', 'Moldova', 'Georgia', 'Armenia',
  'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan',
  'Afghanistan', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives',
  'Myanmar', 'Laos', 'Cambodia', 'Brunei', 'East Timor', 'Papua New Guinea', 'Fiji',
  'Solomon Islands', 'Vanuatu', 'Samoa', 'Tonga', 'Tuvalu', 'Kiribati', 'Nauru', 'Palau',
  'Marshall Islands', 'Micronesia', 'Mongolia', 'North Korea', 'Taiwan', 'Hong Kong', 'Macau',
  'Iran', 'Iraq', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen',
  'Jordan', 'Lebanon', 'Syria', 'Cyprus', 'Algeria', 'Tunisia', 'Libya', 'Sudan', 'Chad',
  'Niger', 'Mali', 'Burkina Faso', 'Senegal', 'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone',
  'Liberia', 'Ivory Coast', 'Ghana', 'Togo', 'Benin', 'Nigeria', 'Cameroon', 'Equatorial Guinea',
  'Gabon', 'Republic of the Congo', 'Democratic Republic of the Congo', 'Central African Republic',
  'Angola', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'South Africa', 'Lesotho', 'Eswatini',
  'Mozambique', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Tanzania', 'Kenya',
  'Uganda', 'Rwanda', 'Burundi', 'Ethiopia', 'Eritrea', 'Djibouti', 'Somalia', 'Malawi',
  'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Trinidad and Tobago',
  'Barbados', 'Saint Lucia', 'Grenada', 'Saint Vincent and the Grenadines', 'Antigua and Barbuda',
  'Saint Kitts and Nevis', 'Dominica', 'Bahamas', 'Belize', 'Guatemala', 'Honduras', 'El Salvador',
  'Nicaragua', 'Costa Rica', 'Panama', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Guyana',
  'Suriname', 'French Guiana'
];

// Comprehensive list of nationalities (matching countries)
const ALL_NATIONALITIES = [
  'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Dutch',
  'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Irish', 'Belgian', 'Swiss', 'Austrian',
  'Italian', 'Spanish', 'Portuguese', 'Japanese', 'South Korean', 'Singaporean', 'New Zealander', 'Brazilian',
  'Mexican', 'Argentinian', 'Chilean', 'Colombian', 'Peruvian', 'Venezuelan', 'Indian', 'Chinese',
  'Thai', 'Filipino', 'Indonesian', 'Malaysian', 'Vietnamese', 'South African', 'Nigerian',
  'Kenyan', 'Ghanaian', 'Egyptian', 'Moroccan', 'Israeli', 'Turkish', 'Russian', 'Polish', 'Czech',
  'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian', 'Slovenian', 'Slovak', 'Lithuanian',
  'Latvian', 'Estonian', 'Ukrainian', 'Belarusian', 'Greek', 'Cypriot', 'Maltese', 'Luxembourgish',
  'Icelandic', 'Liechtensteiner', 'Monégasque', 'Sammarinese', 'Vatican', 'Andorran', 'Albanian',
  'Bosnian', 'Montenegrin', 'North Macedonian', 'Moldovan', 'Georgian', 'Armenian',
  'Azerbaijani', 'Kazakhstani', 'Uzbekistani', 'Kyrgyzstani', 'Tajikistani', 'Turkmenistani',
  'Afghan', 'Pakistani', 'Bangladeshi', 'Sri Lankan', 'Nepalese', 'Bhutanese', 'Maldivian',
  'Burmese', 'Laotian', 'Cambodian', 'Bruneian', 'East Timorese', 'Papua New Guinean', 'Fijian',
  'Solomon Islander', 'Ni-Vanuatu', 'Samoan', 'Tongan', 'Tuvaluan', 'I-Kiribati', 'Nauruan', 'Palauan',
  'Marshallese', 'Micronesian', 'Mongolian', 'North Korean', 'Taiwanese', 'Hong Konger', 'Macanese',
  'Iranian', 'Iraqi', 'Saudi Arabian', 'Emirati', 'Qatari', 'Kuwaiti', 'Bahraini', 'Omani', 'Yemeni',
  'Jordanian', 'Lebanese', 'Syrian', 'Cypriot', 'Algerian', 'Tunisian', 'Libyan', 'Sudanese', 'Chadian',
  'Nigerien', 'Malian', 'Burkinabé', 'Senegalese', 'Gambian', 'Guinea-Bissauan', 'Guinean', 'Sierra Leonean',
  'Liberian', 'Ivorian', 'Ghanaian', 'Togolese', 'Beninese', 'Nigerian', 'Cameroonian', 'Equatorial Guinean',
  'Gabonese', 'Congolese', 'Congolese', 'Central African',
  'Angolan', 'Zambian', 'Zimbabwean', 'Botswanan', 'Namibian', 'South African', 'Basotho', 'Swazi',
  'Mozambican', 'Malagasy', 'Mauritian', 'Seychellois', 'Comorian', 'Tanzanian', 'Kenyan',
  'Ugandan', 'Rwandan', 'Burundian', 'Ethiopian', 'Eritrean', 'Djiboutian', 'Somali', 'Malawian',
  'Cuban', 'Jamaican', 'Haitian', 'Dominican', 'Puerto Rican', 'Trinidadian', 'Tobagonian',
  'Barbadian', 'Saint Lucian', 'Grenadian', 'Vincentian', 'Antiguan', 'Barbudan',
  'Kittitian', 'Nevisian', 'Dominican', 'Bahamian', 'Belizean', 'Guatemalan', 'Honduran', 'Salvadoran',
  'Nicaraguan', 'Costa Rican', 'Panamanian', 'Ecuadorian', 'Uruguayan', 'Paraguayan', 'Bolivian', 'Guyanese',
  'Surinamese', 'French Guianese'
];

// Top music industry countries (most likely to be selected)
const TOP_MUSIC_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands'
];

const TOP_MUSIC_NATIONALITIES = [
  'American', 'British', 'Canadian', 'Australian', 'German', 'French', 'Dutch'
];

// Major cities by music industry presence
const MAJOR_MUSIC_CITIES = [
  'Los Angeles', 'New York', 'Nashville', 'London', 'Toronto', 'Berlin', 'Paris',
  'Amsterdam', 'Stockholm', 'Melbourne', 'Sydney', 'Atlanta', 'Miami', 'Chicago',
  'Austin', 'Seattle', 'Detroit', 'Memphis', 'New Orleans', 'Liverpool', 'Manchester',
  'Glasgow', 'Dublin', 'Montreal', 'Vancouver', 'Hamburg', 'Munich', 'Cologne',
  'Lyon', 'Marseille', 'Rotterdam', 'The Hague', 'Gothenburg', 'Oslo', 'Copenhagen',
  'Helsinki', 'Reykjavik', 'Brussels', 'Vienna', 'Zurich', 'Geneva', 'Milan', 'Rome',
  'Naples', 'Madrid', 'Barcelona', 'Lisbon', 'Porto', 'Tokyo', 'Osaka', 'Seoul',
  'Singapore', 'Auckland', 'Wellington', 'São Paulo', 'Rio de Janeiro', 'Mexico City',
  'Buenos Aires', 'Santiago', 'Bogotá', 'Lima', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai',
  'Bangkok', 'Manila', 'Jakarta', 'Kuala Lumpur', 'Ho Chi Minh City', 'Cape Town',
  'Johannesburg', 'Lagos', 'Nairobi', 'Cairo', 'Tel Aviv', 'Istanbul', 'Moscow',
  'Warsaw', 'Prague', 'Budapest', 'Bucharest', 'Sofia', 'Zagreb', 'Belgrade',
  'Athens', 'Nicosia', 'Valletta', 'Reykjavik'
];

// Intelligent Dropdown Component
export function IntelligentDropdown({ 
  value, 
  onChange, 
  options, 
  topOptions = [], 
  placeholder = "Select option", 
  disabled = false,
  className = "",
  searchable = true,
  useIPLocation = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [ipLocation, setIpLocation] = useState(null);
  const dropdownRef = useRef(null);

  // Detect IP location on component mount
  useEffect(() => {
    if (useIPLocation && !ipLocation) {
      detectUserLocation().then(location => {
        setIpLocation(location);
      });
    }
  }, [useIPLocation, ipLocation]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      // Create smart ordering: IP location + top options + rest
      let smartTopOptions = [...topOptions];
      
      // If we have IP location, prioritize it
      if (useIPLocation && ipLocation) {
        const locationOption = getLocationOption();
        if (locationOption && !smartTopOptions.includes(locationOption)) {
          smartTopOptions = [locationOption, ...smartTopOptions.slice(0, 6)];
        }
      }
      
      const remainingOptions = options.filter(option => !smartTopOptions.includes(option));
      setFilteredOptions([...smartTopOptions, ...remainingOptions]);
    }
  }, [searchTerm, options, topOptions, ipLocation, useIPLocation]);

  const getLocationOption = () => {
    if (!ipLocation) return null;
    
    // Return the appropriate option based on dropdown type
    if (options.includes(ipLocation.country)) return ipLocation.country;
    if (options.includes(ipLocation.nationality)) return ipLocation.nationality;
    if (options.includes(ipLocation.city)) return ipLocation.city;
    
    return null;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md text-left flex justify-between items-center ${
          disabled 
            ? 'border-gray-300 bg-gray-100 cursor-not-allowed text-gray-500' 
            : 'border-gray-300 bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                  value === option ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                {option}
              </button>
            ))}
            
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Specific dropdown components
export function NationalityDropdown({ value, onChange, disabled = false, className = "" }) {
  return (
    <IntelligentDropdown
      value={value}
      onChange={onChange}
      options={ALL_NATIONALITIES}
      topOptions={TOP_MUSIC_NATIONALITIES}
      placeholder="Select nationality"
      disabled={disabled}
      className={className}
      searchable={true}
      useIPLocation={true}
    />
  );
}

export function CountryDropdown({ value, onChange, disabled = false, className = "" }) {
  return (
    <IntelligentDropdown
      value={value}
      onChange={onChange}
      options={ALL_COUNTRIES}
      topOptions={TOP_MUSIC_COUNTRIES}
      placeholder="Select country"
      disabled={disabled}
      className={className}
      searchable={true}
      useIPLocation={true}
    />
  );
}

export function CityDropdown({ value, onChange, disabled = false, className = "" }) {
  return (
    <IntelligentDropdown
      value={value}
      onChange={onChange}
      options={MAJOR_MUSIC_CITIES}
      topOptions={MAJOR_MUSIC_CITIES.slice(0, 7)} // Top 7 music cities
      placeholder="Select city"
      disabled={disabled}
      className={className}
      searchable={true}
      useIPLocation={true}
    />
  );
}

// Country codes for phone numbers
const COUNTRY_CODES = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'Canada', flag: '🇨🇦' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪' },
  { code: '+47', country: 'Norway', flag: '🇳🇴' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰' },
  { code: '+358', country: 'Finland', flag: '🇫🇮' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+48', country: 'Poland', flag: '🇵🇱' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺' },
  { code: '+40', country: 'Romania', flag: '🇷🇴' },
  { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷' },
  { code: '+381', country: 'Serbia', flag: '🇷🇸' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾' },
  { code: '+30', country: 'Greece', flag: '🇬🇷' }
];

// Top country codes (most commonly used)
const TOP_COUNTRY_CODES = ['+1', '+44', '+49', '+33', '+39', '+34', '+61'];

export function CountryCodeDropdown({ value, onChange, disabled = false, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredCodes = COUNTRY_CODES.filter(item => 
    !searchTerm || 
    item.code.includes(searchTerm) ||
    item.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by: top codes first, then alphabetical
  const sortedCodes = [
    ...filteredCodes.filter(item => TOP_COUNTRY_CODES.includes(item.code)),
    ...filteredCodes.filter(item => !TOP_COUNTRY_CODES.includes(item.code))
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (code) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedItem = COUNTRY_CODES.find(item => item.code === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md text-left flex justify-between items-center min-w-[120px] ${
          disabled 
            ? 'border-gray-300 bg-gray-100 cursor-not-allowed text-gray-500' 
            : 'border-gray-300 bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }`}
      >
        <span className="flex items-center">
          {selectedItem ? (
            <>
              <span className="mr-2">{selectedItem.flag}</span>
              <span>{selectedItem.code}</span>
            </>
          ) : (
            <span className="text-gray-500">Code</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {sortedCodes.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center ${
                  value === item.code ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                <span className="mr-3">{item.flag}</span>
                <span className="font-mono font-medium mr-3">{item.code}</span>
                <span className="text-sm text-gray-600">{item.country}</span>
              </button>
            ))}
            
            {sortedCodes.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No country codes found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
