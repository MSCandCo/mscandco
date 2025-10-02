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
        width: 40, // Smaller crop to ensure all corners are visible
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
      console.log('🎥 Starting camera...');
      
      // Simple camera request - just video, no fancy constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });

      console.log('✅ Camera stream obtained');
      setCameraStream(stream);
      setShowCameraModal(true);
      
      // Wait a bit then set up video
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log('📹 Setting up video element');
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.log('Video play error:', e));
        }
      }, 100);

    } catch (error) {
      console.error('❌ Camera error:', error);
      
      // Simple error message
      const message = error.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access and try again.'
        : 'Camera not available. Please use "Choose File" to upload a photo instead.';
      
      onUploadError?.(message);
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
    console.log('📸 Capturing photo...');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.log('❌ Video or canvas not ready');
      return;
    }

    const context = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and process
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('✅ Photo captured successfully');
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);
        
        // Convert to data URL for cropping
        const reader = new FileReader();
        reader.onload = () => {
          setImgSrc(reader.result?.toString() || '');
          stopCamera();
          setShowCropModal(true);
        };
        reader.readAsDataURL(blob);
      } else {
        console.log('❌ Failed to create blob');
        onUploadError?.('Failed to capture photo. Please try again.');
      }
    }, 'image/jpeg', 0.8);
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    
    // Calculate zoom to ensure entire image fits in container with padding
    const containerWidth = 350; // Matches maxWidth in CSS
    const containerHeight = 250; // Matches maxHeight in CSS
    
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scaleToFit = Math.min(scaleX, scaleY, 1); // Never scale up
    
    // Set initial zoom to show entire image with some padding
    setZoom(Math.max(scaleToFit * 0.9, 0.3)); // 90% of fit with minimum 30%
    setCrop(centerAspectCrop(width, height, 1)); // 1:1 aspect ratio for profile pictures
  }

  const getCroppedImg = useCallback((image, crop, fileName) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // High resolution output for crisp images
    const outputSize = 800; // 800x800 high resolution output
    const pixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = outputSize * pixelRatio;
    canvas.height = outputSize * pixelRatio;
    
    // Scale the canvas back down using CSS for crisp rendering
    canvas.style.width = outputSize + 'px';
    canvas.style.height = outputSize + 'px';
    
    // Scale the drawing context to match device pixel ratio
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate the actual crop coordinates considering zoom and rotation
    const scaleX = image.naturalWidth / (image.width * zoom);
    const scaleY = image.naturalHeight / (image.height * zoom);

    // Save context for rotation
    ctx.save();
    
    // Move to center of canvas for rotation
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw the cropped portion at high resolution
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
        0.95, // Higher quality for crisp results
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

        // Update profile with the new picture URL - detect role from URL
        const currentPath = window.location.pathname;
        let profileApi = '/api/artist/profile'; // default
        
        if (currentPath.includes('/labeladmin/')) {
          profileApi = '/api/labeladmin/profile';
        } else if (currentPath.includes('/companyadmin/')) {
          profileApi = '/api/companyadmin/profile';
        } else if (currentPath.includes('/distributionpartner/')) {
          profileApi = '/api/distributionpartner/profile';
        }

        console.log('📸 Updating profile picture via:', profileApi);

        const updateResponse = await fetch(profileApi, {
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
            
            {/* Hidden camera input for mobile fallback */}
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={onSelectFile}
              className="hidden"
              id="camera-capture-fallback"
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

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

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

              <div className="w-full h-96 border border-gray-300 rounded-lg overflow-auto bg-gray-50 flex items-center justify-center p-4">
                <div style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}>
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
                        display: 'block',
                        maxWidth: '350px',
                        maxHeight: '250px',
                        width: 'auto',
                        height: 'auto'
                      }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>
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
