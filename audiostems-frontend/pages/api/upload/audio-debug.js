// Debug version of audio upload API with authentication
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

  console.log('🧪 DEBUG Audio upload API called');

  // Write to a debug log file for easier viewing
  const debugLog = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    try {
      fs.appendFileSync('debug-upload.log', logMessage + '\n');
    } catch (e) {
      // Ignore file write errors
    }
  };

  debugLog('🧪 DEBUG Audio upload API called with authenticated user');

  const user = req.user;

  const form = formidable({ maxFileSize: 150 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        debugLog('❌ Form parse error: ' + err.message);
        return res.status(400).json({ error: 'File upload failed', details: err.message });
      }

      debugLog('Starting debug audio upload for user: ' + user.id);
      debugLog('Files received: ' + JSON.stringify(Object.keys(files)));

      // Handle different formidable versions
      let file;
      if (files.file) {
        file = Array.isArray(files.file) ? files.file[0] : files.file;
      } else if (Object.keys(files).length > 0) {
        const firstKey = Object.keys(files)[0];
        file = Array.isArray(files[firstKey]) ? files[firstKey][0] : files[firstKey];
      }

      if (!file) {
        debugLog('❌ No file found in request');
        return res.status(400).json({ error: 'No file provided' });
      }

      debugLog('File object keys: ' + JSON.stringify(Object.keys(file)));
      debugLog('File details: ' + JSON.stringify({
        name: file.originalFilename || file.name,
        size: file.size,
        type: file.mimetype || file.type,
        hasFilepath: !!file.filepath,
        hasPath: !!file.path
      }));

      // Check filepath vs path (formidable v2 vs v3)
      const filePath = file.filepath || file.path;
      if (!filePath) {
        debugLog('❌ No file path found');
        return res.status(400).json({ error: 'Invalid file object - no path' });
      }

      debugLog('File path: ' + filePath);

      // Skip validation for debugging
      debugLog('Skipping file validation for debug...');

      let fileBuffer;
      try {
        fileBuffer = fs.readFileSync(filePath);
        debugLog('✅ File read successfully, size: ' + fileBuffer.length + ' bytes');
      } catch (readError) {
        debugLog('❌ Error reading file: ' + readError.message);
        return res.status(500).json({ error: 'Failed to read uploaded file', details: readError.message });
      }
      
      const timestamp = Date.now();
      const originalFilename = file.originalFilename || file.name || 'debug-file';
      const fileName = `${user.id}/${timestamp}-${originalFilename}`;

      // Normalize MIME type for Supabase compatibility
      let contentType = file.mimetype || file.type || 'audio/wav';
      
      // Map common non-standard MIME types to standard ones
      const mimeTypeMap = {
        'audio/x-wav': 'audio/wav',
        'audio/x-mp3': 'audio/mpeg',
        'audio/x-mpeg': 'audio/mpeg',
        'audio/x-flac': 'audio/flac',
        'audio/x-m4a': 'audio/mp4'
      };
      
      if (mimeTypeMap[contentType]) {
        contentType = mimeTypeMap[contentType];
      }
      
      debugLog('Attempting Supabase upload with filename: ' + fileName);
      debugLog('Original MIME type: ' + (file.mimetype || file.type));
      debugLog('Normalized content type: ' + contentType);

      const { data, error: uploadError } = await supabase.storage
        .from('release-audio')
        .upload(fileName, fileBuffer, {
          contentType: contentType,
          cacheControl: '31536000',
          upsert: false
        });

      debugLog('Supabase upload response: ' + JSON.stringify({ data, error: uploadError }));

      if (uploadError) {
        debugLog('❌ Full upload error: ' + JSON.stringify(uploadError, null, 2));
        return res.status(500).json({ error: 'Supabase upload failed', details: uploadError });
      }

      const { data: { publicUrl } } = supabase.storage
        .from('release-audio')
        .getPublicUrl(fileName);

      // Clean up temp file
      try {
        fs.unlinkSync(filePath);
        debugLog('✅ Temp file cleaned up');
      } catch (cleanupError) {
        debugLog('⚠️ Failed to cleanup temp file: ' + cleanupError.message);
      }

      debugLog('✅ Upload completed successfully, returning URL: ' + publicUrl);
      return res.json({ 
        url: publicUrl,
        filename: fileName,
        size: file.size,
        debug: true
      });
      
    } catch (unexpectedError) {
      debugLog('❌ Unexpected error in debug audio upload: ' + unexpectedError.message);
      debugLog('Stack trace: ' + unexpectedError.stack);
      return res.status(500).json({ 
        error: 'Unexpected server error', 
        details: unexpectedError.message,
        stack: unexpectedError.stack
      });
    }
  });
}

export default requireAuth()(handler);
