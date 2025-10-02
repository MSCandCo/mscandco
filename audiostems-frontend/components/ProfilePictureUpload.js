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
        width: 70, // Good size for circular crop - not too big, not too small
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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
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
    
    // Set reasonable default zoom (not too zoomed out, not too zoomed in)
    setZoom(0.8);
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio for profile pictures
  }

  const getCroppedImg = useCallback((image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Set canvas size to desired output size (square for profile picture)
    const outputSize = 400; // 400x400 output
    canvas.width = outputSize;
    canvas.height = outputSize;

    ctx.imageSmoothingQuality = 'high';

    // Calculate the actual crop coordinates considering zoom and rotation
    const scaleX = image.naturalWidth / (image.width * zoom);
    const scaleY = image.naturalHeight / (image.height * zoom);

    // Save context for rotation
    ctx.save();
    
    // Move to center of canvas for rotation
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw the cropped portion
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      -outputSize / 2,
      -outputSize / 2,
      outputSize,
      outputSize,
    );

    ctx.restore();

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
  }, [zoom, rotation]);

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
              
              {/* Zoom and Rotation Controls */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zoom: {Math.round(zoom * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 0.5) / 2.5) * 100}%, #e5e7eb ${((zoom - 0.5) / 2.5) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Rotation:</label>
                  <button
                    onClick={() => setRotation(rotation - 90)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    type="button"
                  >
                    <RotateCw className="w-4 h-4 transform rotate-180" />
                  </button>
                  <span className="text-sm text-gray-600">{rotation}°</span>
                  <button
                    onClick={() => setRotation(rotation + 90)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    type="button"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1} // 1:1 ratio for circle
                  minWidth={50}
                  minHeight={50}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{ 
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      display: 'block',
                      maxWidth: '100%',
                      height: 'auto'
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
              
              {/* Add CSS for slider handle */}
              <style jsx>{`
                .slider::-webkit-slider-thumb {
                  appearance: none;
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .slider::-moz-range-thumb {
                  height: 20px;
                  width: 20px;
                  border-radius: 50%;
                  background: #3b82f6;
                  cursor: pointer;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
              `}</style>
              
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
