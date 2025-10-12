import os
import asyncio
import logging
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn
import aiofiles
import aiohttp
import json
import redis
import boto3
from datetime import datetime
import numpy as np
from pathlib import Path

from auditus_intelligence import AuditusIntelligence, AuditusConfig, MusicFeatures, MusicRecommendation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Auditus Intelligence API",
    description="AI-powered music analysis and recommendation service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Auditus Intelligence
config = AuditusConfig(
    model_dir="/models",
    cache_dir="/cache",
    redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
    s3_bucket=os.getenv("S3_BUCKET", "audiostems-ai-models"),
    api_endpoint=os.getenv("API_ENDPOINT", "http://localhost:8000")
)

auditus = AuditusIntelligence(config)

# Pydantic models for API
class AnalysisRequest(BaseModel):
    """Request model for music analysis"""
    file_id: str
    audio_url: Optional[str] = None
    s3_key: Optional[str] = None
    local_path: Optional[str] = None

class AnalysisResponse(BaseModel):
    """Response model for music analysis"""
    file_id: str
    status: str
    features: Optional[MusicFeatures] = None
    error: Optional[str] = None
    processing_time: float
    created_at: datetime = Field(default_factory=datetime.now)

class RecommendationRequest(BaseModel):
    """Request model for music recommendations"""
    file_id: str
    num_recommendations: int = Field(default=10, ge=1, le=50)
    filters: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    """Response model for music recommendations"""
    file_id: str
    recommendations: List[MusicRecommendation]
    total_count: int
    processing_time: float
    created_at: datetime = Field(default_factory=datetime.now)

class BatchAnalysisRequest(BaseModel):
    """Request model for batch analysis"""
    files: List[AnalysisRequest]
    priority: str = Field(default="normal", regex="^(low|normal|high)$")

class BatchAnalysisResponse(BaseModel):
    """Response model for batch analysis"""
    batch_id: str
    status: str
    total_files: int
    completed_files: int
    failed_files: int
    results: List[AnalysisResponse]
    created_at: datetime = Field(default_factory=datetime.now)

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    models_loaded: bool
    redis_connected: bool
    s3_connected: bool
    uptime: float

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        redis_connected = False
        try:
            auditus.redis_client.ping()
            redis_connected = True
        except:
            pass
        
        # Check S3 connection
        s3_connected = False
        try:
            auditus.s3_client.head_bucket(Bucket=config.s3_bucket)
            s3_connected = True
        except:
            pass
        
        # Check models
        models_loaded = (
            auditus.feature_extractor is not None and
            auditus.classifier is not None
        )
        
        return HealthResponse(
            status="healthy" if models_loaded and redis_connected else "degraded",
            version="1.0.0",
            models_loaded=models_loaded,
            redis_connected=redis_connected,
            s3_connected=s3_connected,
            uptime=0.0  # Would calculate actual uptime in production
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")

# Music analysis endpoint
@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_music(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """Analyze music and extract features"""
    start_time = datetime.now()
    
    try:
        logger.info(f"Starting analysis for file_id: {request.file_id}")
        
        # Determine audio file path
        audio_path = None
        if request.local_path:
            audio_path = request.local_path
        elif request.s3_key:
            # Download from S3
            audio_path = await _download_from_s3(request.s3_key, request.file_id)
        elif request.audio_url:
            # Download from URL
            audio_path = await _download_from_url(request.audio_url, request.file_id)
        else:
            raise HTTPException(status_code=400, detail="Must provide audio_url, s3_key, or local_path")
        
        # Analyze music
        features = await auditus.analyze_music(audio_path, request.file_id)
        
        # Cleanup temporary files
        if request.s3_key or request.audio_url:
            background_tasks.add_task(_cleanup_temp_file, audio_path)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AnalysisResponse(
            file_id=request.file_id,
            status="completed",
            features=features,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Analysis failed for {request.file_id}: {str(e)}")
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return AnalysisResponse(
            file_id=request.file_id,
            status="failed",
            error=str(e),
            processing_time=processing_time
        )

# Music recommendations endpoint
@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get music recommendations based on a track"""
    start_time = datetime.now()
    
    try:
        logger.info(f"Getting recommendations for file_id: {request.file_id}")
        
        # Get recommendations
        recommendations = await auditus.get_recommendations(
            request.file_id,
            request.num_recommendations
        )
        
        # Apply filters if provided
        if request.filters:
            recommendations = _apply_recommendation_filters(recommendations, request.filters)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return RecommendationResponse(
            file_id=request.file_id,
            recommendations=recommendations,
            total_count=len(recommendations),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Recommendations failed for {request.file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Batch analysis endpoint
@app.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def batch_analyze(request: BatchAnalysisRequest):
    """Analyze multiple music files in batch"""
    start_time = datetime.now()
    batch_id = f"batch_{int(start_time.timestamp())}"
    
    try:
        logger.info(f"Starting batch analysis: {batch_id} with {len(request.files)} files")
        
        results = []
        completed_files = 0
        failed_files = 0
        
        # Process files concurrently
        tasks = []
        for file_request in request.files:
            task = asyncio.create_task(_process_single_analysis(file_request))
            tasks.append(task)
        
        # Wait for all tasks to complete
        analysis_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for result in analysis_results:
            if isinstance(result, Exception):
                failed_files += 1
                results.append(AnalysisResponse(
                    file_id="unknown",
                    status="failed",
                    error=str(result),
                    processing_time=0.0
                ))
            else:
                completed_files += 1
                results.append(result)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return BatchAnalysisResponse(
            batch_id=batch_id,
            status="completed",
            total_files=len(request.files),
            completed_files=completed_files,
            failed_files=failed_files,
            results=results,
            created_at=start_time
        )
        
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# File upload endpoint
@app.post("/upload")
async def upload_audio_file(file: UploadFile = File(...)):
    """Upload audio file for analysis"""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.mp3', '.flac', '.wav', '.aiff')):
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Create unique file ID
        file_id = f"upload_{int(datetime.now().timestamp())}_{file.filename}"
        
        # Save file temporarily
        temp_path = f"/tmp/{file_id}"
        async with aiofiles.open(temp_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Analyze the uploaded file
        analysis_request = AnalysisRequest(
            file_id=file_id,
            local_path=temp_path
        )
        
        # Process analysis
        result = await analyze_music(analysis_request, BackgroundTasks())
        
        return {
            "file_id": file_id,
            "filename": file.filename,
            "analysis": result.dict()
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Cache management endpoints
@app.get("/cache/status")
async def get_cache_status():
    """Get cache status and statistics"""
    try:
        # Get Redis info
        redis_info = auditus.redis_client.info()
        
        # Get cache statistics
        cache_keys = auditus.redis_client.keys("music_features:*")
        processing_keys = auditus.redis_client.keys("processing_status:*")
        
        return {
            "redis_connected": True,
            "total_cached_features": len(cache_keys),
            "total_processing_status": len(processing_keys),
            "redis_memory_usage": redis_info.get("used_memory_human", "unknown"),
            "redis_uptime": redis_info.get("uptime_in_seconds", 0)
        }
        
    except Exception as e:
        logger.error(f"Cache status failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cache/clear")
async def clear_cache():
    """Clear all cached data"""
    try:
        # Clear music features cache
        feature_keys = auditus.redis_client.keys("music_features:*")
        if feature_keys:
            auditus.redis_client.delete(*feature_keys)
        
        # Clear processing status cache
        status_keys = auditus.redis_client.keys("processing_status:*")
        if status_keys:
            auditus.redis_client.delete(*status_keys)
        
        return {
            "status": "success",
            "cleared_features": len(feature_keys),
            "cleared_status": len(status_keys)
        }
        
    except Exception as e:
        logger.error(f"Cache clear failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Model management endpoints
@app.get("/models/status")
async def get_models_status():
    """Get AI models status"""
    try:
        return {
            "feature_extractor_loaded": auditus.feature_extractor is not None,
            "classifier_loaded": auditus.classifier is not None,
            "recommendation_model_loaded": auditus.recommendation_model is not None,
            "device": auditus.config.device,
            "feature_dim": auditus.config.feature_dim,
            "num_classes": auditus.config.num_classes
        }
        
    except Exception as e:
        logger.error(f"Models status failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Utility functions
async def _download_from_s3(s3_key: str, file_id: str) -> str:
    """Download file from S3"""
    try:
        local_path = f"/tmp/{file_id}_s3"
        auditus.s3_client.download_file(
            auditus.config.s3_bucket,
            s3_key,
            local_path
        )
        return local_path
    except Exception as e:
        logger.error(f"Error downloading from S3: {str(e)}")
        raise

async def _download_from_url(url: str, file_id: str) -> str:
    """Download file from URL"""
    try:
        local_path = f"/tmp/{file_id}_url"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status == 200:
                    async with aiofiles.open(local_path, 'wb') as f:
                        await f.write(await response.read())
                    return local_path
                else:
                    raise HTTPException(status_code=400, detail=f"Failed to download from URL: {response.status}")
    except Exception as e:
        logger.error(f"Error downloading from URL: {str(e)}")
        raise

async def _cleanup_temp_file(file_path: str):
    """Clean up temporary file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.error(f"Error cleaning up temp file {file_path}: {str(e)}")

async def _process_single_analysis(request: AnalysisRequest) -> AnalysisResponse:
    """Process single analysis request"""
    try:
        # Determine audio file path
        audio_path = None
        if request.local_path:
            audio_path = request.local_path
        elif request.s3_key:
            audio_path = await _download_from_s3(request.s3_key, request.file_id)
        elif request.audio_url:
            audio_path = await _download_from_url(request.audio_url, request.file_id)
        else:
            raise ValueError("Must provide audio_url, s3_key, or local_path")
        
        # Analyze music
        features = await auditus.analyze_music(audio_path, request.file_id)
        
        # Cleanup
        if request.s3_key or request.audio_url:
            await _cleanup_temp_file(audio_path)
        
        return AnalysisResponse(
            file_id=request.file_id,
            status="completed",
            features=features,
            processing_time=0.0  # Would calculate actual time
        )
        
    except Exception as e:
        logger.error(f"Single analysis failed for {request.file_id}: {str(e)}")
        return AnalysisResponse(
            file_id=request.file_id,
            status="failed",
            error=str(e),
            processing_time=0.0
        )

def _apply_recommendation_filters(recommendations: List[MusicRecommendation], filters: Dict[str, Any]) -> List[MusicRecommendation]:
    """Apply filters to recommendations"""
    filtered_recommendations = recommendations
    
    # Apply genre filter
    if 'genre' in filters:
        target_genre = filters['genre'].lower()
        filtered_recommendations = [
            r for r in filtered_recommendations
            if any(target_genre in g.lower() for g in r.features_match.get('genre', []))
        ]
    
    # Apply mood filter
    if 'mood' in filters:
        target_mood = filters['mood'].lower()
        filtered_recommendations = [
            r for r in filtered_recommendations
            if any(target_mood in m.lower() for m in r.features_match.get('mood', []))
        ]
    
    # Apply BPM range filter
    if 'bpm_min' in filters and 'bpm_max' in filters:
        bpm_min = filters['bpm_min']
        bpm_max = filters['bpm_max']
        filtered_recommendations = [
            r for r in filtered_recommendations
            if bpm_min <= r.features_match.get('bpm', 0) <= bpm_max
        ]
    
    # Apply similarity threshold
    if 'min_similarity' in filters:
        min_similarity = filters['min_similarity']
        filtered_recommendations = [
            r for r in filtered_recommendations
            if r.similarity_score >= min_similarity
        ]
    
    return filtered_recommendations

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("Auditus Intelligence API starting up...")
    
    # Initialize connections
    try:
        # Test Redis connection
        auditus.redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.warning(f"Redis connection failed: {str(e)}")
    
    try:
        # Test S3 connection
        auditus.s3_client.head_bucket(Bucket=config.s3_bucket)
        logger.info("S3 connection established")
    except Exception as e:
        logger.warning(f"S3 connection failed: {str(e)}")
    
    logger.info("Auditus Intelligence API startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("Auditus Intelligence API shutting down...")
    
    # Cleanup connections
    try:
        auditus.redis_client.close()
        logger.info("Redis connection closed")
    except:
        pass
    
    logger.info("Auditus Intelligence API shutdown complete")

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 