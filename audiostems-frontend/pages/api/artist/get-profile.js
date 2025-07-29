export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Simplified authentication check - return mock data for now
    // TODO: Implement proper Auth0 session validation
    
    const mockProfile = {
      firstName: '',
      lastName: '',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      artistType: 'Solo Artist',
      stageName: 'John Doe',
      bio: 'A passionate musician with over 10 years of experience in the industry.',
      genre: 'Pop',
      subGenre: 'Alternative Pop',
      royaltyRate: 15.5,
      isrcPrefix: 'USRC12345678',
      spotifyId: 'spotify:artist:123456789',
      appleMusicId: '123456789',
      soundcloudId: 'john-doe-music',
      deezerId: '123456789',
      amazonMusicId: 'B0ABC12345',
      shazamId: '123456789',
      pandoraId: '123456789',
      airplayId: '123456789',
      facebook: 'johndoemusic',
      tiktok: '@johndoe',
      threads: '@johndoe',
      twitter: '@johndoe',
      youtube: 'UC123456789',
      instagram: 'johndoemusic',
      website: 'https://johndoe.com',
      label: 'Independent',
      publisher: 'Self-Published',
      distributor: 'MSC & Co',
      territory: 'Worldwide',
      language: 'English',
      currency: 'USD',
      timezone: 'America/New_York',
      socialMediaLinks: {
        instagram: 'https://instagram.com/johndoemusic',
        facebook: 'https://facebook.com/johndoemusic',
        tiktok: 'https://tiktok.com/@johndoe',
        threads: 'https://threads.net/@johndoe',
        twitter: 'https://twitter.com/johndoe',
        youtube: 'https://youtube.com/@johndoe'
      },
      musicPlatformLinks: {
        spotify: 'https://open.spotify.com/artist/123456789',
        appleMusic: 'https://music.apple.com/artist/123456789',
        soundcloud: 'https://soundcloud.com/john-doe-music',
        deezer: 'https://deezer.com/artist/123456789',
        amazonMusic: 'https://music.amazon.com/artists/B0ABC12345',
        shazam: 'https://shazam.com/artist/123456789',
        pandora: 'https://pandora.com/artist/123456789',
        airplay: 'https://airplay.com/artist/123456789'
      },
      verificationStatus: 'verified',
      profileImage: '/api/placeholder/150/150',
      coverImage: '/api/placeholder/1200/400',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-07-28T22:00:00Z'
    };

    return res.status(200).json({
      success: true,
      profile: mockProfile
    });
  } catch (error) {
    console.error('Error in get-profile API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 