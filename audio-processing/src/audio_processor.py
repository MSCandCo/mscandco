import os
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import boto3
import redis
from pydantic import BaseModel
import ffmpeg
import numpy as np
from PIL import Image
import io
import json
import hashlib
import time
from concurrent.futures import ThreadPoolExecutor
import aiofiles
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AudioProcessingConfig(BaseModel):
    """Configuration for audio processing"""
    input_bucket: str
    output_bucket: str
    temp_dir: str = "/tmp/audio_processing"
    max_file_size_mb: int = 500
    supported_formats: List[str] = ["flac", "mp3", "wav", "aiff"]
    output_formats: List[str] = ["flac", "mp3_320", "mp3_128"]
    watermark_enabled: bool = True
    waveform_enabled: bool = True
    spectrogram_enabled: bool = True
    redis_url: str = "redis://localhost:6379"
    max_workers: int = 4

class AudioMetadata(BaseModel):
    """Audio file metadata"""
    file_id: str
    original_filename: str
    duration: float
    sample_rate: int
    channels: int
    bit_depth: int
    format: str
    file_size: int
    bitrate: Optional[int] = None
    loudness: Optional[float] = None
    bpm: Optional[float] = None
    key: Optional[str] = None
    genre: Optional[str] = None
    tags: Dict[str, str] = {}
    processing_status: str = "pending"
    created_at: float = time.time()

class AudioProcessor:
    """Main audio processing service"""
    
    def __init__(self, config: AudioProcessingConfig):
        self.config = config
        self.s3_client = boto3.client('s3')
        self.redis_client = redis.from_url(config.redis_url)
        self.executor = ThreadPoolExecutor(max_workers=config.max_workers)
        
        # Ensure temp directory exists
        Path(config.temp_dir).mkdir(parents=True, exist_ok=True)
        
        logger.info(f"AudioProcessor initialized with config: {config}")
    
    async def process_audio_file(self, file_id: str, s3_key: str) -> Dict:
        """Main processing pipeline for audio files"""
        try:
            logger.info(f"Starting processing for file_id: {file_id}, s3_key: {s3_key}")
            
            # Download file from S3
            local_path = await self._download_from_s3(s3_key, file_id)
            
            # Extract metadata
            metadata = await self._extract_metadata(local_path, file_id)
            
            # Process audio formats
            processed_files = await self._process_formats(local_path, file_id, metadata)
            
            # Generate waveforms and spectrograms
            if self.config.waveform_enabled:
                await self._generate_waveform(local_path, file_id)
            
            if self.config.spectrogram_enabled:
                await self._generate_spectrogram(local_path, file_id)
            
            # Add watermark if enabled
            if self.config.watermark_enabled:
                await self._add_watermark(local_path, file_id)
            
            # Upload processed files to S3
            upload_results = await self._upload_to_s3(processed_files, file_id)
            
            # Update metadata
            metadata.processing_status = "completed"
            await self._update_metadata(file_id, metadata)
            
            # Cleanup
            await self._cleanup_temp_files(local_path)
            
            return {
                "file_id": file_id,
                "status": "completed",
                "processed_files": upload_results,
                "metadata": metadata.dict()
            }
            
        except Exception as e:
            logger.error(f"Error processing file {file_id}: {str(e)}")
            await self._update_processing_status(file_id, "failed", str(e))
            raise
    
    async def _download_from_s3(self, s3_key: str, file_id: str) -> str:
        """Download file from S3 to local temp directory"""
        local_path = os.path.join(self.config.temp_dir, f"{file_id}_original")
        
        logger.info(f"Downloading {s3_key} to {local_path}")
        
        self.s3_client.download_file(
            self.config.input_bucket,
            s3_key,
            local_path
        )
        
        return local_path
    
    async def _extract_metadata(self, file_path: str, file_id: str) -> AudioMetadata:
        """Extract audio metadata using ffmpeg"""
        try:
            probe = ffmpeg.probe(file_path)
            audio_info = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
            
            metadata = AudioMetadata(
                file_id=file_id,
                original_filename=os.path.basename(file_path),
                duration=float(probe['format']['duration']),
                sample_rate=int(audio_info['sample_rate']),
                channels=int(audio_info['channels']),
                bit_depth=int(audio_info.get('bits_per_sample', 16)),
                format=audio_info['codec_name'],
                file_size=int(probe['format']['size']),
                bitrate=int(probe['format']['bit_rate']) if 'bit_rate' in probe['format'] else None
            )
            
            # Calculate loudness
            metadata.loudness = await self._calculate_loudness(file_path)
            
            # Detect BPM and key (basic implementation)
            metadata.bpm = await self._detect_bpm(file_path)
            metadata.key = await self._detect_key(file_path)
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            raise
    
    async def _process_formats(self, input_path: str, file_id: str, metadata: AudioMetadata) -> List[str]:
        """Process audio into different formats"""
        processed_files = []
        
        for format_type in self.config.output_formats:
            try:
                output_path = os.path.join(self.config.temp_dir, f"{file_id}_{format_type}")
                
                if format_type == "flac":
                    await self._convert_to_flac(input_path, output_path)
                elif format_type == "mp3_320":
                    await self._convert_to_mp3(input_path, output_path, bitrate="320k")
                elif format_type == "mp3_128":
                    await self._convert_to_mp3(input_path, output_path, bitrate="128k")
                
                processed_files.append(output_path)
                
            except Exception as e:
                logger.error(f"Error processing format {format_type}: {str(e)}")
                continue
        
        return processed_files
    
    async def _convert_to_flac(self, input_path: str, output_path: str):
        """Convert audio to FLAC format"""
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(stream, output_path, acodec='flac', compression_level=8)
        ffmpeg.run(stream, overwrite_output=True, quiet=True)
    
    async def _convert_to_mp3(self, input_path: str, output_path: str, bitrate: str = "320k"):
        """Convert audio to MP3 format"""
        stream = ffmpeg.input(input_path)
        stream = ffmpeg.output(stream, output_path, acodec='mp3', ab=bitrate, q=0)
        ffmpeg.run(stream, overwrite_output=True, quiet=True)
    
    async def _generate_waveform(self, input_path: str, file_id: str):
        """Generate waveform visualization"""
        try:
            # Extract audio data
            out, _ = ffmpeg.input(input_path).output('pipe:', format='f32le', acodec='pcm_f32le').run(capture_stdout=True, quiet=True)
            
            # Convert to numpy array
            audio_data = np.frombuffer(out, np.float32)
            
            # Generate waveform
            waveform = self._create_waveform(audio_data)
            
            # Save as PNG
            waveform_path = os.path.join(self.config.temp_dir, f"{file_id}_waveform.png")
            waveform.save(waveform_path)
            
            # Upload to S3
            self.s3_client.upload_file(
                waveform_path,
                self.config.output_bucket,
                f"waveforms/{file_id}.png"
            )
            
        except Exception as e:
            logger.error(f"Error generating waveform: {str(e)}")
    
    def _create_waveform(self, audio_data: np.ndarray, width: int = 1200, height: int = 300) -> Image.Image:
        """Create waveform visualization"""
        # Downsample audio data
        samples_per_pixel = len(audio_data) // width
        if samples_per_pixel < 1:
            samples_per_pixel = 1
        
        # Calculate RMS values for each pixel
        rms_values = []
        for i in range(0, len(audio_data), samples_per_pixel):
            chunk = audio_data[i:i + samples_per_pixel]
            rms = np.sqrt(np.mean(chunk ** 2))
            rms_values.append(rms)
        
        # Normalize and scale
        max_rms = max(rms_values) if rms_values else 1
        scaled_values = [int((rms / max_rms) * height) for rms in rms_values]
        
        # Create image
        img = Image.new('RGB', (width, height), color='#1a1a1a')
        pixels = img.load()
        
        for x, amplitude in enumerate(scaled_values):
            if x >= width:
                break
            
            # Draw waveform line
            y_center = height // 2
            y_start = max(0, y_center - amplitude // 2)
            y_end = min(height, y_center + amplitude // 2)
            
            for y in range(y_start, y_end):
                pixels[x, y] = (0, 255, 150)  # Green color
        
        return img
    
    async def _generate_spectrogram(self, input_path: str, file_id: str):
        """Generate spectrogram visualization"""
        try:
            # Extract audio data
            out, _ = ffmpeg.input(input_path).output('pipe:', format='f32le', acodec='pcm_f32le').run(capture_stdout=True, quiet=True)
            
            # Convert to numpy array
            audio_data = np.frombuffer(out, np.float32)
            
            # Generate spectrogram
            spectrogram = self._create_spectrogram(audio_data)
            
            # Save as PNG
            spectrogram_path = os.path.join(self.config.temp_dir, f"{file_id}_spectrogram.png")
            spectrogram.save(spectrogram_path)
            
            # Upload to S3
            self.s3_client.upload_file(
                spectrogram_path,
                self.config.output_bucket,
                f"spectrograms/{file_id}.png"
            )
            
        except Exception as e:
            logger.error(f"Error generating spectrogram: {str(e)}")
    
    def _create_spectrogram(self, audio_data: np.ndarray, width: int = 1200, height: int = 300) -> Image.Image:
        """Create spectrogram visualization"""
        # Simple spectrogram implementation
        # In production, use librosa or scipy for better spectrograms
        
        # Create a simple frequency-domain representation
        fft_size = 1024
        hop_size = fft_size // 4
        
        spectrogram_data = []
        
        for i in range(0, len(audio_data) - fft_size, hop_size):
            chunk = audio_data[i:i + fft_size]
            fft = np.fft.fft(chunk)
            magnitude = np.abs(fft[:fft_size // 2])
            spectrogram_data.append(magnitude)
        
        if not spectrogram_data:
            # Create empty spectrogram
            img = Image.new('RGB', (width, height), color='#1a1a1a')
            return img
        
        # Convert to image
        spectrogram_array = np.array(spectrogram_data)
        
        # Normalize and scale
        spectrogram_array = np.log(spectrogram_array + 1e-10)
        spectrogram_array = (spectrogram_array - spectrogram_array.min()) / (spectrogram_array.max() - spectrogram_array.min())
        
        # Resize to target dimensions
        from scipy.ndimage import zoom
        zoom_factors = (height / spectrogram_array.shape[0], width / spectrogram_array.shape[1])
        spectrogram_array = zoom(spectrogram_array, zoom_factors, order=1)
        
        # Convert to image
        spectrogram_array = (spectrogram_array * 255).astype(np.uint8)
        img = Image.fromarray(spectrogram_array, mode='L')
        img = img.convert('RGB')
        
        return img
    
    async def _add_watermark(self, input_path: str, file_id: str):
        """Add digital watermark to audio"""
        try:
            # Generate watermark signal
            watermark = self._generate_watermark(file_id)
            
            # Apply watermark
            output_path = os.path.join(self.config.temp_dir, f"{file_id}_watermarked")
            
            # Mix watermark with original audio
            stream = ffmpeg.input(input_path)
            watermark_stream = ffmpeg.input('anullsrc', f='lavfi', t=10)  # Placeholder
            stream = ffmpeg.filter([stream, watermark_stream], 'amix=inputs=2:duration=first')
            stream = ffmpeg.output(stream, output_path)
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            # Upload watermarked version
            self.s3_client.upload_file(
                output_path,
                self.config.output_bucket,
                f"watermarked/{file_id}.flac"
            )
            
        except Exception as e:
            logger.error(f"Error adding watermark: {str(e)}")
    
    def _generate_watermark(self, file_id: str) -> np.ndarray:
        """Generate digital watermark signal"""
        # Simple watermark implementation
        # In production, use more sophisticated watermarking techniques
        
        # Generate pseudo-random sequence based on file_id
        seed = int(hashlib.md5(file_id.encode()).hexdigest()[:8], 16)
        np.random.seed(seed)
        
        # Create watermark signal
        watermark = np.random.randn(44100 * 10) * 0.01  # 10 seconds, very low amplitude
        
        return watermark
    
    async def _calculate_loudness(self, file_path: str) -> float:
        """Calculate integrated loudness using EBU R128"""
        try:
            # Use ffmpeg to calculate loudness
            cmd = [
                'ffmpeg', '-i', file_path, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
                '-f', 'null', '-'
            ]
            
            # This is a simplified implementation
            # In production, use proper loudness measurement
            return -20.0  # Placeholder value
            
        except Exception as e:
            logger.error(f"Error calculating loudness: {str(e)}")
            return None
    
    async def _detect_bpm(self, file_path: str) -> float:
        """Detect BPM using audio analysis"""
        try:
            # Simplified BPM detection
            # In production, use librosa or other audio analysis libraries
            return 120.0  # Placeholder value
            
        except Exception as e:
            logger.error(f"Error detecting BPM: {str(e)}")
            return None
    
    async def _detect_key(self, file_path: str) -> str:
        """Detect musical key"""
        try:
            # Simplified key detection
            # In production, use proper music theory analysis
            keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            return np.random.choice(keys)  # Placeholder
            
        except Exception as e:
            logger.error(f"Error detecting key: {str(e)}")
            return None
    
    async def _upload_to_s3(self, file_paths: List[str], file_id: str) -> List[Dict]:
        """Upload processed files to S3"""
        upload_results = []
        
        for file_path in file_paths:
            try:
                format_type = os.path.basename(file_path).split('_')[-1]
                s3_key = f"processed/{file_id}/{format_type}/{os.path.basename(file_path)}"
                
                self.s3_client.upload_file(
                    file_path,
                    self.config.output_bucket,
                    s3_key
                )
                
                upload_results.append({
                    "format": format_type,
                    "s3_key": s3_key,
                    "size": os.path.getsize(file_path)
                })
                
            except Exception as e:
                logger.error(f"Error uploading {file_path}: {str(e)}")
                continue
        
        return upload_results
    
    async def _update_metadata(self, file_id: str, metadata: AudioMetadata):
        """Update metadata in Redis"""
        try:
            self.redis_client.setex(
                f"audio_metadata:{file_id}",
                3600,  # 1 hour TTL
                metadata.json()
            )
        except Exception as e:
            logger.error(f"Error updating metadata: {str(e)}")
    
    async def _update_processing_status(self, file_id: str, status: str, error: str = None):
        """Update processing status"""
        try:
            status_data = {
                "status": status,
                "updated_at": time.time(),
                "error": error
            }
            
            self.redis_client.setex(
                f"processing_status:{file_id}",
                3600,
                json.dumps(status_data)
            )
        except Exception as e:
            logger.error(f"Error updating processing status: {str(e)}")
    
    async def _cleanup_temp_files(self, *file_paths):
        """Clean up temporary files"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                logger.error(f"Error cleaning up {file_path}: {str(e)}")

# Example usage
if __name__ == "__main__":
    config = AudioProcessingConfig(
        input_bucket="audiostems-raw-audio",
        output_bucket="audiostems-processed-audio",
        temp_dir="/tmp/audio_processing"
    )
    
    processor = AudioProcessor(config)
    
    # Example processing
    async def main():
        result = await processor.process_audio_file(
            file_id="test_123",
            s3_key="uploads/test_audio.flac"
        )
        print(f"Processing result: {result}")
    
    asyncio.run(main()) 