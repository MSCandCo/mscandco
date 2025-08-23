import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Search, MapPin, Check, Loader2, AlertCircle } from 'lucide-react';
// import { getPredictedCountries, clearLocationCache } from '../../lib/geolocation-utils';

// Comprehensive list of countries (ISO 3166-1 alpha-2 codes with names)
const COUNTRIES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AO', name: 'Angola' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AX', name: 'Åland Islands' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BN', name: 'Brunei Darussalam' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BQ', name: 'Bonaire, Sint Eustatius and Saba' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BV', name: 'Bouvet Island' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CA', name: 'Canada' },
  { code: 'CC', name: 'Cocos (Keeling) Islands' },
  { code: 'CD', name: 'Congo, Democratic Republic of the' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Congo' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands (Malvinas)' },
  { code: 'FM', name: 'Micronesia, Federated States of' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GR', name: 'Greece' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HM', name: 'Heard Island and McDonald Islands' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IN', name: 'India' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran, Islamic Republic of' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'KP', name: 'Korea, Democratic People\'s Republic of' },
  { code: 'KR', name: 'Korea, Republic of' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: 'Lao People\'s Democratic Republic' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MD', name: 'Moldova, Republic of' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MF', name: 'Saint Martin (French part)' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macao' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'PN', name: 'Pitcairn' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'PS', name: 'Palestine, State of' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'RU', name: 'Russian Federation' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'SX', name: 'Sint Maarten (Dutch part)' },
  { code: 'SY', name: 'Syrian Arab Republic' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TD', name: 'Chad' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan, Province of China' },
  { code: 'TZ', name: 'Tanzania, United Republic of' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'United States Minor Outlying Islands' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Holy See (Vatican City State)' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela, Bolivarian Republic of' },
  { code: 'VG', name: 'Virgin Islands, British' },
  { code: 'VI', name: 'Virgin Islands, U.S.' },
  { code: 'VN', name: 'Viet Nam' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' },
  { code: 'YE', name: 'Yemen' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

// Country code to flag emoji mapping
const COUNTRY_FLAGS = {
  'AD': '🇦🇩', 'AE': '🇦🇪', 'AF': '🇦🇫', 'AG': '🇦🇬', 'AI': '🇦🇮', 'AL': '🇦🇱', 'AM': '🇦🇲', 'AO': '🇦🇴', 'AQ': '🇦🇶', 'AR': '🇦🇷',
  'AS': '🇦🇸', 'AT': '🇦🇹', 'AU': '🇦🇺', 'AW': '🇦🇼', 'AX': '🇦🇽', 'AZ': '🇦🇿', 'BA': '🇧🇦', 'BB': '🇧🇧', 'BD': '🇧🇩', 'BE': '🇧🇪',
  'BF': '🇧🇫', 'BG': '🇧🇬', 'BH': '🇧🇭', 'BI': '🇧🇮', 'BJ': '🇧🇯', 'BL': '🇧🇱', 'BM': '🇧🇲', 'BN': '🇧🇳', 'BO': '🇧🇴', 'BQ': '🇧🇶',
  'BR': '🇧🇷', 'BS': '🇧🇸', 'BT': '🇧🇹', 'BV': '🇧🇻', 'BW': '🇧🇼', 'BY': '🇧🇾', 'BZ': '🇧🇿', 'CA': '🇨🇦', 'CC': '🇨🇨', 'CD': '🇨🇩',
  'CF': '🇨🇫', 'CG': '🇨🇬', 'CH': '🇨🇭', 'CI': '🇨🇮', 'CK': '🇨🇰', 'CL': '🇨🇱', 'CM': '🇨🇲', 'CN': '🇨🇳', 'CO': '🇨🇴', 'CR': '🇨🇷',
  'CU': '🇨🇺', 'CV': '🇨🇻', 'CW': '🇨🇼', 'CX': '🇨🇽', 'CY': '🇨🇾', 'CZ': '🇨🇿', 'DE': '🇩🇪', 'DJ': '🇩🇯', 'DK': '🇩🇰', 'DM': '🇩🇲',
  'DO': '🇩🇴', 'DZ': '🇩🇿', 'EC': '🇪🇨', 'EE': '🇪🇪', 'EG': '🇪🇬', 'EH': '🇪🇭', 'ER': '🇪🇷', 'ES': '🇪🇸', 'ET': '🇪🇹', 'FI': '🇫🇮',
  'FJ': '🇫🇯', 'FK': '🇫🇰', 'FM': '🇫🇲', 'FO': '🇫🇴', 'FR': '🇫🇷', 'GA': '🇬🇦', 'GB': '🇬🇧', 'GD': '🇬🇩', 'GE': '🇬🇪', 'GF': '🇬🇫',
  'GG': '🇬🇬', 'GH': '🇬🇭', 'GI': '🇬🇮', 'GL': '🇬🇱', 'GM': '🇬🇲', 'GN': '🇬🇳', 'GP': '🇬🇵', 'GQ': '🇬🇶', 'GR': '🇬🇷', 'GS': '🇬🇸',
  'GT': '🇬🇹', 'GU': '🇬🇺', 'GW': '🇬🇼', 'GY': '🇬🇾', 'HK': '🇭🇰', 'HM': '🇭🇲', 'HN': '🇭🇳', 'HR': '🇭🇷', 'HT': '🇭🇹', 'HU': '🇭🇺',
  'ID': '🇮🇩', 'IE': '🇮🇪', 'IL': '🇮🇱', 'IM': '🇮🇲', 'IN': '🇮🇳', 'IO': '🇮🇴', 'IQ': '🇮🇶', 'IR': '🇮🇷', 'IS': '🇮🇸', 'IT': '🇮🇹',
  'JE': '🇯🇪', 'JM': '🇯🇲', 'JO': '🇯🇴', 'JP': '🇯🇵', 'KE': '🇰🇪', 'KG': '🇰🇬', 'KH': '🇰🇭', 'KI': '🇰🇮', 'KM': '🇰🇲', 'KN': '🇰🇳',
  'KP': '🇰🇵', 'KR': '🇰🇷', 'KW': '🇰🇼', 'KY': '🇰🇾', 'KZ': '🇰🇿', 'LA': '🇱🇦', 'LB': '🇱🇧', 'LC': '🇱🇨', 'LI': '🇱🇮', 'LK': '🇱🇰',
  'LR': '🇱🇷', 'LS': '🇱🇸', 'LT': '🇱🇹', 'LU': '🇱🇺', 'LV': '🇱🇻', 'LY': '🇱🇾', 'MA': '🇲🇦', 'MC': '🇲🇨', 'MD': '🇲🇩', 'ME': '🇲🇪',
  'MF': '🇲🇫', 'MG': '🇲🇬', 'MH': '🇲🇭', 'MK': '🇲🇰', 'ML': '🇲🇱', 'MM': '🇲🇲', 'MN': '🇲🇳', 'MO': '🇲🇴', 'MP': '🇲🇵', 'MQ': '🇲🇶',
  'MR': '🇲🇷', 'MS': '🇲🇸', 'MT': '🇲🇹', 'MU': '🇲🇺', 'MV': '🇲🇻', 'MW': '🇲🇼', 'MX': '🇲🇽', 'MY': '🇲🇾', 'MZ': '🇲🇿', 'NA': '🇳🇦',
  'NC': '🇳🇨', 'NE': '🇳🇪', 'NF': '🇳🇫', 'NG': '🇳🇬', 'NI': '🇳🇮', 'NL': '🇳🇱', 'NO': '🇳🇴', 'NP': '🇳🇵', 'NR': '🇳🇷', 'NU': '🇳🇺',
  'NZ': '🇳🇿', 'OM': '🇴🇲', 'PA': '🇵🇦', 'PE': '🇵🇪', 'PF': '🇵🇫', 'PG': '🇵🇬', 'PH': '🇵🇭', 'PK': '🇵🇰', 'PL': '🇵🇱', 'PM': '🇵🇲',
  'PN': '🇵🇳', 'PR': '🇵🇷', 'PS': '🇵🇸', 'PT': '🇵🇹', 'PW': '🇵🇼', 'PY': '🇵🇾', 'QA': '🇶🇦', 'RE': '🇷🇪', 'RO': '🇷🇴', 'RS': '🇷🇸',
  'RU': '🇷🇺', 'RW': '🇷🇼', 'SA': '🇸🇦', 'SB': '🇸🇧', 'SC': '🇸🇨', 'SD': '🇸🇩', 'SE': '🇸🇪', 'SG': '🇸🇬', 'SH': '🇸🇭', 'SI': '🇸🇮',
  'SJ': '🇸🇯', 'SK': '🇸🇰', 'SL': '🇸🇱', 'SM': '🇸🇲', 'SN': '🇸🇳', 'SO': '🇸🇴', 'SR': '🇸🇷', 'SS': '🇸🇸', 'ST': '🇸🇹', 'SV': '🇸🇻',
  'SX': '🇸🇽', 'SY': '🇸🇾', 'SZ': '🇸🇿', 'TC': '🇹🇨', 'TD': '🇹🇩', 'TF': '🇹🇫', 'TG': '🇹🇬', 'TH': '🇹🇭', 'TJ': '🇹🇯', 'TK': '🇹🇰',
  'TL': '🇹🇱', 'TM': '🇹🇲', 'TN': '🇹🇳', 'TO': '🇹🇴', 'TR': '🇹🇷', 'TT': '🇹🇹', 'TV': '🇹🇻', 'TW': '🇹🇼', 'TZ': '🇹🇿', 'UA': '🇺🇦',
  'UG': '🇺🇬', 'UM': '🇺🇲', 'US': '🇺🇸', 'UY': '🇺🇾', 'UZ': '🇺🇿', 'VA': '🇻🇦', 'VC': '🇻🇨', 'VE': '🇻🇪', 'VG': '🇻🇬', 'VI': '🇻🇮',
  'VN': '🇻🇳', 'VU': '🇻🇺', 'WF': '🇼🇫', 'WS': '🇼🇸', 'YE': '🇾🇪', 'YT': '🇾🇹', 'ZA': '🇿🇦', 'ZM': '🇿🇲', 'ZW': '🇿🇼'
};

export default function CountryDropdown({ 
  value, 
  onChange, 
  placeholder = "Select a country...", 
  className = "",
  disabled = false,
  showSearch = true,
  returnCode = false, // If true, returns country code, otherwise returns country name
  autoSelect = false, // Auto-select if confidence is high
  showFlag = true, // Show country flags
  error = null, // Error message to display
  onError = null, // Error callback
  id = null // For accessibility
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictedCountries, setPredictedCountries] = useState([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSelections, setRecentSelections] = useState([]);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Load recent selections from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('countryDropdown_recent');
      if (stored) {
        const recent = JSON.parse(stored);
        setRecentSelections(recent);
      }
    } catch (error) {
      console.warn('Failed to load recent selections:', error);
    }
  }, []);

  // Load predicted countries with auto-selection
  useEffect(() => {
    const loadPredictions = async () => {
      try {
        // const predicted = await getPredictedCountries(COUNTRIES);
        const predicted = [];
        setPredictedCountries(predicted);
        
        // Auto-select if confidence is high and no value is set
        if (autoSelect && !value && !hasAutoSelected && predicted.length > 0) {
          const topPrediction = predicted[0];
          const confidence = predicted.length >= 3 ? 0.95 : 0.8; // High confidence if we have good predictions
          
          if (confidence >= 0.9) {
            const selectedValue = returnCode ? topPrediction.code : topPrediction.name;
            onChange(selectedValue);
            setHasAutoSelected(true);
          }
        }
      } catch (error) {
        console.warn('Failed to load country predictions:', error);
        if (onError) {
          onError('Failed to detect your location. Please select manually.');
        }
      } finally {
        setIsLoadingPredictions(false);
      }
    };

    loadPredictions();
  }, [autoSelect, value, hasAutoSelected, returnCode, onChange, onError]);

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

  // Memoized lists for dropdown sections
  const { recentList, predictedList, remainingList } = useMemo(() => {
    let filtered = COUNTRIES;
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      filtered = COUNTRIES.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      // When searching, don't separate into sections
      return { recentList: [], predictedList: [], remainingList: filtered };
    }
    
    // Get recent selections (up to 3)
    const recentCountries = recentSelections
      .map(code => COUNTRIES.find(c => c.code === code))
      .filter(Boolean)
      .slice(0, 3);
    
    // Combine recent and predicted, removing duplicates
    const recentCodes = recentCountries.map(c => c.code);
    const predictedCodes = predictedCountries.map(c => c.code);
    const allPriorityCodes = [...recentCodes, ...predictedCodes];
    
    // Filter out already shown countries from remaining
    const remaining = COUNTRIES.filter(country => 
      !allPriorityCodes.includes(country.code)
    );
    
    // Remove recent countries from predicted list
    const filteredPredicted = predictedCountries.filter(country =>
      !recentCodes.includes(country.code)
    );
    
    return { 
      recentList: recentCountries,
      predictedList: filteredPredicted, 
      remainingList: remaining 
    };
  }, [searchTerm, predictedCountries, recentSelections]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev => {
            const maxIndex = (recentList.length + predictedList.length + remainingList.length) - 1;
            return prev < maxIndex ? prev + 1 : 0;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev => {
            const maxIndex = (recentList.length + predictedList.length + remainingList.length) - 1;
            return prev > 0 ? prev - 1 : maxIndex;
          });
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0) {
            const allOptions = [...recentList, ...predictedList, ...remainingList];
            const selectedCountryOption = allOptions[highlightedIndex];
            if (selectedCountryOption) {
              handleSelect(selectedCountryOption);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
        case 'Home':
          event.preventDefault();
          setHighlightedIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setHighlightedIndex((recentList.length + predictedList.length + remainingList.length) - 1);
          break;
        default:
          // Type-ahead functionality
          if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
            const allOptions = [...recentList, ...predictedList, ...remainingList];
            const searchLetter = event.key.toLowerCase();
            const currentIndex = highlightedIndex >= 0 ? highlightedIndex : -1;
            
            // Find next country starting with the typed letter
            let foundIndex = -1;
            for (let i = currentIndex + 1; i < allOptions.length; i++) {
              if (allOptions[i].name.toLowerCase().startsWith(searchLetter)) {
                foundIndex = i;
                break;
              }
            }
            
            // If not found, search from beginning
            if (foundIndex === -1) {
              for (let i = 0; i <= currentIndex; i++) {
                if (allOptions[i].name.toLowerCase().startsWith(searchLetter)) {
                  foundIndex = i;
                  break;
                }
              }
            }
            
            if (foundIndex !== -1) {
              setHighlightedIndex(foundIndex);
            }
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, recentList, predictedList, remainingList]);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  const selectedCountry = COUNTRIES.find(country => 
    returnCode ? country.code === value : country.name === value
  );

  const handleSelect = (country) => {
    try {
      // Save to recent selections
      const newRecent = [
        country.code,
        ...recentSelections.filter(code => code !== country.code)
      ].slice(0, 5); // Keep only last 5
      
      setRecentSelections(newRecent);
      localStorage.setItem('countryDropdown_recent', JSON.stringify(newRecent));
      
      // Call onChange
      onChange(returnCode ? country.code : country.name);
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Error selecting country:', error);
      if (onError) {
        onError('Failed to select country. Please try again.');
      }
    }
  };

  // Fuzzy search function for error correction
  const fuzzySearch = (term, options) => {
    const searchTerm = term.toLowerCase();
    return options.filter(country => {
      const name = country.name.toLowerCase();
      // Check if it's a simple typo (Levenshtein distance <= 2)
      if (name.includes(searchTerm) || country.code.toLowerCase().includes(searchTerm)) {
        return true;
      }
      // Simple fuzzy matching for common typos
      const distance = Math.abs(name.length - searchTerm.length);
      if (distance <= 2) {
        let matches = 0;
        for (let i = 0; i < Math.min(name.length, searchTerm.length); i++) {
          if (name[i] === searchTerm[i]) matches++;
        }
        return matches >= Math.min(name.length, searchTerm.length) - 2;
      }
      return false;
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : selectedCountry 
              ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-300'
        } ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed opacity-60' 
            : 'cursor-pointer hover:border-gray-400 hover:shadow-md'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={id ? `${id}-label` : undefined}
        id={id}
      >
        <div className="flex items-center">
          {selectedCountry && showFlag && (
            <span className="mr-2 text-lg" role="img" aria-label={`${selectedCountry.name} flag`}>
              {COUNTRY_FLAGS[selectedCountry.code] || '🏳️'}
            </span>
          )}
          <span className={selectedCountry ? 'text-gray-900' : 'text-gray-500'}>
            {selectedCountry ? selectedCountry.name : placeholder}
          </span>
          {selectedCountry && (
            <span className="ml-auto text-xs text-gray-400">
              {selectedCountry.code}
            </span>
          )}
        </div>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {isLoadingPredictions && (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin mr-1" />
          )}
          {selectedCountry && !isLoadingPredictions && (
            <Check className="h-4 w-4 text-green-500 mr-1" />
          )}
          {error && (
            <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {error && (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {showSearch && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          <div className="py-1">
            {recentList.length === 0 && predictedList.length === 0 && remainingList.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No countries found</div>
            ) : (
              <>
                {/* Recent Selections Section */}
                {recentList.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Recently used
                    </div>
                    {recentList.map((country, index) => (
                      <button
                        key={`recent-${country.code}`}
                        type="button"
                        onClick={() => handleSelect(country)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:outline-none focus:bg-blue-50 flex items-center ${
                          selectedCountry?.code === country.code 
                            ? 'bg-blue-100 text-blue-700' 
                            : highlightedIndex === index
                              ? 'bg-gray-100'
                              : 'text-gray-900'
                        }`}
                      >
                        {showFlag && (
                          <span className="mr-2 text-lg" role="img" aria-label={`${country.name} flag`}>
                            {COUNTRY_FLAGS[country.code] || '🏳️'}
                          </span>
                        )}
                        <span className="font-medium">{country.name}</span>
                        <span className="ml-2 text-gray-500 text-xs">({country.code})</span>
                        {selectedCountry?.code === country.code && (
                          <Check className="h-4 w-4 text-blue-600 ml-auto" />
                        )}
                      </button>
                    ))}
                    {(predictedList.length > 0 || remainingList.length > 0) && (
                      <div className="border-t border-gray-200 my-1"></div>
                    )}
                  </>
                )}

                {/* Predicted Countries Section */}
                {predictedList.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      Suggested for you
                    </div>
                    {predictedList.map((country, index) => {
                      const actualIndex = recentList.length + index;
                      return (
                        <button
                          key={`predicted-${country.code}`}
                          type="button"
                          onClick={() => handleSelect(country)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-green-50 focus:outline-none focus:bg-green-50 flex items-center ${
                            selectedCountry?.code === country.code 
                              ? 'bg-green-100 text-green-700' 
                              : highlightedIndex === actualIndex
                                ? 'bg-gray-100'
                                : 'text-gray-900'
                          }`}
                        >
                          {showFlag && (
                            <span className="mr-2 text-lg" role="img" aria-label={`${country.name} flag`}>
                              {COUNTRY_FLAGS[country.code] || '🏳️'}
                            </span>
                          )}
                          <span className="font-medium">{country.name}</span>
                          <span className="ml-2 text-gray-500 text-xs">({country.code})</span>
                          {selectedCountry?.code === country.code && (
                            <Check className="h-4 w-4 text-green-600 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                    {remainingList.length > 0 && <div className="border-t border-gray-200 my-1"></div>}
                  </>
                )}

                {/* All Other Countries Section */}
                {remainingList.length > 0 && (
                  <>
                    {(recentList.length > 0 || predictedList.length > 0) && (
                      <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                        All countries ({remainingList.length})
                      </div>
                    )}
                    {remainingList.map((country, index) => {
                      const actualIndex = recentList.length + predictedList.length + index;
                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelect(country)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center ${
                            selectedCountry?.code === country.code 
                              ? 'bg-blue-50 text-blue-600' 
                              : highlightedIndex === actualIndex
                                ? 'bg-gray-100'
                                : 'text-gray-900'
                          }`}
                        >
                          {showFlag && (
                            <span className="mr-2 text-base" role="img" aria-label={`${country.name} flag`}>
                              {COUNTRY_FLAGS[country.code] || '🏳️'}
                            </span>
                          )}
                          <span className="font-medium">{country.name}</span>
                          <span className="ml-2 text-gray-500 text-xs">({country.code})</span>
                          {selectedCountry?.code === country.code && (
                            <Check className="h-4 w-4 text-blue-600 ml-auto" />
                          )}
                        </button>
                      );
                    })}
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
