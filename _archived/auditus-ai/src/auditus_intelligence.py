import os
import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
import librosa
import librosa.display
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import pandas as pd
import json
import redis
import boto3
from pydantic import BaseModel
import aiohttp
import aiofiles
from datetime import datetime, timedelta
import hashlib
import pickle
from concurrent.futures import ThreadPoolExecutor
import joblib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AuditusConfig(BaseModel):
    """Configuration for Auditus Intelligence"""
    model_dir: str = "/models"
    cache_dir: str = "/cache"
    redis_url: str = "redis://localhost:6379"
    s3_bucket: str = "audiostems-ai-models"
    api_endpoint: str = "http://localhost:8000"
    max_workers: int = 4
    batch_size: int = 32
    feature_dim: int = 512
    num_classes: int = 1000
    device: str = "cuda" if torch.cuda.is_available() else "cpu"

class MusicFeatures(BaseModel):
    """Extracted music features"""
    file_id: str
    tempo: float
    key: str
    mode: str
    loudness: float
    energy: float
    danceability: float
    valence: float
    acousticness: float
    instrumentalness: float
    speechiness: float
    liveness: float
    complexity: float
    genre: List[str]
    mood: List[str]
    instruments: List[str]
    bpm: float
    key_confidence: float
    tempo_confidence: float
    features_vector: List[float]
    created_at: datetime = datetime.now()

class MusicRecommendation(BaseModel):
    """Music recommendation result"""
    track_id: str
    similarity_score: float
    reason: str
    features_match: Dict[str, float]
    genre_match: bool
    mood_match: bool
    bpm_match: bool
    key_compatibility: float

class AuditusIntelligence:
    """Main Auditus Intelligence AI service"""
    
    def __init__(self, config: AuditusConfig):
        self.config = config
        self.redis_client = redis.from_url(config.redis_url)
        self.s3_client = boto3.client('s3')
        self.executor = ThreadPoolExecutor(max_workers=config.max_workers)
        
        # Initialize models
        self.feature_extractor = None
        self.classifier = None
        self.recommendation_model = None
        
        # Load models
        self._load_models()
        
        # Initialize feature cache
        self.feature_cache = {}
        
        logger.info(f"AuditusIntelligence initialized with config: {config}")
    
    def _load_models(self):
        """Load AI models"""
        try:
            # Load feature extraction model
            self.feature_extractor = self._load_feature_extractor()
            
            # Load classification model
            self.classifier = self._load_classifier()
            
            # Load recommendation model
            self.recommendation_model = self._load_recommendation_model()
            
            logger.info("All models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    def _load_feature_extractor(self):
        """Load audio feature extraction model"""
        # In production, load pre-trained models like VGGish, MusicNet, etc.
        class FeatureExtractor(nn.Module):
            def __init__(self, input_dim=128, hidden_dim=256, output_dim=512):
                super().__init__()
                self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
                self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
                self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
                self.pool = nn.AdaptiveAvgPool2d((1, 1))
                self.fc1 = nn.Linear(128, hidden_dim)
                self.fc2 = nn.Linear(hidden_dim, output_dim)
                self.dropout = nn.Dropout(0.5)
                
            def forward(self, x):
                x = F.relu(self.conv1(x))
                x = F.max_pool2d(x, 2)
                x = F.relu(self.conv2(x))
                x = F.max_pool2d(x, 2)
                x = F.relu(self.conv3(x))
                x = self.pool(x)
                x = x.view(x.size(0), -1)
                x = F.relu(self.fc1(x))
                x = self.dropout(x)
                x = self.fc2(x)
                return x
        
        model = FeatureExtractor()
        model.to(self.config.device)
        model.eval()
        return model
    
    def _load_classifier(self):
        """Load music classification model"""
        class MusicClassifier(nn.Module):
            def __init__(self, input_dim=512, hidden_dim=256, num_classes=1000):
                super().__init__()
                self.fc1 = nn.Linear(input_dim, hidden_dim)
                self.fc2 = nn.Linear(hidden_dim, hidden_dim // 2)
                self.fc3 = nn.Linear(hidden_dim // 2, num_classes)
                self.dropout = nn.Dropout(0.3)
                
            def forward(self, x):
                x = F.relu(self.fc1(x))
                x = self.dropout(x)
                x = F.relu(self.fc2(x))
                x = self.dropout(x)
                x = self.fc3(x)
                return x
        
        model = MusicClassifier()
        model.to(self.config.device)
        model.eval()
        return model
    
    def _load_recommendation_model(self):
        """Load recommendation model"""
        # Simple collaborative filtering model
        # In production, use more sophisticated recommendation systems
        return None
    
    async def analyze_music(self, audio_path: str, file_id: str) -> MusicFeatures:
        """Analyze music and extract features"""
        try:
            logger.info(f"Analyzing music file: {file_id}")
            
            # Check cache first
            cached_features = await self._get_cached_features(file_id)
            if cached_features:
                return cached_features
            
            # Load audio
            y, sr = librosa.load(audio_path, sr=22050)
            
            # Extract basic features
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            
            # Extract advanced features
            features = await self._extract_advanced_features(y, sr)
            
            # Classify genre and mood
            genre, mood = await self._classify_genre_mood(features['mfcc'])
            
            # Detect instruments
            instruments = await self._detect_instruments(features['spectral'])
            
            # Calculate musical features
            key, mode, key_confidence = await self._detect_key_mode(chroma)
            energy = np.mean(librosa.feature.rms(y=y))
            loudness = np.mean(librosa.feature.rms(y=y))
            
            # Calculate advanced metrics
            danceability = await self._calculate_danceability(y, sr, tempo)
            valence = await self._calculate_valence(y, sr)
            acousticness = await self._calculate_acousticness(y, sr)
            instrumentalness = await self._calculate_instrumentalness(y, sr)
            speechiness = await self._calculate_speechiness(y, sr)
            liveness = await self._calculate_liveness(y, sr)
            complexity = await self._calculate_complexity(y, sr)
            
            # Create features vector for ML models
            features_vector = await self._create_features_vector(features)
            
            # Create MusicFeatures object
            music_features = MusicFeatures(
                file_id=file_id,
                tempo=tempo,
                key=key,
                mode=mode,
                loudness=loudness,
                energy=energy,
                danceability=danceability,
                valence=valence,
                acousticness=acousticness,
                instrumentalness=instrumentalness,
                speechiness=speechiness,
                liveness=liveness,
                complexity=complexity,
                genre=genre,
                mood=mood,
                instruments=instruments,
                bpm=tempo,
                key_confidence=key_confidence,
                tempo_confidence=0.8,  # Placeholder
                features_vector=features_vector
            )
            
            # Cache features
            await self._cache_features(file_id, music_features)
            
            return music_features
            
        except Exception as e:
            logger.error(f"Error analyzing music {file_id}: {str(e)}")
            raise
    
    async def _extract_advanced_features(self, y: np.ndarray, sr: int) -> Dict[str, np.ndarray]:
        """Extract advanced audio features"""
        features = {}
        
        # MFCC features
        features['mfcc'] = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=20)
        
        # Spectral features
        features['spectral'] = librosa.feature.spectral_centroid(y=y, sr=sr)
        
        # Mel spectrogram
        mel_spec = librosa.feature.melspectrogram(y=y, sr=sr)
        features['mel'] = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Chroma features
        features['chroma'] = librosa.feature.chroma_cqt(y=y, sr=sr)
        
        # Rhythm features
        features['tempo'] = librosa.beat.beat_track(y=y, sr=sr)[0]
        
        return features
    
    async def _classify_genre_mood(self, mfcc: np.ndarray) -> Tuple[List[str], List[str]]:
        """Classify genre and mood using ML models"""
        try:
            # Simplified classification
            # In production, use trained models for genre and mood classification
            
            # Genre classification (simplified)
            genres = ['electronic', 'rock', 'pop', 'jazz', 'classical', 'hip-hop']
            genre_probs = self.classifier(torch.tensor(mfcc.mean(axis=1), dtype=torch.float32).unsqueeze(0))
            genre_probs = F.softmax(genre_probs, dim=1)
            top_genres = torch.topk(genre_probs, 3)[1][0].tolist()
            predicted_genres = [genres[i] for i in top_genres]
            
            # Mood classification (simplified)
            moods = ['energetic', 'calm', 'happy', 'sad', 'aggressive', 'peaceful']
            mood_probs = self.classifier(torch.tensor(mfcc.mean(axis=1), dtype=torch.float32).unsqueeze(0))
            mood_probs = F.softmax(mood_probs, dim=1)
            top_moods = torch.topk(mood_probs, 3)[1][0].tolist()
            predicted_moods = [moods[i] for i in top_moods]
            
            return predicted_genres, predicted_moods
            
        except Exception as e:
            logger.error(f"Error in genre/mood classification: {str(e)}")
            return ['electronic'], ['energetic']
    
    async def _detect_instruments(self, spectral_features: np.ndarray) -> List[str]:
        """Detect instruments in the audio"""
        try:
            # Simplified instrument detection
            # In production, use specialized instrument detection models
            
            instruments = ['piano', 'guitar', 'drums', 'bass', 'synth']
            
            # Simple heuristic based on spectral features
            spectral_mean = np.mean(spectral_features)
            spectral_std = np.std(spectral_features)
            
            detected_instruments = []
            
            if spectral_mean > 0.5:
                detected_instruments.append('piano')
            if spectral_std > 0.3:
                detected_instruments.append('drums')
            if spectral_mean < 0.3:
                detected_instruments.append('bass')
            
            # Always include some instruments for demo
            if not detected_instruments:
                detected_instruments = ['synth', 'drums']
            
            return detected_instruments
            
        except Exception as e:
            logger.error(f"Error in instrument detection: {str(e)}")
            return ['synth']
    
    async def _detect_key_mode(self, chroma: np.ndarray) -> Tuple[str, str, float]:
        """Detect musical key and mode"""
        try:
            # Key detection using chroma features
            chroma_mean = np.mean(chroma, axis=1)
            key_idx = np.argmax(chroma_mean)
            
            keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            key = keys[key_idx]
            
            # Mode detection (simplified)
            mode = 'major' if chroma_mean[key_idx] > np.mean(chroma_mean) else 'minor'
            
            # Confidence based on chroma strength
            confidence = min(1.0, chroma_mean[key_idx] / np.max(chroma_mean))
            
            return key, mode, confidence
            
        except Exception as e:
            logger.error(f"Error in key detection: {str(e)}")
            return 'C', 'major', 0.5
    
    async def _calculate_danceability(self, y: np.ndarray, sr: int, tempo: float) -> float:
        """Calculate danceability score"""
        try:
            # Simplified danceability calculation
            # In production, use more sophisticated algorithms
            
            # Factors: tempo, rhythm strength, beat consistency
            rhythm_strength = np.mean(librosa.feature.rms(y=y))
            beat_consistency = librosa.beat.beat_track(y=y, sr=sr)[1]
            
            # Normalize tempo (120 BPM is ideal for danceability)
            tempo_score = 1.0 - abs(tempo - 120) / 120
            
            danceability = (tempo_score + rhythm_strength + beat_consistency) / 3
            return min(1.0, max(0.0, danceability))
            
        except Exception as e:
            logger.error(f"Error calculating danceability: {str(e)}")
            return 0.5
    
    async def _calculate_valence(self, y: np.ndarray, sr: int) -> float:
        """Calculate valence (positivity) score"""
        try:
            # Simplified valence calculation
            # In production, use trained models for emotion detection
            
            # Use spectral features to estimate valence
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            
            # Higher frequencies and rolloff indicate more positive valence
            valence = (np.mean(spectral_centroids) + np.mean(spectral_rolloff)) / 2
            valence = (valence - np.min(spectral_centroids)) / (np.max(spectral_centroids) - np.min(spectral_centroids))
            
            return min(1.0, max(0.0, valence))
            
        except Exception as e:
            logger.error(f"Error calculating valence: {str(e)}")
            return 0.5
    
    async def _calculate_acousticness(self, y: np.ndarray, sr: int) -> float:
        """Calculate acousticness score"""
        try:
            # Simplified acousticness calculation
            # In production, use more sophisticated acoustic vs electronic detection
            
            # Use spectral features to distinguish acoustic from electronic
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
            
            # Acoustic instruments typically have more complex spectral characteristics
            acousticness = np.mean(spectral_bandwidth) / np.mean(spectral_centroids)
            acousticness = min(1.0, max(0.0, acousticness))
            
            return acousticness
            
        except Exception as e:
            logger.error(f"Error calculating acousticness: {str(e)}")
            return 0.5
    
    async def _calculate_instrumentalness(self, y: np.ndarray, sr: int) -> float:
        """Calculate instrumentalness score"""
        try:
            # Simplified instrumentalness calculation
            # In production, use voice activity detection models
            
            # Use spectral features to detect voice vs instruments
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            
            # Voice typically has specific MFCC patterns
            # This is a simplified heuristic
            mfcc_variance = np.var(mfcc, axis=1)
            instrumentalness = 1.0 - np.mean(mfcc_variance) / np.max(mfcc_variance)
            
            return min(1.0, max(0.0, instrumentalness))
            
        except Exception as e:
            logger.error(f"Error calculating instrumentalness: {str(e)}")
            return 0.7
    
    async def _calculate_speechiness(self, y: np.ndarray, sr: int) -> float:
        """Calculate speechiness score"""
        try:
            # Simplified speechiness calculation
            # In production, use speech detection models
            
            # Use spectral features to detect speech-like characteristics
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            
            # Speech typically has lower spectral centroids
            speechiness = 1.0 - (np.mean(spectral_centroids) / np.max(spectral_centroids))
            
            return min(1.0, max(0.0, speechiness))
            
        except Exception as e:
            logger.error(f"Error calculating speechiness: {str(e)}")
            return 0.1
    
    async def _calculate_liveness(self, y: np.ndarray, sr: int) -> float:
        """Calculate liveness score"""
        try:
            # Simplified liveness calculation
            # In production, use models trained on live vs studio recordings
            
            # Use spectral features to detect live characteristics
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            
            # Live recordings often have different spectral characteristics
            liveness = np.mean(spectral_rolloff) / np.max(spectral_rolloff)
            
            return min(1.0, max(0.0, liveness))
            
        except Exception as e:
            logger.error(f"Error calculating liveness: {str(e)}")
            return 0.3
    
    async def _calculate_complexity(self, y: np.ndarray, sr: int) -> float:
        """Calculate musical complexity score"""
        try:
            # Calculate various complexity metrics
            
            # Harmonic complexity
            chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
            harmonic_complexity = np.std(chroma)
            
            # Rhythmic complexity
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            rhythmic_complexity = len(beats) / len(y) * sr
            
            # Spectral complexity
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_complexity = np.std(spectral_centroids)
            
            # Combine complexity metrics
            complexity = (harmonic_complexity + rhythmic_complexity + spectral_complexity) / 3
            complexity = min(1.0, max(0.0, complexity))
            
            return complexity
            
        except Exception as e:
            logger.error(f"Error calculating complexity: {str(e)}")
            return 0.5
    
    async def _create_features_vector(self, features: Dict[str, np.ndarray]) -> List[float]:
        """Create feature vector for ML models"""
        try:
            # Combine all features into a single vector
            feature_vector = []
            
            # MFCC features
            feature_vector.extend(np.mean(features['mfcc'], axis=1).tolist())
            feature_vector.extend(np.std(features['mfcc'], axis=1).tolist())
            
            # Spectral features
            feature_vector.extend([np.mean(features['spectral'])])
            feature_vector.extend([np.std(features['spectral'])])
            
            # Mel features
            feature_vector.extend([np.mean(features['mel'])])
            feature_vector.extend([np.std(features['mel'])])
            
            # Pad or truncate to fixed length
            target_length = self.config.feature_dim
            if len(feature_vector) < target_length:
                feature_vector.extend([0.0] * (target_length - len(feature_vector)))
            else:
                feature_vector = feature_vector[:target_length]
            
            return feature_vector
            
        except Exception as e:
            logger.error(f"Error creating feature vector: {str(e)}")
            return [0.0] * self.config.feature_dim
    
    async def get_recommendations(self, file_id: str, num_recommendations: int = 10) -> List[MusicRecommendation]:
        """Get music recommendations based on a track"""
        try:
            # Get features for the input track
            features = await self._get_cached_features(file_id)
            if not features:
                raise ValueError(f"No features found for file_id: {file_id}")
            
            # Get all available tracks
            all_tracks = await self._get_all_track_features()
            
            # Calculate similarities
            recommendations = []
            for track in all_tracks:
                if track.file_id == file_id:
                    continue
                
                similarity = await self._calculate_similarity(features, track)
                
                recommendation = MusicRecommendation(
                    track_id=track.file_id,
                    similarity_score=similarity['overall'],
                    reason=similarity['reason'],
                    features_match=similarity['features'],
                    genre_match=similarity['genre_match'],
                    mood_match=similarity['mood_match'],
                    bpm_match=similarity['bpm_match'],
                    key_compatibility=similarity['key_compatibility']
                )
                
                recommendations.append(recommendation)
            
            # Sort by similarity score and return top recommendations
            recommendations.sort(key=lambda x: x.similarity_score, reverse=True)
            return recommendations[:num_recommendations]
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {str(e)}")
            return []
    
    async def _calculate_similarity(self, track1: MusicFeatures, track2: MusicFeatures) -> Dict[str, Any]:
        """Calculate similarity between two tracks"""
        try:
            # Calculate feature vector similarity
            features_sim = cosine_similarity(
                [track1.features_vector],
                [track2.features_vector]
            )[0][0]
            
            # Calculate individual feature similarities
            tempo_sim = 1.0 - abs(track1.tempo - track2.tempo) / max(track1.tempo, track2.tempo)
            key_sim = 1.0 if track1.key == track2.key else 0.0
            genre_sim = len(set(track1.genre) & set(track2.genre)) / len(set(track1.genre) | set(track2.genre))
            mood_sim = len(set(track1.mood) & set(track2.mood)) / len(set(track1.mood) | set(track2.mood))
            
            # Calculate overall similarity
            overall_sim = (features_sim + tempo_sim + key_sim + genre_sim + mood_sim) / 5
            
            # Determine reason for recommendation
            reasons = []
            if features_sim > 0.8:
                reasons.append("similar musical characteristics")
            if tempo_sim > 0.9:
                reasons.append("matching tempo")
            if genre_sim > 0.5:
                reasons.append("same genre")
            if mood_sim > 0.5:
                reasons.append("similar mood")
            
            reason = " and ".join(reasons) if reasons else "musical similarity"
            
            return {
                'overall': overall_sim,
                'reason': reason,
                'features': {
                    'features_sim': features_sim,
                    'tempo_sim': tempo_sim,
                    'key_sim': key_sim,
                    'genre_sim': genre_sim,
                    'mood_sim': mood_sim
                },
                'genre_match': genre_sim > 0.3,
                'mood_match': mood_sim > 0.3,
                'bpm_match': tempo_sim > 0.8,
                'key_compatibility': key_sim
            }
            
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            return {
                'overall': 0.0,
                'reason': 'similarity calculation failed',
                'features': {},
                'genre_match': False,
                'mood_match': False,
                'bpm_match': False,
                'key_compatibility': 0.0
            }
    
    async def _get_cached_features(self, file_id: str) -> Optional[MusicFeatures]:
        """Get cached features from Redis"""
        try:
            cached_data = self.redis_client.get(f"music_features:{file_id}")
            if cached_data:
                return MusicFeatures.parse_raw(cached_data)
            return None
        except Exception as e:
            logger.error(f"Error getting cached features: {str(e)}")
            return None
    
    async def _cache_features(self, file_id: str, features: MusicFeatures):
        """Cache features in Redis"""
        try:
            self.redis_client.setex(
                f"music_features:{file_id}",
                3600,  # 1 hour TTL
                features.json()
            )
        except Exception as e:
            logger.error(f"Error caching features: {str(e)}")
    
    async def _get_all_track_features(self) -> List[MusicFeatures]:
        """Get all track features from cache/database"""
        try:
            # In production, this would query a database
            # For now, return empty list
            return []
        except Exception as e:
            logger.error(f"Error getting all track features: {str(e)}")
            return []

# Example usage
if __name__ == "__main__":
    config = AuditusConfig(
        model_dir="/models",
        cache_dir="/cache",
        redis_url="redis://localhost:6379"
    )
    
    auditus = AuditusIntelligence(config)
    
    # Example analysis
    async def main():
        features = await auditus.analyze_music(
            audio_path="/path/to/audio.flac",
            file_id="test_123"
        )
        print(f"Analysis result: {features}")
        
        recommendations = await auditus.get_recommendations("test_123", 5)
        print(f"Recommendations: {recommendations}")
    
    asyncio.run(main()) 