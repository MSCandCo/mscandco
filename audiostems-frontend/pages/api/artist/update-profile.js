import { ManagementClient } from 'auth0';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MGMT_CLIENT_ID,
  clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
  scope: 'read:users update:users'
});

// Parse form data with file upload support
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes('image');
      }
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const { fields, files } = await parseForm(req);
    
    // Get user ID from the request (you might need to implement authentication)
    const user_id = fields.user_id;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Handle profile image upload
    let profileImageUrl = '';
    if (files.profileImage) {
      const file = files.profileImage[0];
      const fileName = `profile-${user_id}-${Date.now()}${path.extname(file.originalFilename)}`;
      const newPath = path.join(process.cwd(), 'public', 'uploads', fileName);
      
      // Move file to permanent location
      fs.renameSync(file.filepath, newPath);
      profileImageUrl = `/uploads/${fileName}`;
    }

    // Prepare user metadata update
    const userMetadata = {
      firstName: fields.firstName,
      lastName: fields.lastName,
      stageName: fields.stageName,
      artistType: fields.artistType,
      genre: fields.genre,
      contractStatus: fields.contractStatus,
      dateSigned: fields.dateSigned,
      socialMedia: JSON.parse(fields.socialMedia || '{}'),
      manager: fields.manager,
      furtherInformation: fields.furtherInformation,
      profileComplete: true
    };

    // Add profile image URL if uploaded
    if (profileImageUrl) {
      userMetadata.profileImage = profileImageUrl;
    }

    // Update Auth0 user
    const updatedUser = await management.users.update({ id: user_id }, {
      given_name: fields.firstName,
      family_name: fields.lastName,
      user_metadata: userMetadata
    });

    // Return updated profile data
    const profile = {
      firstName: updatedUser.given_name || '',
      lastName: updatedUser.family_name || '',
      stageName: updatedUser.user_metadata?.stageName || '',
      email: updatedUser.email || '',
      phone: updatedUser.phone_number || '',
      artistType: updatedUser.user_metadata?.artistType || '',
      genre: updatedUser.user_metadata?.genre || '',
      contractStatus: updatedUser.user_metadata?.contractStatus || '',
      dateSigned: updatedUser.user_metadata?.dateSigned || '',
      socialMedia: updatedUser.user_metadata?.socialMedia || {},
      manager: updatedUser.user_metadata?.manager || '',
      furtherInformation: updatedUser.user_metadata?.furtherInformation || '',
      profileImage: updatedUser.user_metadata?.profileImage || updatedUser.picture || '',
      profileComplete: updatedUser.user_metadata?.profileComplete || false
    };

    res.status(200).json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating artist profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
} 