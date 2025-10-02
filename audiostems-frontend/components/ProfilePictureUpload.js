import { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { supabase } from '@/lib/supabase';
import { Upload, Camera, X, Check, RotateCw } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ProfilePictureUpload({ currentImage, onUploadSuccess, onUploadError }) {
  const [showCropModal, setShowCropModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [uploading, setUploading] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState('');
  
  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const hiddenAnchorRef = useRef(null);
  const blobUrlRef = useRef('');

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        onUploadError?.('File too large. Max 5MB.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        onUploadError?.('Invalid file type. Please use JPG, PNG, or WebP.');
        return;
      }

      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      setShowCameraModal(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      onUploadError?.('Camera access denied or not available. Please use "Choose File" instead.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
    setCapturedImage('');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCapturedImage(url);
      
      // Create a file reader to get data URL for cropper
      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result?.toString() || '');
        stopCamera();
        setShowCropModal(true);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.8);
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio for profile pictures
  }

  const getCroppedImg = useCallback((image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9,
      );
    });
  }, []);

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-profile-picture.jpg',
      );

      // Create FormData for upload
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onUploadError?.('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('file', croppedImageBlob, 'profile-picture.jpg');

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const publicUrl = result.url;

        // Update profile with the new picture URL
        const updateResponse = await fetch('/api/artist/profile', {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ profile_picture_url: publicUrl })
        });

        if (updateResponse.ok) {
          setShowCropModal(false);
          setImgSrc('');
          onUploadSuccess?.(publicUrl);
        } else {
          onUploadError?.('Failed to save profile picture');
        }
      } else {
        onUploadError?.('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Crop upload error:', error);
      onUploadError?.('Failed to process image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Profile Picture Display */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Profile"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Upload Options */}
          <div className="flex gap-2 justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
              id="profile-picture-upload"
            />
            <label
              htmlFor="profile-picture-upload"
              className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Upload className="w-4 h-4 mr-1" />
              Choose File
            </label>
            
            <button
              onClick={startCamera}
              className="cursor-pointer inline-flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Camera className="w-4 h-4 mr-1" />
              Take Photo
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">JPG, PNG, or WebP. Max 5MB.</p>
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Take Photo</h3>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {!capturedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white opacity-50 rounded-lg pointer-events-none"></div>
                </div>
                <button
                  onClick={capturePhoto}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📸 Capture Photo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
                <div className="flex gap-3">
                  <button
                    onClick={() => setCapturedImage('')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Retake
                  </button>
                  <button
                    onClick={() => {
                      stopCamera();
                      // Image is already in imgSrc from capturePhoto
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Use Photo
                  </button>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && imgSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Crop Profile Picture</h3>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setImgSrc('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Adjust the crop area to frame your face properly. The image will be circular.
              </p>
              
              <div className="max-h-96 overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1} // 1:1 ratio for circle
                  minWidth={100}
                  minHeight={100}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{ transform: 'scale(1) rotate(0deg)' }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setImgSrc('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  disabled={uploading || !completedCrop}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2 inline" />
                      Upload Profile Picture
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <a
        className="hidden"
        download
        ref={hiddenAnchorRef}
      >
        Hidden download
      </a>
    </>
  );
}
