// Smart location detection and dropdown prioritization
export class LocationIntelligence {
  constructor() {
    this.userLocation = null;
    this.detectedCountry = null;
    this.detectedCity = null;
  }

  // Detect user location using multiple methods
  async detectLocation() {
    try {
      // Method 1: Geolocation API
      const position = await this.getCurrentPosition();
      if (position) {
        this.userLocation = position;
        await this.reverseGeocode(position);
      }
    } catch (error) {
      console.log('Geolocation failed, trying IP-based detection');
    }

    try {
      // Method 2: IP-based location (fallback)
      await this.detectLocationByIP();
    } catch (error) {
      console.log('IP detection failed, using browser locale');
    }

    // Method 3: Browser locale (final fallback)
    this.detectLocationByLocale();

    return {
      country: this.detectedCountry,
      city: this.detectedCity,
      coords: this.userLocation
    };
  }

  // Method 1: HTML5 Geolocation
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }),
        error => reject(error),
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  // Reverse geocoding using a free service
  async reverseGeocode(position) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.lat}&longitude=${position.lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      this.detectedCountry = data.countryName;
      this.detectedCity = data.city || data.locality;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  }

  // Method 2: IP-based detection
  async detectLocationByIP() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      this.detectedCountry = data.country_name;
      this.detectedCity = data.city;
    } catch (error) {
      console.error('IP detection failed:', error);
    }
  }

  // Method 3: Browser locale fallback
  detectLocationByLocale() {
    if (!this.detectedCountry) {
      const locale = navigator.language || navigator.languages[0];
      const countryCode = locale.split('-')[1];
      
      // Map common country codes to names
      const countryMap = {
        'US': 'United States',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'NL': 'Netherlands',
        'BE': 'Belgium',
        'CH': 'Switzerland',
        'AT': 'Austria',
        'IE': 'Ireland',
        'NO': 'Norway',
        'SE': 'Sweden',
        'DK': 'Denmark',
        'FI': 'Finland'
      };
      
      this.detectedCountry = countryMap[countryCode] || 'United Kingdom'; // Default
    }
  }

  // Smart sorting for dropdowns
  prioritizeOptions(options, detectedValue, type = 'country') {
    if (!detectedValue) return options;

    const prioritized = [...options];
    const detected = prioritized.find(option => 
      option.toLowerCase().includes(detectedValue.toLowerCase()) ||
      detectedValue.toLowerCase().includes(option.toLowerCase())
    );

    if (detected) {
      // Remove from current position
      const index = prioritized.indexOf(detected);
      prioritized.splice(index, 1);
      
      // Add to top with indicator
      prioritized.unshift(`📍 ${detected}`);
    }

    // Add common/relevant options based on type
    const commonOptions = this.getCommonOptions(type, detectedValue);
    commonOptions.forEach(option => {
      if (!prioritized.some(p => p.includes(option))) {
        const index = prioritized.findIndex(p => p === option);
        if (index > -1) {
          prioritized.splice(index, 1);
          prioritized.unshift(`⭐ ${option}`);
        }
      }
    });

    return prioritized;
  }

  // Get common options based on detected location
  getCommonOptions(type, detectedValue) {
    const isUK = detectedValue?.toLowerCase().includes('kingdom') || 
                detectedValue?.toLowerCase().includes('britain');
    const isUS = detectedValue?.toLowerCase().includes('states') || 
                detectedValue?.toLowerCase().includes('america');

    switch (type) {
      case 'country':
        if (isUK) return ['United States', 'Canada', 'Australia', 'Ireland'];
        if (isUS) return ['United Kingdom', 'Canada', 'Australia', 'Germany'];
        return ['United Kingdom', 'United States', 'Canada', 'Australia'];

      case 'city':
        if (isUK) return ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Edinburgh'];
        if (isUS) return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
        return ['London', 'New York', 'Paris', 'Berlin', 'Toronto'];

      case 'nationality':
        if (isUK) return ['American', 'Canadian', 'Australian', 'Irish'];
        if (isUS) return ['British', 'Canadian', 'Australian', 'German'];
        return ['British', 'American', 'Canadian', 'Australian'];

      default:
        return [];
    }
  }

  // Cookie-based persistence
  saveLocationToStorage(location) {
    try {
      localStorage.setItem('userLocation', JSON.stringify({
        country: location.country,
        city: location.city,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  loadLocationFromStorage() {
    try {
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        const location = JSON.parse(stored);
        // Use cached location if less than 7 days old
        if (Date.now() - location.timestamp < 7 * 24 * 60 * 60 * 1000) {
          this.detectedCountry = location.country;
          this.detectedCity = location.city;
          return location;
        }
      }
    } catch (error) {
      console.error('Failed to load location:', error);
    }
    return null;
  }
}

// Smart dropdown hook for React components
export const useSmartDropdown = (options, type = 'country') => {
  const [prioritizedOptions, setPrioritizedOptions] = useState(options);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const detectAndPrioritize = async () => {
      const intelligence = new LocationIntelligence();
      
      // Try to load from storage first
      const cached = intelligence.loadLocationFromStorage();
      if (cached) {
        const prioritized = intelligence.prioritizeOptions(options, cached.country, type);
        setPrioritizedOptions(prioritized);
        setIsDetecting(false);
        return;
      }

      // Detect fresh location
      const location = await intelligence.detectLocation();
      const detectedValue = type === 'city' ? location.city : location.country;
      
      if (detectedValue) {
        intelligence.saveLocationToStorage(location);
        const prioritized = intelligence.prioritizeOptions(options, detectedValue, type);
        setPrioritizedOptions(prioritized);
      }
      
      setIsDetecting(false);
    };

    detectAndPrioritize();
  }, [options, type]);

  return { prioritizedOptions, isDetecting };
};
