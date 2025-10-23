'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Search, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';
// import { getPredictedCities } from '../../lib/geolocation-utils';

// Major cities by country (sampling of most common cities for each country)
const CITIES_BY_COUNTRY = {
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'San Francisco', 'Columbus', 'Fort Worth', 'Indianapolis', 'Charlotte', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs', 'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans'],
  
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Belfast', 'Leicester', 'Wakefield', 'Coventry', 'Nottingham', 'Newcastle', 'Sunderland', 'Brighton', 'Hull', 'Plymouth', 'Stoke-on-Trent', 'Wolverhampton', 'Derby', 'Swansea', 'Southampton', 'Salford', 'Aberdeen', 'Westminster', 'Portsmouth', 'York', 'Peterborough', 'Dundee', 'Lancaster', 'Oxford', 'Newport', 'Preston', 'St Albans', 'Norwich', 'Chester', 'Cambridge'],
  
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'Sherbrooke', 'St. Johns', 'Barrie', 'Kelowna', 'Abbotsford', 'Greater Sudbury', 'Kingston', 'Saguenay', 'Trois-Rivières', 'Guelph', 'Cambridge', 'Whitby', 'Ajax'],
  
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay', 'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs Harbour', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton'],
  
  'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Mannheim', 'Augsburg', 'Wiesbaden', 'Gelsenkirchen', 'Aachen', 'Mönchengladbach', 'Braunschweig', 'Chemnitz', 'Kiel', 'Krefeld'],
  
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis', 'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Limoges', 'Tours', 'Amiens', 'Perpignan', 'Metz'],
  
  'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Venice', 'Verona', 'Messina', 'Padua', 'Trieste', 'Taranto', 'Brescia', 'Parma', 'Reggio Calabria', 'Modena', 'Prato', 'Cagliari', 'Livorno', 'Perugia', 'Foggia', 'Ravenna', 'Rimini', 'Salerno', 'Ferrara', 'Sassari'],
  
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Eixample', 'A Coruña', 'Elche', 'Oviedo', 'Santa Cruz de Tenerife', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell', 'Móstoles', 'Alcalá de Henares', 'Pamplona', 'Fuenlabrada', 'Almería'],
  
  'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama', 'Hiroshima', 'Sendai', 'Kitakyushu', 'Chiba', 'Sakai', 'Niigata', 'Hamamatsu', 'Okayama', 'Sagamihara', 'Shizuoka', 'Kumamoto', 'Kagoshima', 'Matsuyama', 'Kanazawa', 'Utsunomiya', 'Oita', 'Nara', 'Himeji', 'Matsudo', 'Nishinomiya'],
  
  'China': ['Shanghai', 'Beijing', 'Chongqing', 'Tianjin', 'Guangzhou', 'Shenzhen', 'Wuhan', 'Dongguan', 'Chengdu', 'Nanjing', 'Foshan', 'Shenyang', 'Hangzhou', 'Xian', 'Harbin', 'Qingdao', 'Changchun', 'Jinan', 'Zhengzhou', 'Kunming', 'Dalian', 'Taiyuan', 'Hefei', 'Urumqi', 'Fuzhou', 'Shijiazhuang', 'Zhongshan', 'Wenzhou', 'Xuzhou', 'Nanning'],
  
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi'],
  
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia', 'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Nova Iguaçu', 'Teresina', 'Natal', 'Campo Grande', 'São Bernardo do Campo', 'João Pessoa', 'Santo André', 'Osasco', 'Jaboatão dos Guararapes', 'Contagem', 'São José dos Campos', 'Uberlândia'],
  
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Torreón', 'Querétaro', 'San Luis Potosí', 'Mérida', 'Mexicali', 'Aguascalientes', 'Acapulco', 'Cuernavaca', 'Saltillo', 'Villahermosa', 'Culiacán', 'Morelia', 'Reynosa', 'Toluca', 'Chihuahua', 'Cancún', 'Veracruz', 'Hermosillo', 'Xalapa', 'Irapuato', 'Coatzacoalcos', 'Mazatlán', 'Durango'],
  
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Cheongju', 'Ansan', 'Jeonju', 'Anyang', 'Cheonan', 'Pohang', 'Uijeongbu', 'Siheung', 'Pyeongtaek', 'Paju', 'Gimhae', 'Jinju', 'Hwaseong', 'Iksan', 'Wonju', 'Gunpo', 'Osan'],

  // Add more countries as needed
  'Nigeria': ['Lagos', 'Kano', 'Ibadan', 'Abuja', 'Kaduna', 'Port Harcourt', 'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu', 'Abeokuta', 'Bauchi', 'Akure', 'Sokoto', 'Onitsha', 'Warri']
};

// Common global cities that appear in multiple countries or are major international hubs
const GLOBAL_CITIES = [
  'London', 'New York', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Mumbai', 'Shanghai', 'São Paulo',
  'Moscow', 'Cairo', 'Istanbul', 'Bangkok', 'Singapore', 'Dubai', 'Hong Kong', 'Los Angeles', 'Chicago', 'Rome',
  'Madrid', 'Amsterdam', 'Vienna', 'Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Dublin', 'Brussels', 'Zurich',
  'Geneva', 'Barcelona', 'Milan', 'Naples', 'Venice', 'Florence', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne',
  'Stuttgart', 'Düsseldorf', 'Warsaw', 'Prague', 'Budapest', 'Athens', 'Lisbon', 'Edinburgh', 'Manchester', 'Birmingham'
];

export default function CityDropdown({ 
  value, 
  onChange, 
  placeholder = "Select a city...", 
  className = "",
  disabled = false,
  showSearch = true,
  country = null, // Optional: filter cities by country
  allowCustom = true // Allow users to type custom city names
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictedCities, setPredictedCities] = useState([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const dropdownRef = useRef(null);

  const availableCities = useMemo(() => {
    if (country && CITIES_BY_COUNTRY[country]) {
      return CITIES_BY_COUNTRY[country];
    }
    return GLOBAL_CITIES;
  }, [country]);

  // Load predicted cities when component mounts or country changes
  useEffect(() => {
    const loadPredictions = async () => {
      setIsLoadingPredictions(true);
      try {
        // const predicted = await getPredictedCities(availableCities, country);
        const predicted = [];
        setPredictedCities(predicted);
      } catch (error) {
        console.warn('Failed to load city predictions:', error);
      } finally {
        setIsLoadingPredictions(false);
      }
    };

    loadPredictions();
  }, [country, availableCities]);

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
      const filtered = availableCities.filter(city =>
        city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // When searching, don't separate predicted vs remaining
      return { predictedList: [], remainingList: filtered };
    }
    
    // Separate predicted cities from the rest
    const remaining = availableCities.filter(city => 
      !predictedCities.includes(city)
    );
    
    return { 
      predictedList: predictedCities, 
      remainingList: remaining 
    };
  }, [searchTerm, availableCities, predictedCities]);

  const handleSelect = (city) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomCity = () => {
    if (allowCustom && searchTerm && !filteredCities.includes(searchTerm)) {
      onChange(searchTerm);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && allowCustom && searchTerm && !filteredCities.includes(searchTerm)) {
      handleCustomCity();
    }
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
                  placeholder={`Search cities${country ? ` in ${country}` : ''}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          <div className="py-1">
            {predictedList.length === 0 && remainingList.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                {searchTerm ? (
                  allowCustom ? (
                    <button
                      type="button"
                      onClick={handleCustomCity}
                      className="w-full text-left text-blue-600 hover:bg-blue-50"
                    >
                      Add "{searchTerm}" as custom city
                    </button>
                  ) : (
                    `No cities found matching "${searchTerm}"`
                  )
                ) : (
                  'No cities available'
                )}
              </div>
            ) : (
              <>
                {/* Predicted Cities Section */}
                {predictedList.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {country ? `Popular in ${country}` : 'Suggested for you'}
                    </div>
                    {predictedList.map((city) => (
                      <button
                        key={`predicted-${city}`}
                        type="button"
                        onClick={() => handleSelect(city)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:outline-none focus:bg-blue-50 ${
                          value === city ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                    {remainingList.length > 0 && <div className="border-t border-gray-200 my-1"></div>}
                  </>
                )}

                {/* All Other Cities Section */}
                {remainingList.length > 0 && (
                  <>
                    {predictedList.length > 0 && (
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                        {country ? `Other cities in ${country}` : 'All cities'}
                      </div>
                    )}
                    {remainingList.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleSelect(city)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                          value === city ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </>
                )}

                {/* Custom City Option */}
                {allowCustom && searchTerm && !predictedList.includes(searchTerm) && !remainingList.includes(searchTerm) && (
                  <button
                    type="button"
                    onClick={handleCustomCity}
                    className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-200"
                  >
                    Add "{searchTerm}" as custom city
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
