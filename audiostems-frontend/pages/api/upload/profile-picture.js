import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import jwt from 'jsonwebtoken';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No authorization header');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    let user;
    
    try {
      const decoded = jwt.decode(token);
      user = { id: decoded?.sub };
      console.log('✅ User authenticated:', user.id);
    } catch (err) {
      console.error('❌ Token decode error:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user?.id) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          console.error('Form parse error:', err);
          return res.status(400).json({ error: 'File upload failed' });
        }

        console.log('🖼️ Starting profile picture upload for user:', user.id);
        console.log('📁 Files received:', files);

        // Handle both array and single file formats
        let file;
        if (files.file) {
          file = Array.isArray(files.file) ? files.file[0] : files.file;
        } else if (Object.keys(files).length > 0) {
          const firstKey = Object.keys(files)[0];
          file = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
        }

        if (!file) {
          console.error('❌ No file found in request');
          return res.status(400).json({ error: 'No file provided' });
        }

        console.log('📊 File details:', {
          name: file.originalFilename || file.name,
          size: file.size,
          type: file.mimetype || file.type
        });

        // Validate file type
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validMimeTypes.includes(file.mimetype || file.type)) {
          return res.status(400).json({
            error: 'Invalid image format. Supported: JPG, PNG, WebP'
          });
        }

        const filePath = file.filepath || file.path;
        if (!filePath) {
          return res.status(400).json({ error: 'Invalid file object' });
        }

        let fileBuffer;
        try {
          fileBuffer = fs.readFileSync(filePath);
          console.log('✅ File read successfully, size:', fileBuffer.length, 'bytes');
        } catch (readError) {
          console.error('❌ Error reading file:', readError);
          return res.status(500).json({ error: 'Failed to read uploaded file' });
        }

        const timestamp = Date.now();
        const originalFilename = file.originalFilename || file.name || 'profile-picture';
        const fileExt = originalFilename.split('.').pop().toLowerCase();
        const fileName = `${user.id}/profile-picture-${timestamp}.${fileExt}`;

        console.log('📤 Uploading to profile-pictures bucket:', fileName);

        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, fileBuffer, {
            contentType: file.mimetype || file.type,
            cacheControl: '31536000',
            upsert: true
          });

        console.log('📊 Supabase upload response:', { data, error: uploadError });

        if (uploadError) {
          console.error('❌ Upload error:', JSON.stringify(uploadError, null, 2));
          return res.status(500).json({ error: uploadError.message });
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(fileName);

        console.log('🔗 Generated public URL:', publicUrl);

        // Clean up temp file
        try {
          fs.unlinkSync(filePath);
          console.log('✅ Temp file cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
        }

        console.log('✅ Profile picture upload completed successfully');
        return res.json({
          url: publicUrl,
          filename: fileName,
          size: file.size
        });

      } catch (unexpectedError) {
        console.error('❌ Unexpected error in profile picture upload:', unexpectedError);
        return res.status(500).json({
          error: 'Unexpected server error',
          details: unexpectedError.message
        });
      }
    });

  } catch (error) {
    console.error('❌ Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
