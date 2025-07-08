import { getSession } from '@auth0/nextjs-auth0';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the user session from Auth0
    const session = await getSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { user } = session;
    const registrationData = req.body;

    // Prepare user data for backend
    const userData = {
      auth0Id: user.sub,
      email: user.email,
      firstName: registrationData.firstName || user.given_name,
      lastName: registrationData.lastName || user.family_name,
      stageName: registrationData.stageName,
      phoneNumber: registrationData.phoneNumber,
      artistType: registrationData.artistType,
      genre: registrationData.genre,
      contractStatus: registrationData.contractStatus,
      dateSigned: registrationData.dateSigned,
      socialMedia: registrationData.socialMedia,
      managerInfo: registrationData.managerInfo,
      additionalInfo: registrationData.additionalInfo,
      profileImage: registrationData.profileImage,
      emailVerified: registrationData.emailVerified || false,
      mobileVerified: registrationData.mobileVerified || false,
      profileComplete: true,
      backupCodesGenerated: registrationData.backupCodesGenerated || false,
      backupCodes: registrationData.backupCodes || []
    };

    // Send data to your Strapi backend
    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI}/api/auth/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`
      },
      body: JSON.stringify(userData)
    });

    if (!strapiResponse.ok) {
      const errorData = await strapiResponse.json();
      throw new Error(errorData.message || 'Failed to complete registration');
    }

    const strapiData = await strapiResponse.json();

    // Update Auth0 user metadata with registration completion
    const auth0ManagementResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${user.sub}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`
      },
      body: JSON.stringify({
        user_metadata: {
          registrationComplete: true,
          strapiUserId: strapiData.user.id,
          profileComplete: true,
          artist_profile: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            stageName: userData.stageName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            artistType: userData.artistType,
            genre: userData.genre,
            contractStatus: userData.contractStatus,
            dateSigned: userData.dateSigned,
            socialMedia: userData.socialMedia,
            managerInfo: userData.managerInfo,
            additionalInfo: userData.additionalInfo
          }
        }
      })
    });

    if (!auth0ManagementResponse.ok) {
      console.error('Failed to update Auth0 user metadata');
    }

    return res.status(200).json({
      success: true,
      message: 'Registration completed successfully',
      user: strapiData.user
    });

  } catch (error) {
    console.error('Registration completion error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to complete registration'
    });
  }
} 