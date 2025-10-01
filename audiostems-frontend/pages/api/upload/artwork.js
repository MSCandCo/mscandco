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

  const { user, error: authError } = await getUserFromRequest(req);
  if (authError || !user) return res.status(401).json({ error: 'Not authenticated' });

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(400).json({ error: 'File upload failed' });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });

    const fileBuffer = fs.readFileSync(file.filepath);
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}-${file.originalFilename}`;

    const { data, error: uploadError } = await supabase.storage
      .from('release-artwork')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: '31536000',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('release-artwork')
      .getPublicUrl(fileName);

    fs.unlinkSync(file.filepath);

    return res.json({ 
      url: publicUrl,
      filename: fileName,
      size: file.size
    });
  });
}
