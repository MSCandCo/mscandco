// Comprehensive test to verify ALL profile fields save and load correctly
const testData = {
  // Personal Information
  firstName: "TEST_FIRST",
  lastName: "TEST_LAST", 
  dateOfBirth: "1990-01-01",
  nationality: "TEST_NATIONALITY",
  country: "TEST_COUNTRY",
  city: "TEST_CITY",
  address: "TEST_ADDRESS",
  postalCode: "TEST_POSTAL",
  
  // Contact
  phone: "TEST_PHONE",
  countryCode: "+99",
  
  // Artist Info
  artistName: "TEST_ARTIST",
  artistType: "Solo Artist",
  
  // Music Info
  primaryGenre: "TEST_PRIMARY_GENRE",
  secondaryGenre: "TEST_SECONDARY_GENRE", 
  secondaryGenres: ["Genre1", "Genre2"],
  instruments: ["Piano", "Guitar"],
  vocalType: "TEST_VOCAL",
  yearsActive: "TEST_YEARS",
  
  // Business
  recordLabel: "TEST_LABEL",
  publisher: "TEST_PUBLISHER", 
  isrcPrefix: "TEST_ISRC",
  
  // Social Media
  website: "TEST_WEBSITE",
  instagram: "TEST_INSTA",
  facebook: "TEST_FB",
  twitter: "TEST_TWITTER",
  youtube: "TEST_YT",
  tiktok: "TEST_TIKTOK",
  threads: "TEST_THREADS",
  appleMusic: "TEST_APPLE",
  soundcloud: "TEST_SOUND",
  
  // Content
  bio: "TEST_BIO",
  shortBio: "TEST_SHORT_BIO",
  
  // Status
  isBasicInfoSet: true,
  profileCompleted: true
};

console.log('Testing ALL profile fields...');
console.log('Test data:', JSON.stringify(testData, null, 2));

// This will be run manually to test all fields
