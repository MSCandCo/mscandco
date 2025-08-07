// Import from Universal Mock Database
import { getUserById } from '../../../lib/emptyData';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user ID from query params or default to YHWH MSC artist
    const userId = req.query.userId || 'artist_yhwh_msc';
    
    // Get user data from universal database
    const user = getUserById(userId);
    
    if (!user || user.role !== 'artist') {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Transform universal data to profile format
    const profile = {
      id: user.id,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: user.phone,
      dateOfBirth: '1990-01-01', // Default - would come from expanded profile
      nationality: user.address?.includes('UK') ? 'British' : 
                   user.address?.includes('US') ? 'American' :
                   user.address?.includes('KR') ? 'Korean' :
                   user.address?.includes('CA') ? 'Canadian' : 'International',
      location: user.address,
      artistType: 'Solo Artist', // Default - would come from expanded profile
      stageName: user.displayName || user.name,
      bio: user.bio || 'Professional recording artist.',
      socialMedia: user.socialMedia || {
        instagram: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        facebook: `${user.name.toLowerCase().replace(/\s+/g, '')}.music`,
        tiktok: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        twitter: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        youtube: user.name.replace(/\s+/g, ''),
        threads: `@${user.name.toLowerCase().replace(/\s+/g, '')}`
      },
      musicPlatforms: {
        spotify: user.socialMedia?.spotify || user.name.toLowerCase().replace(/\s+/g, ''),
        appleMusic: user.name.toLowerCase().replace(/\s+/g, ''),
        soundcloud: user.name.toLowerCase().replace(/\s+/g, ''),
        deezer: user.name.toLowerCase().replace(/\s+/g, ''),
        amazonMusic: user.name.toLowerCase().replace(/\s+/g, ''),
        shazam: user.name.toLowerCase().replace(/\s+/g, ''),
        pandora: user.name.toLowerCase().replace(/\s+/g, ''),
        airplay: user.name.toLowerCase().replace(/\s+/g, '')
      },
      // Additional fields from universal database
      status: user.status,
      approvalStatus: user.approvalStatus,
      label: user.brand,
      labelId: user.labelId,
      primaryGenre: user.primaryGenre,
      genres: user.genres,
      totalReleases: user.totalReleases,
      totalStreams: user.totalStreams,
      totalRevenue: user.totalRevenue,
      topTrack: user.topTrack,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.joinDate,
      updatedAt: user.lastLogin
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching artist profile:', error);
    res.status(500).json({ 
      message: 'Error fetching artist profile',
      error: error.message 
    });
  }
} 