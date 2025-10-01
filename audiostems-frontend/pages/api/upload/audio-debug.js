// Debug version of audio upload API without authentication
import { createClient } from '@supabase/supabase-js';
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

  console.log('🧪 DEBUG Audio upload API called (no auth)');

  // Skip authentication for debugging
  const user = { id: '0a060de5-1c94-4060-a1c2-860224fc348d' }; // Henry's ID for testing

  const form = formidable({ maxFileSize: 150 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(400).json({ error: 'File upload failed', details: err.message });
      }

      console.log('Starting debug audio upload for user:', user.id);
      console.log('Files received:', Object.keys(files));

      // Handle different formidable versions
      let file;
      if (files.file) {
        file = Array.isArray(files.file) ? files.file[0] : files.file;
      } else if (Object.keys(files).length > 0) {
        const firstKey = Object.keys(files)[0];
        file = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
      }

      if (!file) {
        console.error('No file found in request');
        return res.status(400).json({ error: 'No file provided' });
      }

      console.log('File object keys:', Object.keys(file));
      console.log('File details:', {
        name: file.originalFilename || file.name,
        size: file.size,
        type: file.mimetype || file.type,
        hasFilepath: !!file.filepath,
        hasPath: !!file.path
      });

      // Check filepath vs path (formidable v2 vs v3)
      const filePath = file.filepath || file.path;
      if (!filePath) {
        console.error('No file path found');
        return res.status(400).json({ error: 'Invalid file object - no path' });
      }

      console.log('File path:', filePath);

      // Skip validation for debugging
      console.log('Skipping file validation for debug...');

      let fileBuffer;
      try {
        fileBuffer = fs.readFileSync(filePath);
        console.log('✅ File read successfully, size:', fileBuffer.length, 'bytes');
      } catch (readError) {
        console.error('❌ Error reading file:', readError);
        return res.status(500).json({ error: 'Failed to read uploaded file', details: readError.message });
      }
      
      const timestamp = Date.now();
      const originalFilename = file.originalFilename || file.name || 'debug-file';
      const fileName = `${user.id}/${timestamp}-${originalFilename}`;

      console.log('Attempting Supabase upload with filename:', fileName);

      const { data, error: uploadError } = await supabase.storage
        .from('release-audio')
        .upload(fileName, fileBuffer, {
          contentType: file.mimetype || file.type || 'audio/wav',
          cacheControl: '31536000',
          upsert: false
        });

      console.log('Supabase upload response:', { data, error: uploadError });

      if (uploadError) {
        console.error('Full upload error:', JSON.stringify(uploadError, null, 2));
        return res.status(500).json({ error: 'Supabase upload failed', details: uploadError });
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
      }

      console.log('✅ Upload completed successfully, returning URL:', publicUrl);
      return res.json({ 
        url: publicUrl,
        filename: fileName,
        size: file.size,
        debug: true
      });
      
    } catch (unexpectedError) {
      console.error('❌ Unexpected error in debug audio upload:', unexpectedError);
      return res.status(500).json({ 
        error: 'Unexpected server error', 
        details: unexpectedError.message,
        stack: unexpectedError.stack
      });
    }
  });
}
