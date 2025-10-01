import { useState } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { supabase } from '@/lib/supabase';
import { Upload, Image, Music, CheckCircle, XCircle } from 'lucide-react';

export default function FileUploader({ type, onUpload, currentFile, required = false, restrictToALAC = false }) {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadingFileName, setUploadingFileName] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type including ALAC restriction
    let validTypes, validExtensions;
    
    if (type === 'artwork') {
      validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    } else if (restrictToALAC) {
      validTypes = ['audio/x-m4a', 'audio/mp4'];
      validExtensions = ['m4a'];
    } else {
      validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a', 'audio/mp4', 'audio/aac'];
      validExtensions = ['mp3', 'wav', 'flac', 'm4a', 'mp4'];
    }
    
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      const errorMsg = type === 'artwork' 
        ? 'Invalid image format. Accepted: JPG, PNG, WebP'
        : restrictToALAC
          ? 'Only Apple Lossless (M4A/ALAC) files accepted'
          : 'Invalid audio format. Accepted: MP3, WAV, FLAC, ALAC (M4A)';
      
      setError(errorMsg);
      return;
    }

    const maxSize = type === 'artwork' ? 10 * 1024 * 1024 : 150 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);
    setUploadingFileName(file.name);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUpload(response.url, response.filename);
          setUploading(false);
          setProgress(0);
          setError(null);
          setUploadingFileName('');
        } else {
          setError('Upload failed');
          setUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed');
        setUploading(false);
        setUploadingFileName('');
      });

      xhr.open('POST', `/api/upload/${type}`);
      if (session?.access_token) {
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
      }
      xhr.send(formData);

    } catch (err) {
      setError(err.message);
      setUploading(false);
      setUploadingFileName('');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <div className="text-center">
          {type === 'artwork' ? (
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          ) : (
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          )}
          
          <input
            type="file"
            accept={
              type === 'artwork' 
                ? 'image/*,.jpg,.jpeg,.png,.webp' 
                : restrictToALAC 
                  ? 'audio/x-m4a,.m4a'
                  : 'audio/mpeg,audio/wav,audio/flac,audio/x-m4a,.m4a,.mp3,.wav,.flac'
            }
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${type}`}
          />
          
          <label
            htmlFor={`file-upload-${type}`}
            className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
              uploading 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : `Upload ${type === 'artwork' ? 'Artwork' : 'Audio'}`}
          </label>
          
          <p className="text-sm text-gray-500 mt-2">
            {type === 'artwork' 
              ? 'JPG, PNG, WebP up to 10MB. Min 3000x3000px recommended.'
              : restrictToALAC
                ? 'Apple Lossless (M4A) format only. Up to 150MB.'
                : 'MP3, WAV, FLAC, ALAC up to 150MB. WAV recommended for distribution.'
            }
          </p>
          
          {required && (
            <p className="text-xs text-red-600 mt-1">* Required field</p>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading {uploadingFileName || 'file'}...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {currentFile && !uploading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">File uploaded successfully</p>
              <p className="text-xs text-green-600 truncate">
                {currentFile.split('/').pop()}
              </p>
            </div>
          </div>
          
          {type === 'artwork' && currentFile && (
            <div className="mt-3">
              <img 
                src={currentFile} 
                alt="Release artwork preview" 
                className="w-32 h-32 object-cover rounded border shadow-sm"
              />
            </div>
          )}

          {type === 'audio' && currentFile && (
            <div className="mt-3">
              <audio controls className="w-full">
                <source src={currentFile} />
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
