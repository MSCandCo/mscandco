import { createClient } from '@supabase/supabase-js';
import { getUserFromRequest } from '@/lib/auth';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  console.log('🔐 Audio upload API called, checking authentication...');
  const { user, error: authError } = await getUserFromRequest(req);
  
  if (authError || !user) {
    console.error('❌ Authentication failed:', authError);
    return res.status(401).json({ error: 'Not authenticated', details: authError });
  }
  
  console.log('✅ User authenticated:', user.id);

  const form = formidable({ maxFileSize: 150 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      console.log('Starting audio upload for user:', user.id);
      console.log('Files received:', files); // Debug log

    // Handle different formidable versions
    let file;
    if (files.file) {
      file = Array.isArray(files.file) ? files.file[0] : files.file;
    } else if (Object.keys(files).length > 0) {
      // Get first file if 'file' key doesn't exist
      const firstKey = Object.keys(files)[0];
      file = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
    }

    if (!file) {
      console.error('No file found in request');
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('File object:', file); // Debug log
    console.log('File details:', {
      name: file.originalFilename || file.name,
      size: file.size,
      type: file.mimetype || file.type
    });

    // Check filepath vs path (formidable v2 vs v3)
    const filePath = file.filepath || file.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Invalid file object' });
    }

    // Validate audio format including ALAC
    const validMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      'audio/x-m4a',
      'audio/mp4',
      'audio/aac'
    ];
    
    const originalFilename = file.originalFilename || file.name || 'unknown';
    const fileExt = originalFilename.split('.').pop().toLowerCase();
    const validExtensions = ['mp3', 'wav', 'flac', 'm4a', 'mp4', 'aac'];

    if (!validMimeTypes.includes(file.mimetype || file.type) && !validExtensions.includes(fileExt)) {
      return res.status(400).json({ 
        error: 'Invalid audio format. Supported: MP3, WAV, FLAC, ALAC (M4A)' 
      });
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
    const fileName = `${user.id}/${timestamp}-${originalFilename}`;

    const { data, error: uploadError } = await supabase.storage
      .from('release-audio')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype || file.type,
        cacheControl: '31536000',
        upsert: false
      });

    console.log('Supabase upload response:', { data, error: uploadError });

    if (uploadError) {
      console.error('Full upload error:', JSON.stringify(uploadError, null, 2));
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('release-audio')
      .getPublicUrl(fileName);

    // Clean up temp file
    try {
      fs.unlinkSync(filePath);
      console.log('✅ Temp file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
      // Don't fail the request for cleanup issues
    }

    console.log('✅ Upload completed successfully, returning URL:', publicUrl);
    return res.json({ 
      url: publicUrl,
      filename: fileName,
      size: file.size
    });
    
    } catch (unexpectedError) {
      console.error('❌ Unexpected error in audio upload:', unexpectedError);
      return res.status(500).json({ 
        error: 'Unexpected server error', 
        details: unexpectedError.message 
      });
    }
  });
}
