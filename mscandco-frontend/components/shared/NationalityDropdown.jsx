'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Search, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';
// import { getPredictedNationalities } from '../../lib/geolocation-utils';

// Comprehensive list of nationalities
const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Antiguan', 'Argentine', 'Armenian', 'Australian',
  'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian', 'Belarusian', 'Belgian', 'Belizean', 'Beninese',
  'Bhutanese', 'Bolivian', 'Bosnian', 'Botswanan', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe', 'Burmese',
  'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese', 'Colombian',
  'Comoran', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican',
  'Dutch', 'East Timorese', 'Ecuadorean', 'Egyptian', 'Emirian', 'Equatorial Guinean', 'Eritrean', 'Estonian', 'Ethiopian', 'Fijian',
  'Filipino', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Grenadian',
  'Guatemalan', 'Guinea-Bissauan', 'Guinean', 'Guyanese', 'Haitian', 'Herzegovinian', 'Honduran', 'Hungarian', 'I-Kiribati', 'Icelandic',
  'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian', 'Jamaican', 'Japanese',
  'Jordanian', 'Kazakhstani', 'Kenyan', 'Kittian and Nevisian', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese', 'Liberian',
  'Libyan', 'Liechtensteiner', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivan', 'Malian',
  'Maltese', 'Marshallese', 'Mauritanian', 'Mauritian', 'Mexican', 'Micronesian', 'Moldovan', 'Monacan', 'Mongolian', 'Moroccan',
  'Mosotho', 'Motswana', 'Mozambican', 'Namibian', 'Nauruan', 'Nepalese', 'New Zealander', 'Ni-Vanuatu', 'Nicaraguan', 'Nigerian',
  'Nigerien', 'North Korean', 'Northern Irish', 'Norwegian', 'Omani', 'Pakistani', 'Palauan', 'Palestinian', 'Panamanian', 'Papua New Guinean',
  'Paraguayan', 'Peruvian', 'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran',
  'Samoan', 'San Marinese', 'Sao Tomean', 'Saudi', 'Scottish', 'Senegalese', 'Serbian', 'Seychellois', 'Sierra Leonean', 'Singaporean',
  'Slovakian', 'Slovenian', 'Solomon Islander', 'Somali', 'South African', 'South Korean', 'South Sudanese', 'Spanish', 'Sri Lankan', 'Sudanese',
  'Surinamer', 'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian', 'Thai', 'Togolese',
  'Tongan', 'Trinidadian or Tobagonian', 'Tunisian', 'Turkish', 'Tuvaluan', 'Ugandan', 'Ukrainian', 'Uruguayan', 'Uzbekistani', 'Venezuelan',
  'Vietnamese', 'Welsh', 'Yemenite', 'Zambian', 'Zimbabwean'
].sort();

export default function NationalityDropdown({ 
  value, 
  onChange, 
  placeholder = "Select your nationality...", 
  className = "",
  disabled = false,
  showSearch = true,
  autoSelect = false,
  error = null,
  onError = null,
  id = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictedNationalities, setPredictedNationalities] = useState([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSelections, setRecentSelections] = useState([]);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Load predicted nationalities on component mount
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        // const predicted = await getPredictedNationalities(NATIONALITIES);
        const predicted = [];
        setPredictedNationalities(predicted);
      } catch (error) {
        console.warn('Failed to load nationality predictions:', error);
      } finally {
        setIsLoadingPredictions(false);
      }
    };

    loadPredictions();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const { predictedList, remainingList } = useMemo(() => {
    // Apply search filter if there's a search term
    if (searchTerm) {
      const filtered = NATIONALITIES.filter(nationality =>
        nationality.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // When searching, don't separate predicted vs remaining
      return { predictedList: [], remainingList: filtered };
    }
    
    // Separate predicted nationalities from the rest
    const remaining = NATIONALITIES.filter(nationality => 
      !predictedNationalities.includes(nationality)
    );
    
    return { 
      predictedList: predictedNationalities, 
      remainingList: remaining 
    };
  }, [searchTerm, predictedNationalities]);

  const handleSelect = (nationality) => {
    onChange(nationality);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {showSearch && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nationalities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          <div className="py-1">
            {predictedList.length === 0 && remainingList.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No nationalities found</div>
            ) : (
              <>
                {/* Predicted Nationalities Section */}
                {predictedList.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Suggested for you
                    </div>
                    {predictedList.map((nationality) => (
                      <button
                        key={`predicted-${nationality}`}
                        type="button"
                        onClick={() => handleSelect(nationality)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${
                          value === nationality ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        {nationality}
                      </button>
                    ))}
                    {remainingList.length > 0 && <div className="border-t border-gray-200 my-1"></div>}
                  </>
                )}

                {/* All Other Nationalities Section */}
                {remainingList.length > 0 && (
                  <>
                    {predictedList.length > 0 && (
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                        All nationalities
                      </div>
                    )}
                    {remainingList.map((nationality) => (
                      <button
                        key={nationality}
                        type="button"
                        onClick={() => handleSelect(nationality)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                          value === nationality ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                        }`}
                      >
                        {nationality}
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
