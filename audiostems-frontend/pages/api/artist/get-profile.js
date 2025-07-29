export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Return mock artist profile data
    const mockProfile = {
      id: 'artist_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
      nationality: 'American',
      location: 'Los Angeles, CA',
      artistType: 'Solo Artist',
      stageName: 'John Doe',
      bio: 'A passionate musician creating unique sounds.',
      socialMedia: {
        instagram: '@johndoe',
        facebook: 'johndoe.music',
        tiktok: '@johndoe',
        twitter: '@johndoe',
        youtube: 'johndoe',
        threads: '@johndoe'
      },
      musicPlatforms: {
        spotify: 'johndoe',
        appleMusic: 'johndoe',
        soundcloud: 'johndoe',
        deezer: 'johndoe',
        amazonMusic: 'johndoe',
        shazam: 'johndoe',
        pandora: 'johndoe',
        airplay: 'johndoe'
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-02-15T14:30:00Z'
    };

    res.status(200).json(mockProfile);
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    res.status(500).json({ 
      message: 'Error fetching artist profile',
      error: error.message 
    });
  }
} 