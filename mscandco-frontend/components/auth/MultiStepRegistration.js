import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, Mail, Lock, Shield, User, Check, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { NationalityDropdown, CountryDropdown, CityDropdown } from '../shared/IntelligentDropdowns';

const MultiStepRegistration = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [registrationActive, setRegistrationActive] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Email & Password
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Email Verification
    emailVerificationCode: '',
    
    // Step 3: Backup Codes (generated)
    backupCodes: [],
    backupCodesConfirmed: false,
    
    // Step 4: Profile Information
    role: 'artist', // Default to artist
    firstName: '',
    lastName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    nationality: '',
    country: '',
    city: '',
    countryCode: '+44', // Default to UK
    phoneNumber: '',
    address: '',
    postalCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Smart dropdown arrays
  const nationalities = [
    "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine", "Armenian", "Australian", "Austrian",
    "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese",
    "Bolivian", "Bosnian", "Botswanan", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian",
    "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran",
    "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican", "Dutch",
    "East Timorese", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino",
    "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan",
    "Guinea-Bissauan", "Guinean", "Guyanese", "Haitian", "Herzegovinian", "Honduran", "Hungarian", "Icelander", "Indian", "Indonesian",
    "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani",
    "Kenyan", "Kittian and Nevisian", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner",
    "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivan", "Malian", "Maltese", "Marshallese",
    "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan", "Mosotho", "Motswana",
    "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Norwegian",
    "Omani", "Pakistani", "Palauan", "Panamanian", "Papua New Guinean", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari",
    "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran", "Samoan", "San Marinese", "Sao Tomean", "Saudi", "Scottish",
    "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian", "Solomon Islander", "Somali", "South African",
    "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese",
    "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian or Tobagonian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan",
    "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh", "Yemenite", "Zambian", "Zimbabwean"
  ];

  const countries = [
    "Afghanistan", "Albania", "Algeria", "United States", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria",
    "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "United Kingdom", "Brunei", "Bulgaria", "Burkina Faso", "Myanmar", "Burundi",
    "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominican Republic", "Netherlands",
    "East Timor", "Ecuador", "Egypt", "United Arab Emirates", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Philippines",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
    "Guinea-Bissau", "Guinea", "Guyana", "Haiti", "Herzegovina", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Saint Kitts and Nevis", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
    "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Morocco", "Lesotho", "Botswana",
    "Mozambique", "Namibia", "Nauru", "Nepal", "New Zealand", "Nicaragua", "Nigeria", "Niger", "North Korea", "Norway",
    "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Lucia", "El Salvador", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Scotland",
    "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan",
    "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Tuvalu", "Uganda",
    "Ukraine", "Uruguay", "Uzbekistan", "Venezuela", "Vietnam", "Wales", "Yemen", "Zambia", "Zimbabwe"
  ];

  const cities = [
    "London", "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas",
    "San Jose", "Austin", "Jacksonville", "San Francisco", "Columbus", "Charlotte", "Fort Worth", "Detroit", "El Paso", "Memphis",
    "Seattle", "Denver", "Washington", "Boston", "Nashville", "Baltimore", "Oklahoma City", "Louisville", "Portland", "Las Vegas",
    "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento", "Long Beach", "Kansas City", "Mesa", "Virginia Beach", "Atlanta",
    "Colorado Springs", "Raleigh", "Omaha", "Miami", "Oakland", "Minneapolis", "Tulsa", "Cleveland", "Wichita", "Arlington",
    "Manchester", "Birmingham", "Glasgow", "Sheffield", "Bradford", "Liverpool", "Edinburgh", "Leicester", "Wakefield", "Coventry",
    "Belfast", "Nottingham", "Newcastle", "Sunderland", "Brighton", "Hull", "Plymouth", "Stoke", "Wolverhampton", "Derby",
    "Swansea", "Southampton", "Salford", "Aberdeen", "Westminster", "Portsmouth", "York", "Peterborough", "Dundee", "Lancaster",
    "Oxford", "Newport", "Preston", "St Albans", "Norwich", "Chester", "Cambridge", "Salisbury", "Exeter", "Gloucester",
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Bremen",
    "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao",
    "Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania",
    "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Sunshine Coast", "Wollongong"
  ];

  // Smart dropdown state (simplified for now)
  const smartNationalities = [];
  const smartCountries = [];
  const smartCities = [];
  const detectingNationality = false;
  const detectingCountry = false;
  const detectingCity = false;

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendCountdown, canResend]);

  // Set registration active flag on mount and listen for email verification messages
  useEffect(() => {
    // Mark registration as active to prevent redirects
    localStorage.setItem('registrationActive', 'true');
    setRegistrationActive(true);
    
    // Listen for email verification messages from popup window (for incognito mode)
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'EMAIL_VERIFIED' && event.data.verified) {
        console.log('✅ Received email verification confirmation from popup');
        setIsEmailVerified(true);
        setSuccess('Email verified successfully!');
        
        // Move to next step after a brief success message
        setTimeout(() => {
          setCurrentStep(3);
          setSuccess('');
          generateBackupCodes();
        }, 1500);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      // Clean up flag when component unmounts (registration complete or navigated away)
      localStorage.removeItem('registrationActive');
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Handle URL step parameter and check email verification status
  useEffect(() => {
    const { step } = router.query;
    
    // If step parameter is provided, jump to that step
    if (step && !isNaN(step)) {
      const stepNumber = parseInt(step);
      if (stepNumber >= 1 && stepNumber <= steps.length) {
        setCurrentStep(stepNumber);
      }
    }

    const checkEmailVerification = async () => {
      if (currentStep === 2) {
        try {
          // Refresh session to get latest data
          await supabase.auth.refreshSession();
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user && (user.email_confirmed_at || user.confirmed_at)) {
            setIsEmailVerified(true);
            setSuccess('Email already verified! You can proceed to the next step.');
          }
        } catch (error) {
          console.log('Could not check email verification status:', error);
        }
      }
    };

    checkEmailVerification();
  }, [currentStep, router.query]);

  // Listen for window focus to re-check verification when user returns from email
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (currentStep === 2 && !isEmailVerified) {
        console.log('🔄 Window focused, re-checking email verification...');
        try {
          await supabase.auth.refreshSession();
          const { data: { user } } = await supabase.auth.getUser();
          if (user && (user.email_confirmed_at || user.confirmed_at)) {
            setIsEmailVerified(true);
            setSuccess('Email verified! You can now proceed to the next step.');
          }
        } catch (error) {
          console.log('Could not re-check email verification:', error);
        }
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [currentStep, isEmailVerified]);

  const steps = [
    { id: 1, title: 'Create Account', icon: Mail, description: 'Enter your email and password' },
    { id: 2, title: 'Verify Email', icon: Mail, description: 'Check your email for verification code' },
    { id: 3, title: 'Backup Codes', icon: Shield, description: 'Save your recovery codes' },
    { id: 4, title: 'Complete Profile', icon: User, description: 'Fill in your profile details' }
  ];

  // Generate backup codes
  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    setFormData({ ...formData, backupCodes: codes });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
    
    // Handle address autocomplete
    if (name === 'address' && value.length > 1) {
      handleAddressSearch(value);
    } else if (name === 'address') {
      setShowAddressSuggestions(false);
    }
    
    // Refresh address suggestions if user changes city/country and has address text
    if ((name === 'city' || name === 'country') && formData.address && formData.address.length > 1) {
      setTimeout(() => handleAddressSearch(formData.address), 100);
    }
  };

  // Intelligent location-aware address autocomplete
  const handleAddressSearch = async (query) => {
    // console.log('🔍 Address search triggered for:', query, 'in', formData.city, formData.country);
    
    // Get user's selected location
    const userCity = formData.city || 'London';
    const userCountry = formData.country || 'United Kingdom';
    
    // Location-specific address data
    const locationData = {
      'United Kingdom': {
        'London': {
          postcodes: ['SW1A 1AA', 'EC1A 1BB', 'W1A 0AX', 'NW1 1AA', 'SE1 1AA'],
          areas: ['Westminster', 'Camden', 'Kensington', 'Greenwich', 'Southwark']
        },
        'Manchester': {
          postcodes: ['M1 1AA', 'M2 1BB', 'M3 1CC', 'M4 1DD', 'M5 1EE'],
          areas: ['City Centre', 'Ancoats', 'Salford', 'Didsbury', 'Chorlton']
        },
        'Birmingham': {
          postcodes: ['B1 1AA', 'B2 1BB', 'B3 1CC', 'B4 1DD', 'B5 1EE'],
          areas: ['City Centre', 'Digbeth', 'Jewellery Quarter', 'Edgbaston', 'Moseley']
        },
        'Edinburgh': {
          postcodes: ['EH1 1AA', 'EH2 1BB', 'EH3 1CC', 'EH4 1DD', 'EH8 1EE'],
          areas: ['Old Town', 'New Town', 'Leith', 'Morningside', 'Stockbridge']
        },
        'Glasgow': {
          postcodes: ['G1 1AA', 'G2 1BB', 'G3 1CC', 'G4 1DD', 'G12 1EE'],
          areas: ['City Centre', 'West End', 'Merchant City', 'Southside', 'East End']
        },
        'Cardiff': {
          postcodes: ['CF1 1AA', 'CF2 1BB', 'CF3 1CC', 'CF10 1DD', 'CF11 1EE'],
          areas: ['City Centre', 'Cardiff Bay', 'Canton', 'Roath', 'Pontcanna']
        }
      },
      'United States': {
        'New York': {
          postcodes: ['10001', '10002', '10003', '10004', '10005'],
          areas: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island']
        },
        'Los Angeles': {
          postcodes: ['90001', '90002', '90210', '90211', '90212'],
          areas: ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice', 'Downtown']
        },
        'Chicago': {
          postcodes: ['60601', '60602', '60603', '60604', '60605'],
          areas: ['Downtown', 'Lincoln Park', 'Wicker Park', 'River North', 'Gold Coast']
        }
      },
      'Canada': {
        'Toronto': {
          postcodes: ['M5V 1A1', 'M5H 1B2', 'M5G 1C3', 'M5B 1D4', 'M5A 1E5'],
          areas: ['Downtown', 'Yorkville', 'King West', 'Entertainment District', 'Financial District']
        },
        'Vancouver': {
          postcodes: ['V6B 1A1', 'V6C 1B2', 'V6E 1C3', 'V6G 1D4', 'V6H 1E5'],
          areas: ['Downtown', 'Yaletown', 'Coal Harbour', 'West End', 'Gastown']
        }
      }
    };
    
    // Get location data for user's city
    const cityData = locationData[userCountry]?.[userCity] || locationData['United Kingdom']['London'];
    
    // Generate intelligent suggestions based on user input and location
    const streetTypes = ['Street', 'Road', 'Avenue', 'Drive', 'Close', 'Lane', 'Gardens', 'Court', 'Crescent', 'Place'];
    const suggestions = [];
    
    // If query looks like a number, suggest house numbers with streets
    if (/^\d+/.test(query)) {
      const houseNumber = query.match(/^\d+/)[0];
      const streetName = query.replace(/^\d+\s*/, '') || 'High';
      
      streetTypes.slice(0, 4).forEach((type, index) => {
        const area = cityData.areas[index % cityData.areas.length];
        const postcode = cityData.postcodes[index % cityData.postcodes.length];
        suggestions.push({
          address: `${houseNumber} ${streetName} ${type}, ${area}, ${userCity}`,
          postcode: postcode
        });
      });
    } else {
      // For text input, suggest street names in local areas
      cityData.areas.slice(0, 5).forEach((area, index) => {
        const streetType = streetTypes[index % streetTypes.length];
        const postcode = cityData.postcodes[index % cityData.postcodes.length];
        
        if (query.length > 0) {
          suggestions.push({
            address: `${query} ${streetType}, ${area}, ${userCity}`,
            postcode: postcode
          });
        }
      });
    }
    
    // Filter suggestions that make sense with the query
    const filteredSuggestions = suggestions
      .filter(item => 
        item.address.toLowerCase().includes(query.toLowerCase()) &&
        item.address.toLowerCase() !== query.toLowerCase()
      )
      .slice(0, 5);
    
    // console.log('📍 Generated intelligent suggestions for', userCity, userCountry, ':', filteredSuggestions);
    
    setAddressSuggestions(filteredSuggestions);
    setShowAddressSuggestions(filteredSuggestions.length > 0);
  };

  const selectAddressSuggestion = (suggestion) => {
    setFormData({
      ...formData,
      address: suggestion.address
      // Removed postcode auto-fill to avoid mismatch
    });
    setShowAddressSuggestions(false);
  };

  // Get postal code requirements based on country
  const getPostalCodeInfo = (country) => {
    const countryInfo = {
      'United Kingdom': { 
        label: 'Postcode', 
        placeholder: 'e.g. SW1A 1AA', 
        required: true,
        pattern: '^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$'
      },
      'United States': { 
        label: 'Zip Code', 
        placeholder: 'e.g. 10001', 
        required: true,
        pattern: '^[0-9]{5}(-[0-9]{4})?$'
      },
      'Canada': { 
        label: 'Postal Code', 
        placeholder: 'e.g. K1A 0A6', 
        required: true,
        pattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$'
      },
      'Australia': { 
        label: 'Postcode', 
        placeholder: 'e.g. 2000', 
        required: true,
        pattern: '^[0-9]{4}$'
      },
      'Germany': { 
        label: 'Postcode', 
        placeholder: 'e.g. 10115', 
        required: true,
        pattern: '^[0-9]{5}$'
      },
      'France': { 
        label: 'Postal Code', 
        placeholder: 'e.g. 75001', 
        required: true,
        pattern: '^[0-9]{5}$'
      },
      'Netherlands': { 
        label: 'Postcode', 
        placeholder: 'e.g. 1012 AB', 
        required: true,
        pattern: '^[0-9]{4} [A-Z]{2}$'
      },
      'Sweden': { 
        label: 'Postal Code', 
        placeholder: 'e.g. 11122', 
        required: true,
        pattern: '^[0-9]{5}$'
      },
      'Italy': { 
        label: 'Postal Code', 
        placeholder: 'e.g. 00118', 
        required: true,
        pattern: '^[0-9]{5}$'
      },
      'Spain': { 
        label: 'Postal Code', 
        placeholder: 'e.g. 28001', 
        required: true,
        pattern: '^[0-9]{5}$'
      }
    };
    
    return countryInfo[country] || { 
      label: 'Postal Code', 
      placeholder: 'Postal code', 
      required: false 
    };
  };

  // Step 1: Create Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // First, check if email already exists
      const emailCheckResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const emailCheckData = await emailCheckResponse.json();
      
      if (emailCheckData.emailExists) {
        throw new Error('This email address exists and is associated with an account. Please log in instead.');
      }

      // Email is available, proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`,
          data: {
            registration_in_progress: true
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Registration successful:', data.user.id);
        setSuccess('Registration successful! Please check your email for verification.');
        
        // Move to email verification step
        setTimeout(() => {
          setCurrentStep(2);
          setSuccess('');
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Email - Check if email is actually verified
  const handleEmailVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, refresh the session to get the latest user data
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) {
        console.log('Session refresh error:', sessionError);
      }

      // Get the most up-to-date user information
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error('Unable to check verification status');
      }

      if (!user) {
        throw new Error('No user found. Please try registering again.');
      }

      console.log('🔍 User verification status:', {
        email: user.email,
        id: user.id,
        email_confirmed_at: user.email_confirmed_at,
        confirmed_at: user.confirmed_at,
        session_exists: !!session
      });

      // Check if email is verified (check both fields)
      if (!user.email_confirmed_at && !user.confirmed_at) {
        // Fallback: Check via API with admin privileges
        console.log('🔄 Trying fallback verification check via API...');
        
        const response = await fetch('/api/auth/check-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();
        
        if (!response.ok || !data.isVerified) {
          throw new Error('Please verify your email address.');
        }
        
        console.log('✅ Fallback verification successful!');
      }

      // Email is verified, proceed to backup codes
      setIsEmailVerified(true);
      generateBackupCodes();
      setSuccess('Email verified successfully!');
      
      // Move to next step after a brief success message
      setTimeout(() => {
        setCurrentStep(3);
        setSuccess('');
      }, 1500);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Confirm Backup Codes
  const handleBackupCodesConfirmation = (e) => {
    e.preventDefault();
    if (!formData.backupCodesConfirmed) {
      setError('Please confirm you have saved your backup codes');
      return;
    }
    setCurrentStep(4);
  };

  // Step 4: Complete Registration
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get current user session
      let { data: { session, user } } = await supabase.auth.getSession();
      
      if (!session || !user) {
        // Try to refresh the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData.session) {
          throw new Error('Please verify your email address and try logging in first.');
        }
        // Update session and user from refresh
        session = refreshData.session;
        user = refreshData.user;
      }

      const currentUser = user;
      if (!currentUser) {
        throw new Error('User session not found. Please try logging in.');
      }

      console.log('Creating profile for authenticated user:', currentUser.id);

      // First, update user metadata with the selected role
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          role: formData.role,
          first_name: formData.firstName,
          last_name: formData.lastName,
          registration_completed: true
        }
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        // Don't fail completely, just log the error
      }

      // Create user role in user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: currentUser.id,
          role: formData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (roleError) {
        console.error('Role creation error:', roleError);
        throw new Error(roleError.message || 'Failed to create user role');
      }

      // Create user profile (without role field)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: currentUser.id, // Use auth user ID
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          display_name: `${formData.firstName} ${formData.lastName}`,
          date_of_birth: `${formData.birthDay} ${formData.birthMonth} ${formData.birthYear}`,
          nationality: formData.nationality,
          country: formData.country,
          city: formData.city,
          country_code: formData.countryCode,
          phone_number: formData.phoneNumber,
          address: formData.address,
          profile_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(profileError.message || 'Failed to create profile');
      }

      // Create artist profile if role is artist
      if (formData.role === 'artist') {
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .insert({
            user_id: currentUser.id,
            artist_name: `${formData.firstName} ${formData.lastName}`,
            bio: `New artist joined on ${new Date().toLocaleDateString()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (artistError) {
          console.error('Artist profile creation error:', artistError);
          // Don't fail the entire registration for artist profile issues
          console.log('User profile created successfully, artist profile creation skipped');
        }
      }

      setSuccess('Registration completed successfully! Please log in to access your account.');
      
      // Clear registration active flag
      localStorage.removeItem('registrationActive');
      
      // Sign out the user and redirect to login
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation functions
  const goToNextStep = () => {
    // Prevent going to step 3 without email verification
    if (currentStep === 2 && !isEmailVerified) {
      setError('Please verify your email address first before proceeding.');
      return;
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResendEmail = async () => {
    if (!canResend || !formData.email) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`
        }
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Verification email sent! Please check your inbox.');
        setCanResend(false);
        setResendCountdown(180); // 3 minutes = 180 seconds
      }
    } catch (err) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col items-center">
            <form onSubmit={handleCreateAccount} className="space-y-8 w-full">
            <div className="text-center flex flex-col items-center">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  className="
                    max-w-lg w-full pl-12 pr-4 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    placeholder:text-sm placeholder-gray-400
                    text-gray-900
                  "
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="text-center flex flex-col items-center">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Create your password"
                  className="
                    w-full pl-12 pr-12 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    placeholder:text-xs placeholder-gray-400
                    text-gray-900
                  "
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-center flex flex-col items-center">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className="
                    w-full pl-12 pr-12 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    placeholder:text-xs placeholder-gray-400
                    text-gray-900
                  "
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Eye className="h-6 w-6 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-[400px]
                h-[45.58px]
                bg-[#1f2937] 
                text-white 
                border 
                border-[#1f2937] 
                rounded-xl 
                px-8 
                font-bold 
                text-lg
                shadow-lg 
                transition-all 
                duration-300 
                hover:bg-white 
                hover:text-[#1f2937] 
                hover:shadow-xl 
                hover:-translate-y-1
                focus:outline-none
                focus:ring-2
                focus:ring-[#1f2937]
                focus:ring-offset-2
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:transform-none
                flex items-center justify-center
              "
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
            </form>
          </div>
        );

      case 2:
        return (
          <form onSubmit={handleEmailVerification} className="space-y-6">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-[#1f2937] mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-gray-600 mb-4">
                We've sent a verification link to <strong>{formData.email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Click the link in your email to verify your account, then click continue below.
              </p>
              
              {/* Resend Email Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the email? Check your spam folder or resend it.
                </p>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={!canResend || isLoading}
                  className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    canResend && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                      Sending...
                    </>
                  ) : canResend ? (
                    'Resend Verification Email'
                  ) : (
                    `Resend in ${Math.floor(resendCountdown / 60)}:${(resendCountdown % 60).toString().padStart(2, '0')}`
                  )}
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#1f2937] text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Checking Verification...
                  </>
                ) : (
                  <>
                    {isEmailVerified ? 'Continue to Backup Codes' : 'Check Email Verification'}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleBackupCodesConfirmation} className="space-y-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-[#1f2937] mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Save Your Backup Codes</h3>
              <p className="text-gray-600 mb-6">
                These codes will help you recover your account if you lose access to your email.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {formData.backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded text-center font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Save these codes in a secure location. Each code can only be used once.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupCodesConfirmed"
                name="backupCodesConfirmed"
                checked={formData.backupCodesConfirmed}
                onChange={handleInputChange}
                className="h-4 w-4 text-[#1f2937] focus:ring-[#1f2937] border-gray-300 rounded"
              />
              <label htmlFor="backupCodesConfirmed" className="ml-2 block text-sm text-gray-900">
                I have saved my backup codes in a secure location
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#1f2937] text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Continue
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        );

      case 4:
        return (
          <form onSubmit={handleCompleteRegistration} className="space-y-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="
                  w-full px-4 py-3 text-lg
                  border border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                  transition-all duration-300
                  text-gray-900
                "
              >
                <option value="artist">Artist</option>
                <option value="label_admin">Label</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="First name"
                  className="
                    w-full px-4 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    placeholder-gray-400
                    text-gray-900
                  "
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last name"
                  className="
                    w-full px-4 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    placeholder-gray-400
                    text-gray-900
                  "
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Day"
                    min="1"
                    max="31"
                    value={formData.birthDay}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 2) {
                        setFormData({...formData, birthDay: value});
                        // Auto-focus next field when day is complete
                        if (value.length === 2 || (value.length === 1 && parseInt(value) > 3)) {
                          document.getElementById('birthMonth').focus();
                        }
                      }
                    }}
                    className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 text-center"
                    required
                  />
                </div>
                <div>
                  <select
                    id="birthMonth"
                    value={formData.birthMonth}
                    onChange={(e) => {
                      setFormData({...formData, birthMonth: e.target.value});
                      // Auto-focus year field when month is selected
                      if (e.target.value) {
                        document.getElementById('birthYear').focus();
                      }
                    }}
                    className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300"
                    required
                  >
                    <option value="">Month</option>
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    id="birthYear"
                    placeholder="Year"
                    min="1900"
                    max="2010"
                    value={formData.birthYear}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 4) {
                        setFormData({...formData, birthYear: value});
                      }
                    }}
                    className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300 text-center"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Format: 6 November 1989
              </p>
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                Nationality
              </label>
              <NationalityDropdown
                value={formData.nationality}
                onChange={(value) => setFormData({...formData, nationality: value})}
                className="w-full"
              />
                {smartNationalities.slice(0, 5).map((nationality, index) => {
                  const cleanNationality = nationality.replace(/^[📍⭐]\s/, '');
                  return (
                    <option key={`smart-${index}`} value={cleanNationality}>
                      {nationality}
                    </option>
                  );
                })}
                {smartNationalities.length > 0 && <option disabled>────────────</option>}
                <option value="Afghan">Afghan</option>
                <option value="Albanian">Albanian</option>
                <option value="Algerian">Algerian</option>
                <option value="American">American</option>
                <option value="Andorran">Andorran</option>
                <option value="Angolan">Angolan</option>
                <option value="Argentine">Argentine</option>
                <option value="Armenian">Armenian</option>
                <option value="Australian">Australian</option>
                <option value="Austrian">Austrian</option>
                <option value="Azerbaijani">Azerbaijani</option>
                <option value="Bahamian">Bahamian</option>
                <option value="Bahraini">Bahraini</option>
                <option value="Bangladeshi">Bangladeshi</option>
                <option value="Barbadian">Barbadian</option>
                <option value="Belarusian">Belarusian</option>
                <option value="Belgian">Belgian</option>
                <option value="Belizean">Belizean</option>
                <option value="Beninese">Beninese</option>
                <option value="Bhutanese">Bhutanese</option>
                <option value="Bolivian">Bolivian</option>
                <option value="Bosnian">Bosnian</option>
                <option value="Botswanan">Botswanan</option>
                <option value="Brazilian">Brazilian</option>
                <option value="British">British</option>
                <option value="Bruneian">Bruneian</option>
                <option value="Bulgarian">Bulgarian</option>
                <option value="Burkinabe">Burkinabe</option>
                <option value="Burmese">Burmese</option>
                <option value="Burundian">Burundian</option>
                <option value="Cambodian">Cambodian</option>
                <option value="Cameroonian">Cameroonian</option>
                <option value="Canadian">Canadian</option>
                <option value="Cape Verdean">Cape Verdean</option>
                <option value="Central African">Central African</option>
                <option value="Chadian">Chadian</option>
                <option value="Chilean">Chilean</option>
                <option value="Chinese">Chinese</option>
                <option value="Colombian">Colombian</option>
                <option value="Comoran">Comoran</option>
                <option value="Congolese">Congolese</option>
                <option value="Costa Rican">Costa Rican</option>
                <option value="Croatian">Croatian</option>
                <option value="Cuban">Cuban</option>
                <option value="Cypriot">Cypriot</option>
                <option value="Czech">Czech</option>
                <option value="Danish">Danish</option>
                <option value="Djiboutian">Djiboutian</option>
                <option value="Dominican">Dominican</option>
                <option value="Dutch">Dutch</option>
                <option value="East Timorese">East Timorese</option>
                <option value="Ecuadorean">Ecuadorean</option>
                <option value="Egyptian">Egyptian</option>
                <option value="Emirian">Emirian</option>
                <option value="English">English</option>
                <option value="Equatorial Guinean">Equatorial Guinean</option>
                <option value="Eritrean">Eritrean</option>
                <option value="Estonian">Estonian</option>
                <option value="Ethiopian">Ethiopian</option>
                <option value="Fijian">Fijian</option>
                <option value="Filipino">Filipino</option>
                <option value="Finnish">Finnish</option>
                <option value="French">French</option>
                <option value="Gabonese">Gabonese</option>
                <option value="Gambian">Gambian</option>
                <option value="Georgian">Georgian</option>
                <option value="German">German</option>
                <option value="Ghanaian">Ghanaian</option>
                <option value="Greek">Greek</option>
                <option value="Grenadian">Grenadian</option>
                <option value="Guatemalan">Guatemalan</option>
                <option value="Guinea-Bissauan">Guinea-Bissauan</option>
                <option value="Guinean">Guinean</option>
                <option value="Guyanese">Guyanese</option>
                <option value="Haitian">Haitian</option>
                <option value="Herzegovinian">Herzegovinian</option>
                <option value="Honduran">Honduran</option>
                <option value="Hungarian">Hungarian</option>
                <option value="Icelander">Icelander</option>
                <option value="Indian">Indian</option>
                <option value="Indonesian">Indonesian</option>
                <option value="Iranian">Iranian</option>
                <option value="Iraqi">Iraqi</option>
                <option value="Irish">Irish</option>
                <option value="Israeli">Israeli</option>
                <option value="Italian">Italian</option>
                <option value="Ivorian">Ivorian</option>
                <option value="Jamaican">Jamaican</option>
                <option value="Japanese">Japanese</option>
                <option value="Jordanian">Jordanian</option>
                <option value="Kazakhstani">Kazakhstani</option>
                <option value="Kenyan">Kenyan</option>
                <option value="Kittian and Nevisian">Kittian and Nevisian</option>
                <option value="Kuwaiti">Kuwaiti</option>
                <option value="Kyrgyz">Kyrgyz</option>
                <option value="Laotian">Laotian</option>
                <option value="Latvian">Latvian</option>
                <option value="Lebanese">Lebanese</option>
                <option value="Liberian">Liberian</option>
                <option value="Libyan">Libyan</option>
                <option value="Liechtensteiner">Liechtensteiner</option>
                <option value="Lithuanian">Lithuanian</option>
                <option value="Luxembourgish">Luxembourgish</option>
                <option value="Macedonian">Macedonian</option>
                <option value="Malagasy">Malagasy</option>
                <option value="Malawian">Malawian</option>
                <option value="Malaysian">Malaysian</option>
                <option value="Maldivan">Maldivan</option>
                <option value="Malian">Malian</option>
                <option value="Maltese">Maltese</option>
                <option value="Marshallese">Marshallese</option>
                <option value="Mauritanian">Mauritanian</option>
                <option value="Mauritian">Mauritian</option>
                <option value="Mexican">Mexican</option>
                <option value="Micronesian">Micronesian</option>
                <option value="Moldovan">Moldovan</option>
                <option value="Monacan">Monacan</option>
                <option value="Mongolian">Mongolian</option>
                <option value="Moroccan">Moroccan</option>
                <option value="Mosotho">Mosotho</option>
                <option value="Motswana">Motswana</option>
                <option value="Mozambican">Mozambican</option>
                <option value="Namibian">Namibian</option>
                <option value="Nauruan">Nauruan</option>
                <option value="Nepalese">Nepalese</option>
                <option value="New Zealander">New Zealander</option>
                <option value="Ni-Vanuatu">Ni-Vanuatu</option>
                <option value="Nicaraguan">Nicaraguan</option>
                <option value="Nigerian">Nigerian</option>
                <option value="Nigerien">Nigerien</option>
                <option value="North Korean">North Korean</option>
                <option value="Northern Irish">Northern Irish</option>
                <option value="Norwegian">Norwegian</option>
                <option value="Omani">Omani</option>
                <option value="Pakistani">Pakistani</option>
                <option value="Palauan">Palauan</option>
                <option value="Panamanian">Panamanian</option>
                <option value="Papua New Guinean">Papua New Guinean</option>
                <option value="Paraguayan">Paraguayan</option>
                <option value="Peruvian">Peruvian</option>
                <option value="Polish">Polish</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Qatari">Qatari</option>
                <option value="Romanian">Romanian</option>
                <option value="Russian">Russian</option>
                <option value="Rwandan">Rwandan</option>
                <option value="Saint Lucian">Saint Lucian</option>
                <option value="Salvadoran">Salvadoran</option>
                <option value="Samoan">Samoan</option>
                <option value="San Marinese">San Marinese</option>
                <option value="Sao Tomean">Sao Tomean</option>
                <option value="Saudi">Saudi</option>
                <option value="Scottish">Scottish</option>
                <option value="Senegalese">Senegalese</option>
                <option value="Serbian">Serbian</option>
                <option value="Seychellois">Seychellois</option>
                <option value="Sierra Leonean">Sierra Leonean</option>
                <option value="Singaporean">Singaporean</option>
                <option value="Slovakian">Slovakian</option>
                <option value="Slovenian">Slovenian</option>
                <option value="Solomon Islander">Solomon Islander</option>
                <option value="Somali">Somali</option>
                <option value="South African">South African</option>
                <option value="South Korean">South Korean</option>
                <option value="Spanish">Spanish</option>
                <option value="Sri Lankan">Sri Lankan</option>
                <option value="Sudanese">Sudanese</option>
                <option value="Surinamer">Surinamer</option>
                <option value="Swazi">Swazi</option>
                <option value="Swedish">Swedish</option>
                <option value="Swiss">Swiss</option>
                <option value="Syrian">Syrian</option>
                <option value="Taiwanese">Taiwanese</option>
                <option value="Tajik">Tajik</option>
                <option value="Tanzanian">Tanzanian</option>
                <option value="Thai">Thai</option>
                <option value="Togolese">Togolese</option>
                <option value="Tongan">Tongan</option>
                <option value="Trinidadian or Tobagonian">Trinidadian or Tobagonian</option>
                <option value="Tunisian">Tunisian</option>
                <option value="Turkish">Turkish</option>
                <option value="Tuvaluan">Tuvaluan</option>
                <option value="Ugandan">Ugandan</option>
                <option value="Ukrainian">Ukrainian</option>
                <option value="Uruguayan">Uruguayan</option>
                <option value="Uzbekistani">Uzbekistani</option>
                <option value="Venezuelan">Venezuelan</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Welsh">Welsh</option>
                <option value="Yemenite">Yemenite</option>
                <option value="Zambian">Zambian</option>
                <option value="Zimbabwean">Zimbabwean</option>
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300"
                value={formData.country}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  {detectingCountry ? '🌍 Detecting location...' : 'Select country'}
                </option>
                {smartCountries.slice(0, 5).map((country, index) => {
                  const cleanCountry = country.replace(/^[📍⭐]\s/, '');
                  return (
                    <option key={`smart-country-${index}`} value={cleanCountry}>
                      {country}
                    </option>
                  );
                })}
                {smartCountries.length > 0 && <option disabled>────────────</option>}
                <option value="Afghanistan">Afghanistan</option>
                <option value="Albania">Albania</option>
                <option value="Algeria">Algeria</option>
                <option value="Andorra">Andorra</option>
                <option value="Angola">Angola</option>
                <option value="Argentina">Argentina</option>
                <option value="Armenia">Armenia</option>
                <option value="Australia">Australia</option>
                <option value="Austria">Austria</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Bahamas">Bahamas</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Barbados">Barbados</option>
                <option value="Belarus">Belarus</option>
                <option value="Belgium">Belgium</option>
                <option value="Belize">Belize</option>
                <option value="Benin">Benin</option>
                <option value="Bhutan">Bhutan</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                <option value="Botswana">Botswana</option>
                <option value="Brazil">Brazil</option>
                <option value="Brunei">Brunei</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Burundi">Burundi</option>
                <option value="Cambodia">Cambodia</option>
                <option value="Cameroon">Cameroon</option>
                <option value="Canada">Canada</option>
                <option value="Cape Verde">Cape Verde</option>
                <option value="Central African Republic">Central African Republic</option>
                <option value="Chad">Chad</option>
                <option value="Chile">Chile</option>
                <option value="China">China</option>
                <option value="Colombia">Colombia</option>
                <option value="Comoros">Comoros</option>
                <option value="Congo">Congo</option>
                <option value="Costa Rica">Costa Rica</option>
                <option value="Croatia">Croatia</option>
                <option value="Cuba">Cuba</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Denmark">Denmark</option>
                <option value="Djibouti">Djibouti</option>
                <option value="Dominica">Dominica</option>
                <option value="Dominican Republic">Dominican Republic</option>
                <option value="Ecuador">Ecuador</option>
                <option value="Egypt">Egypt</option>
                <option value="El Salvador">El Salvador</option>
                <option value="Equatorial Guinea">Equatorial Guinea</option>
                <option value="Eritrea">Eritrea</option>
                <option value="Estonia">Estonia</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Fiji">Fiji</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Gabon">Gabon</option>
                <option value="Gambia">Gambia</option>
                <option value="Georgia">Georgia</option>
                <option value="Germany">Germany</option>
                <option value="Ghana">Ghana</option>
                <option value="Greece">Greece</option>
                <option value="Grenada">Grenada</option>
                <option value="Guatemala">Guatemala</option>
                <option value="Guinea">Guinea</option>
                <option value="Guinea-Bissau">Guinea-Bissau</option>
                <option value="Guyana">Guyana</option>
                <option value="Haiti">Haiti</option>
                <option value="Honduras">Honduras</option>
                <option value="Hungary">Hungary</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
                <option value="Indonesia">Indonesia</option>
                <option value="Iran">Iran</option>
                <option value="Iraq">Iraq</option>
                <option value="Ireland">Ireland</option>
                <option value="Israel">Israel</option>
                <option value="Italy">Italy</option>
                <option value="Jamaica">Jamaica</option>
                <option value="Japan">Japan</option>
                <option value="Jordan">Jordan</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Kenya">Kenya</option>
                <option value="Kiribati">Kiribati</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Laos">Laos</option>
                <option value="Latvia">Latvia</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Lesotho">Lesotho</option>
                <option value="Liberia">Liberia</option>
                <option value="Libya">Libya</option>
                <option value="Liechtenstein">Liechtenstein</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Madagascar">Madagascar</option>
                <option value="Malawi">Malawi</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Maldives">Maldives</option>
                <option value="Mali">Mali</option>
                <option value="Malta">Malta</option>
                <option value="Marshall Islands">Marshall Islands</option>
                <option value="Mauritania">Mauritania</option>
                <option value="Mauritius">Mauritius</option>
                <option value="Mexico">Mexico</option>
                <option value="Micronesia">Micronesia</option>
                <option value="Moldova">Moldova</option>
                <option value="Monaco">Monaco</option>
                <option value="Mongolia">Mongolia</option>
                <option value="Montenegro">Montenegro</option>
                <option value="Morocco">Morocco</option>
                <option value="Mozambique">Mozambique</option>
                <option value="Myanmar">Myanmar</option>
                <option value="Namibia">Namibia</option>
                <option value="Nauru">Nauru</option>
                <option value="Nepal">Nepal</option>
                <option value="Netherlands">Netherlands</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Nicaragua">Nicaragua</option>
                <option value="Niger">Niger</option>
                <option value="Nigeria">Nigeria</option>
                <option value="North Korea">North Korea</option>
                <option value="North Macedonia">North Macedonia</option>
                <option value="Norway">Norway</option>
                <option value="Oman">Oman</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Palau">Palau</option>
                <option value="Panama">Panama</option>
                <option value="Papua New Guinea">Papua New Guinea</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Peru">Peru</option>
                <option value="Philippines">Philippines</option>
                <option value="Poland">Poland</option>
                <option value="Portugal">Portugal</option>
                <option value="Qatar">Qatar</option>
                <option value="Romania">Romania</option>
                <option value="Russia">Russia</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                <option value="Saint Lucia">Saint Lucia</option>
                <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                <option value="Samoa">Samoa</option>
                <option value="San Marino">San Marino</option>
                <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Senegal">Senegal</option>
                <option value="Serbia">Serbia</option>
                <option value="Seychelles">Seychelles</option>
                <option value="Sierra Leone">Sierra Leone</option>
                <option value="Singapore">Singapore</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Solomon Islands">Solomon Islands</option>
                <option value="Somalia">Somalia</option>
                <option value="South Africa">South Africa</option>
                <option value="South Korea">South Korea</option>
                <option value="South Sudan">South Sudan</option>
                <option value="Spain">Spain</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Sudan">Sudan</option>
                <option value="Suriname">Suriname</option>
                <option value="Sweden">Sweden</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Syria">Syria</option>
                <option value="Taiwan">Taiwan</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Thailand">Thailand</option>
                <option value="Timor-Leste">Timor-Leste</option>
                <option value="Togo">Togo</option>
                <option value="Tonga">Tonga</option>
                <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                <option value="Tunisia">Tunisia</option>
                <option value="Turkey">Turkey</option>
                <option value="Turkmenistan">Turkmenistan</option>
                <option value="Tuvalu">Tuvalu</option>
                <option value="Uganda">Uganda</option>
                <option value="Ukraine">Ukraine</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Vanuatu">Vanuatu</option>
                <option value="Vatican City">Vatican City</option>
                <option value="Venezuela">Venezuela</option>
                <option value="Vietnam">Vietnam</option>
                <option value="Yemen">Yemen</option>
                <option value="Zambia">Zambia</option>
                <option value="Zimbabwe">Zimbabwe</option>
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                id="city"
                name="city"
                className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent transition-all duration-300"
                value={formData.city}
                onChange={handleInputChange}
                required
              >
                <option value="">
                  {detectingCity ? '🌍 Detecting location...' : 'Select city'}
                </option>
                {smartCities.slice(0, 5).map((city, index) => {
                  const cleanCity = city.replace(/^[📍⭐]\s/, '');
                  return (
                    <option key={`smart-city-${index}`} value={cleanCity}>
                      {city}
                    </option>
                  );
                })}
                {smartCities.length > 0 && <option disabled>────────────</option>}
                <option value="London">London</option>
                <option value="Manchester">Manchester</option>
                <option value="Birmingham">Birmingham</option>
                <option value="Liverpool">Liverpool</option>
                <option value="Leeds">Leeds</option>
                <option value="Glasgow">Glasgow</option>
                <option value="Edinburgh">Edinburgh</option>
                <option value="Bristol">Bristol</option>
                <option value="Cardiff">Cardiff</option>
                <option value="Belfast">Belfast</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
                <option value="Toronto">Toronto</option>
                <option value="Vancouver">Vancouver</option>
                <option value="Sydney">Sydney</option>
                <option value="Melbourne">Melbourne</option>
                <option value="Berlin">Berlin</option>
                <option value="Paris">Paris</option>
                <option value="Amsterdam">Amsterdam</option>
                <option value="Stockholm">Stockholm</option>
                <option value="Rome">Rome</option>
                <option value="Vienna">Vienna</option>
                <option value="Copenhagen">Copenhagen</option>
                <option value="Oslo">Oslo</option>
                <option value="Helsinki">Helsinki</option>
                <option value="Dublin">Dublin</option>
                <option value="Brussels">Brussels</option>
                <option value="Zurich">Zurich</option>
                <option value="Munich">Munich</option>
                <option value="Frankfurt">Frankfurt</option>
                <option value="Milan">Milan</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Lisbon">Lisbon</option>
                <option value="Prague">Prague</option>
                <option value="Budapest">Budapest</option>
                <option value="Warsaw">Warsaw</option>
                <option value="Moscow">Moscow</option>
                <option value="Istanbul">Istanbul</option>
                <option value="Athens">Athens</option>
                <option value="Cairo">Cairo</option>
                <option value="Dubai">Dubai</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Singapore">Singapore</option>
                <option value="Hong Kong">Hong Kong</option>
                <option value="Seoul">Seoul</option>
                <option value="Beijing">Beijing</option>
                <option value="Shanghai">Shanghai</option>
                <option value="Bangkok">Bangkok</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Manila">Manila</option>
                <option value="Kuala Lumpur">Kuala Lumpur</option>
                <option value="Brisbane">Brisbane</option>
                <option value="Perth">Perth</option>
                <option value="Auckland">Auckland</option>
                <option value="Montreal">Montreal</option>
                <option value="Calgary">Calgary</option>
                <option value="San Francisco">San Francisco</option>
                <option value="Boston">Boston</option>
                <option value="Washington DC">Washington DC</option>
                <option value="Miami">Miami</option>
                <option value="Seattle">Seattle</option>
                <option value="Atlanta">Atlanta</option>
                <option value="Dallas">Dallas</option>
                <option value="Houston">Houston</option>
                <option value="Phoenix">Phoenix</option>
                <option value="Philadelphia">Philadelphia</option>
                <option value="Mexico City">Mexico City</option>
                <option value="São Paulo">São Paulo</option>
                <option value="Rio de Janeiro">Rio de Janeiro</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="Santiago">Santiago</option>
                <option value="Lima">Lima</option>
                <option value="Bogotá">Bogotá</option>
                <option value="Cape Town">Cape Town</option>
                <option value="Johannesburg">Johannesburg</option>
                <option value="Lagos">Lagos</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Casablanca">Casablanca</option>
                <option value="Sheffield">Sheffield</option>
                <option value="Newcastle">Newcastle</option>
                <option value="Nottingham">Nottingham</option>
                <option value="Leicester">Leicester</option>
                <option value="Aberdeen">Aberdeen</option>
                <option value="Brighton">Brighton</option>
                <option value="Oxford">Oxford</option>
                <option value="Cambridge">Cambridge</option>
                <option value="Bath">Bath</option>
                <option value="York">York</option>
                <option value="Canterbury">Canterbury</option>
                <option value="Chester">Chester</option>
                <option value="Exeter">Exeter</option>
                <option value="Plymouth">Plymouth</option>
                <option value="Portsmouth">Portsmouth</option>
                <option value="Southampton">Southampton</option>
                <option value="Reading">Reading</option>
                <option value="Milton Keynes">Milton Keynes</option>
                <option value="Bournemouth">Bournemouth</option>
                <option value="Norwich">Norwich</option>
                <option value="Ipswich">Ipswich</option>
                <option value="St Albans">St Albans</option>
                <option value="Guildford">Guildford</option>
                <option value="Winchester">Winchester</option>
                <option value="Chichester">Chichester</option>
                <option value="Horsham">Horsham</option>
                <option value="Crawley">Crawley</option>
                <option value="Eastbourne">Eastbourne</option>
                <option value="Hastings">Hastings</option>
                <option value="Tunbridge Wells">Tunbridge Wells</option>
                <option value="Maidstone">Maidstone</option>
                <option value="Dover">Dover</option>
                <option value="Folkestone">Folkestone</option>
                <option value="Ashford">Ashford</option>
                <option value="Margate">Margate</option>
                <option value="Ramsgate">Ramsgate</option>
                <option value="Dartford">Dartford</option>
                <option value="Gravesend">Gravesend</option>
                <option value="Sevenoaks">Sevenoaks</option>
                <option value="Tonbridge">Tonbridge</option>
                <option value="Bromley">Bromley</option>
                <option value="Croydon">Croydon</option>
                <option value="Kingston upon Thames">Kingston upon Thames</option>
                <option value="Richmond upon Thames">Richmond upon Thames</option>
                <option value="Twickenham">Twickenham</option>
                <option value="Wimbledon">Wimbledon</option>
                <option value="Sutton">Sutton</option>
                <option value="Epsom">Epsom</option>
                <option value="Leatherhead">Leatherhead</option>
                <option value="Dorking">Dorking</option>
                <option value="Reigate">Reigate</option>
                <option value="Redhill">Redhill</option>
                <option value="Caterham">Caterham</option>
                <option value="East Grinstead">East Grinstead</option>
                <option value="Haywards Heath">Haywards Heath</option>
                <option value="Burgess Hill">Burgess Hill</option>
                <option value="Lewes">Lewes</option>
                <option value="Uckfield">Uckfield</option>
                <option value="Crowborough">Crowborough</option>
                <option value="Hailsham">Hailsham</option>
                <option value="Seaford">Seaford</option>
                <option value="Newhaven">Newhaven</option>
                <option value="Hove">Hove</option>
                <option value="Portslade">Portslade</option>
                <option value="Shoreham-by-Sea">Shoreham-by-Sea</option>
                <option value="Lancing">Lancing</option>
                <option value="Worthing">Worthing</option>
                <option value="Steyning">Steyning</option>
                <option value="Henfield">Henfield</option>
                <option value="Cuckfield">Cuckfield</option>
                <option value="Balcombe">Balcombe</option>
                <option value="Forest Row">Forest Row</option>
                <option value="Edenbridge">Edenbridge</option>
                <option value="Penshurst">Penshurst</option>
                <option value="Hildenborough">Hildenborough</option>
                <option value="Borough Green">Borough Green</option>
                <option value="West Kingsdown">West Kingsdown</option>
                <option value="Eynsford">Eynsford</option>
                <option value="Farningham">Farningham</option>
                <option value="Bexley">Bexley</option>
                <option value="Sidcup">Sidcup</option>
                <option value="Chislehurst">Chislehurst</option>
                <option value="Orpington">Orpington</option>
                <option value="Eltham">Eltham</option>
                <option value="Greenwich">Greenwich</option>
                <option value="Woolwich">Woolwich</option>
                <option value="Erith">Erith</option>
                <option value="Bexleyheath">Bexleyheath</option>
                <option value="Crayford">Crayford</option>
                <option value="Swanscombe">Swanscombe</option>
                <option value="Northfleet">Northfleet</option>
                <option value="Strood">Strood</option>
                <option value="Rochester">Rochester</option>
                <option value="Chatham">Chatham</option>
                <option value="Gillingham">Gillingham</option>
                <option value="Rainham">Rainham</option>
                <option value="Aylesford">Aylesford</option>
                <option value="West Malling">West Malling</option>
                <option value="East Malling">East Malling</option>
                <option value="Kings Hill">Kings Hill</option>
                <option value="Wateringbury">Wateringbury</option>
                <option value="Headcorn">Headcorn</option>
                <option value="Staplehurst">Staplehurst</option>
                <option value="Cranbrook">Cranbrook</option>
                <option value="Hawkhurst">Hawkhurst</option>
                <option value="Robertsbridge">Robertsbridge</option>
                <option value="Wadhurst">Wadhurst</option>
                <option value="Rusthall">Rusthall</option>
                <option value="Southborough">Southborough</option>
                <option value="Pembury">Pembury</option>
                <option value="Paddock Wood">Paddock Wood</option>
                <option value="Yalding">Yalding</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex space-x-2">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="
                    w-32 px-3 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    text-gray-900
                  "
                >
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+1">🇨🇦 +1</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+31">🇳🇱 +31</option>
                  <option value="+46">🇸🇪 +46</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+34">🇪🇸 +34</option>
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Phone number"
                  className="
                    flex-1 px-4 py-3 text-lg
                    border border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                    transition-all duration-300
                    placeholder-gray-400
                    text-gray-900
                  "
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="relative">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Start typing your address..."
                className="
                  w-full px-4 py-3 text-lg
                  border border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                  transition-all duration-300
                  placeholder-gray-400
                  text-gray-900
                "
                value={formData.address}
                onChange={handleInputChange}
                onFocus={() => formData.address.length > 1 && handleAddressSearch(formData.address)}
                onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                required
              />
              
              {/* Address Suggestions */}
              {showAddressSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="text-xs text-gray-600 font-medium">
                      📍 Suggestions for {formData.city || 'London'}, {formData.country || 'United Kingdom'}
                    </div>
                  </div>
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      onClick={() => selectAddressSuggestion(suggestion)}
                    >
                      <div className="text-sm font-medium text-gray-900">{suggestion.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                {getPostalCodeInfo(formData.country).label}
                {!getPostalCodeInfo(formData.country).required && (
                  <span className="text-gray-400 text-sm ml-1">(Optional)</span>
                )}
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                placeholder={getPostalCodeInfo(formData.country).placeholder}
                pattern={getPostalCodeInfo(formData.country).pattern}
                className={`
                  w-full px-4 py-3 text-lg
                  border border-gray-300 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-transparent
                  transition-all duration-300
                  placeholder-gray-400
                  ${getPostalCodeInfo(formData.country).required ? 'text-gray-900' : 'text-gray-400 bg-gray-100'}
                `}
                value={formData.postalCode}
                onChange={handleInputChange}
                required={getPostalCodeInfo(formData.country).required}
                disabled={!getPostalCodeInfo(formData.country).required}
                title={getPostalCodeInfo(formData.country).required ? 
                  `Please enter a valid ${getPostalCodeInfo(formData.country).label.toLowerCase()}` : 
                  'Postal code not required for this country'}
              />
              {getPostalCodeInfo(formData.country).required && (
                <p className="text-xs text-gray-500 mt-1">
                  Format: {getPostalCodeInfo(formData.country).placeholder}
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#1f2937] text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <Check className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="flex justify-center items-center">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-5xl font-bold text-[#1f2937] mr-1">Join</span>
              <img
                src="/logos/MSCandCoLogoV2.svg"
                alt="MSC & Co Logo"
                className="h-16 w-auto ml-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'inline';
                }}
              />
              <span className="text-5xl font-bold text-[#1f2937] ml-3 hidden">MSC & Co</span>
            </div>
            <p className="text-gray-600 text-xl mb-2">
              Create your music distribution account
            </p>
            <p className="text-gray-500 text-lg">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'bg-[#1f2937] border-[#1f2937] text-white' : 
                        isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        'bg-white border-gray-300 text-gray-400'}
                    `}>
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${isActive ? 'text-[#1f2937] font-medium' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl py-8 px-12 border border-gray-200 mx-auto max-w-none w-full" style={{maxWidth: '90vw'}}>
            {error && (
              <div className="mb-6">
                {error.includes('Please log in instead') ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-600">{error}</span>
                      </div>
                      <a
                        href="/login"
                        className="
                          w-[100px]
                          h-[40px]
                          bg-[#1f2937] 
                          text-white 
                          border 
                          border-[#1f2937] 
                          rounded-xl 
                          px-4 
                          font-bold 
                          text-sm
                          shadow-lg 
                          transition-all 
                          duration-300 
                          hover:bg-white 
                          hover:text-[#1f2937] 
                          hover:shadow-xl 
                          hover:-translate-y-1
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[#1f2937]
                          focus:ring-offset-2
                          flex items-center justify-center
                          whitespace-nowrap
                          shrink-0
                        "
                      >
                        Sign In
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-600">{error}</span>
                    </div>
                    {error.includes('verify your email') && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Didn't receive the email? Check your spam folder or resend it.
                        </span>
                        <button
                          onClick={handleResendEmail}
                          disabled={!canResend || isLoading}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                            canResend && !isLoading
                              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-1 inline" />
                              Sending...
                            </>
                          ) : canResend ? (
                            'Resend Email'
                          ) : (
                            `Resend in ${Math.floor(resendCountdown / 60)}:${(resendCountdown % 60).toString().padStart(2, '0')}`
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-green-600">{success}</span>
              </div>
            )}

            <div className="flex flex-col items-center">
              {renderStep()}
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-[#1f2937] hover:text-gray-800"
              >
                Sign in here
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegistration;
