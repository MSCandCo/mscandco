import { supabase } from '@/lib/supabase';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);

    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const uploadType = fields.uploadType?.[0]; // 'audio' or 'artwork'
    const releaseId = fields.releaseId?.[0];
    const songId = fields.songId?.[0];

    if (!uploadType || !releaseId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the uploaded file
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/flac'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (uploadType === 'audio' && !allowedAudioTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid audio file type. Allowed: MP3, WAV, FLAC' 
      });
    }

    if (uploadType === 'artwork' && !allowedImageTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid image file type. Allowed: JPEG, PNG' 
      });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalFilename || file.newFilename);
    const timestamp = Date.now();
    const fileName = `${user.id}/${releaseId}/${uploadType}_${timestamp}${fileExtension}`;

    // Read file data
    const fileData = fs.readFileSync(file.filepath);

    // Upload to Supabase Storage
    const bucket = uploadType === 'audio' ? 'music-files' : 'artwork';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileData, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: 'File upload failed' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Update database record
    if (uploadType === 'audio' && songId) {
      // Update song record with file URL
      const { error: songUpdateError } = await supabase
        .from('songs')
        .update({ 
          file_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', songId);

      if (songUpdateError) {
        console.error('Error updating song:', songUpdateError);
        return res.status(500).json({ error: 'Failed to update song record' });
      }
    } else if (uploadType === 'artwork') {
      // Update project/release with artwork URL
      const { error: projectUpdateError } = await supabase
        .from('projects')
        .update({ 
          artwork_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseId);

      if (projectUpdateError) {
        console.error('Error updating project artwork:', projectUpdateError);
        return res.status(500).json({ error: 'Failed to update artwork record' });
      }
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      fileUrl: publicUrl,
      fileName: fileName,
      uploadType: uploadType,
      message: `${uploadType === 'audio' ? 'Audio' : 'Artwork'} uploaded successfully!`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
