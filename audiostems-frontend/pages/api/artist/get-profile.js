import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is an artist
    const userRole = session.user['https://mscandco.com/role'];
    if (userRole !== 'artist') {
      return res.status(403).json({ message: 'Access denied. Artists only.' });
    }

    // Mock comprehensive artist profile data
    // In production, this would come from your database
    const artistProfile = {
      // Personal Information
      firstName: session.user.name?.split(' ')[0] || '',
      lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
      artistName: session.user.name || '',
      artistType: '',
      email: session.user.email || '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
      country: '',
      city: '',
      address: '',
      postalCode: '',
      
      // Music Information
      primaryGenre: '',
      secondaryGenres: [],
      instruments: [],
      vocalType: '',
      yearsActive: '',
      recordLabel: '',
      publisher: '',
      
      // Social Media & Online Presence
      website: '',
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: '',
      tiktok: '',
      spotify: '',
      appleMusic: '',
      soundcloud: '',
      
      // Distribution Information
      isrcPrefix: '',
      upcPrefix: '',
      distributorId: '',
      royaltyRate: '',
      paymentMethod: '',
      taxId: '',
      bankInfo: {
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        swiftCode: ''
      },
      
      // Legal & Rights
      publishingRights: '',
      mechanicalRights: '',
      performanceRights: '',
      syncRights: '',
      
      // Bio & Media
      bio: '',
      shortBio: '',
      pressKit: '',
      profileImage: '',
      bannerImage: '',
      
      // Preferences
      distributionPreferences: {
        territories: [],
        platforms: [],
        releaseTypes: [],
        pricingTier: ''
      },
      
      // Metadata
      tags: [],
      influences: [],
      collaborations: [],
      
      // Verification
      isVerified: false,
      verificationDocuments: []
    };

    res.status(200).json(artistProfile);
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 