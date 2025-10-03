import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/rbac/middleware';
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

// req.user and req.userRole are automatically attached by middleware
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = req.user;

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(400).json({ error: 'File upload failed' });
    }

    console.log('Starting artwork upload for user:', user.id);
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

    const fileBuffer = fs.readFileSync(filePath);
    const timestamp = Date.now();
    const originalFilename = file.originalFilename || file.name || 'unknown';
    const fileName = `${user.id}/${timestamp}-${originalFilename}`;

    const { data, error: uploadError } = await supabase.storage
      .from('release-artwork')
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
      .from('release-artwork')
      .getPublicUrl(fileName);

    fs.unlinkSync(filePath);

    return res.json({ 
      url: publicUrl,
      filename: fileName,
      size: file.size
    });
  });
}

export default requireAuth()(handler);
