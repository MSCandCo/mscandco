// MSC & Co Music Management Lambda Handler - Enterprise Grade
// Handles music uploads, processing, and distribution with AWS S3 integration

const AWS = require('aws-sdk');
const multipart = require('aws-lambda-multipart-parser');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const s3 = new AWS.S3();
const rds = new AWS.RDSDataService();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': true,
};

// Main Lambda handler
exports.main = async (event) => {
  console.log('Music Lambda Event:', JSON.stringify(event, null, 2));

  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight successful' });
  }

  try {
    const { pathParameters, httpMethod, headers, body, isBase64Encoded } = event;
    const pathParams = pathParameters?.proxy?.split('/') || [];
    
    // Parse request data
    let requestData = {};
    if (event.headers['content-type']?.includes('multipart/form-data')) {
      requestData = await multipart.parse(event, true);
    } else if (body) {
      requestData = JSON.parse(body);
    }

    // Route to appropriate handler
    const handler = getHandler(pathParams[0], httpMethod);
    if (!handler) {
      return createResponse(404, { error: 'Endpoint not found' });
    }

    // Extract user from token
    const user = await extractUser(headers);
    if (!user) {
      return createResponse(401, { error: 'Authentication required' });
    }

    // Execute handler
    const result = await handler({
      path: pathParams,
      method: httpMethod,
      headers,
      body: requestData,
      user,
      isMultipart: event.headers['content-type']?.includes('multipart/form-data'),
    });

    return createResponse(200, result);
  } catch (error) {
    console.error('Music Lambda Error:', error);
    return createResponse(500, { 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// Route handlers
function getHandler(endpoint, method) {
  const routes = {
    'upload': {
      'POST': handleMusicUpload,
    },
    'tracks': {
      'GET': handleGetTracks,
      'POST': handleCreateTrack,
      'PUT': handleUpdateTrack,
      'DELETE': handleDeleteTrack,
    },
    'albums': {
      'GET': handleGetAlbums,
      'POST': handleCreateAlbum,
      'PUT': handleUpdateAlbum,
      'DELETE': handleDeleteAlbum,
    },
    'stems': {
      'GET': handleGetStems,
      'POST': handleCreateStem,
    },
    'analyze': {
      'POST': handleAnalyzeAudio,
    },
    'transcode': {
      'POST': handleTranscodeAudio,
    },
    'metadata': {
      'GET': handleGetMetadata,
      'PUT': handleUpdateMetadata,
    },
    'download': {
      'GET': handleDownload,
    },
    'streaming': {
      'GET': handleStreamingUrl,
    },
  };

  return routes[endpoint]?.[method];
}

// Music Upload Handler
async function handleMusicUpload({ body, user, isMultipart }) {
  try {
    if (!isMultipart) {
      throw new Error('Multipart form data required for file upload');
    }

    const { file, metadata } = body;
    if (!file) {
      throw new Error('No music file provided');
    }

    // Generate unique file ID
    const fileId = uuidv4();
    const fileName = `${user.id}/${fileId}/${file.filename}`;
    
    // Upload original file to S3
    const uploadParams = {
      Bucket: process.env.MUSIC_FILES_BUCKET,
      Key: `originals/${fileName}`,
      Body: file.content,
      ContentType: file.contentType,
      Metadata: {
        userId: user.id,
        originalName: file.filename,
        uploadedAt: new Date().toISOString(),
        ...metadata,
      },
    };

    const uploadResult = await s3.upload(uploadParams).promise();

    // Create database record
    const trackData = {
      id: fileId,
      userId: user.id,
      title: metadata?.title || file.filename,
      artist: metadata?.artist || user.name,
      album: metadata?.album || '',
      genre: metadata?.genre || '',
      duration: metadata?.duration || 0,
      fileSize: file.content.length,
      originalFileName: file.filename,
      s3Key: uploadParams.Key,
      s3Url: uploadResult.Location,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
      metadata: metadata || {},
    };

    await createTrackRecord(trackData);

    // Trigger async processing
    await triggerAudioProcessing(fileId, uploadParams.Key);

    return {
      success: true,
      trackId: fileId,
      uploadUrl: uploadResult.Location,
      message: 'Music uploaded successfully and processing started',
      track: trackData,
    };
  } catch (error) {
    console.error('Music upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

// Track Management
async function handleGetTracks({ user, path }) {
  try {
    const trackId = path[1];
    
    if (trackId) {
      // Get specific track
      const track = await getTrackById(trackId, user);
      return {
        success: true,
        track,
      };
    } else {
      // Get all user tracks
      const tracks = await getUserTracks(user.id);
      return {
        success: true,
        tracks,
        total: tracks.length,
      };
    }
  } catch (error) {
    throw new Error(`Failed to get tracks: ${error.message}`);
  }
}

async function handleCreateTrack({ body, user }) {
  try {
    const trackData = {
      id: uuidv4(),
      userId: user.id,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createTrackRecord(trackData);

    return {
      success: true,
      track: trackData,
      message: 'Track created successfully',
    };
  } catch (error) {
    throw new Error(`Failed to create track: ${error.message}`);
  }
}

async function handleUpdateTrack({ path, body, user }) {
  try {
    const trackId = path[1];
    if (!trackId) {
      throw new Error('Track ID required');
    }

    // Verify ownership
    const track = await getTrackById(trackId, user);
    if (!track) {
      throw new Error('Track not found or access denied');
    }

    const updates = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await updateTrackRecord(trackId, updates);

    const updatedTrack = await getTrackById(trackId, user);
    return {
      success: true,
      track: updatedTrack,
      message: 'Track updated successfully',
    };
  } catch (error) {
    throw new Error(`Failed to update track: ${error.message}`);
  }
}

async function handleDeleteTrack({ path, user }) {
  try {
    const trackId = path[1];
    if (!trackId) {
      throw new Error('Track ID required');
    }

    // Verify ownership
    const track = await getTrackById(trackId, user);
    if (!track) {
      throw new Error('Track not found or access denied');
    }

    // Delete files from S3
    await deleteTrackFiles(track.s3Key);

    // Delete database record
    await deleteTrackRecord(trackId);

    return {
      success: true,
      message: 'Track deleted successfully',
    };
  } catch (error) {
    throw new Error(`Failed to delete track: ${error.message}`);
  }
}

// Audio Processing
async function handleAnalyzeAudio({ body, user }) {
  try {
    const { trackId } = body;
    const track = await getTrackById(trackId, user);
    
    if (!track) {
      throw new Error('Track not found or access denied');
    }

    // Trigger audio analysis
    const analysisId = uuidv4();
    await triggerAudioAnalysis(trackId, track.s3Key, analysisId);

    return {
      success: true,
      analysisId,
      message: 'Audio analysis started',
    };
  } catch (error) {
    throw new Error(`Audio analysis failed: ${error.message}`);
  }
}

async function handleTranscodeAudio({ body, user }) {
  try {
    const { trackId, formats } = body;
    const track = await getTrackById(trackId, user);
    
    if (!track) {
      throw new Error('Track not found or access denied');
    }

    // Trigger transcoding for specified formats
    const jobId = uuidv4();
    await triggerTranscoding(trackId, track.s3Key, formats, jobId);

    return {
      success: true,
      jobId,
      message: 'Transcoding started',
      formats: formats || ['mp3', 'wav', 'flac'],
    };
  } catch (error) {
    throw new Error(`Transcoding failed: ${error.message}`);
  }
}

// Streaming and Download
async function handleStreamingUrl({ path, user }) {
  try {
    const trackId = path[1];
    const track = await getTrackById(trackId, user);
    
    if (!track) {
      throw new Error('Track not found or access denied');
    }

    // Generate pre-signed URL for streaming
    const streamingUrl = await generatePresignedUrl(track.s3Key, 'streaming');

    return {
      success: true,
      streamingUrl,
      track: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate streaming URL: ${error.message}`);
  }
}

async function handleDownload({ path, user }) {
  try {
    const trackId = path[1];
    const format = path[2] || 'original';
    
    const track = await getTrackById(trackId, user);
    if (!track) {
      throw new Error('Track not found or access denied');
    }

    // Generate download URL
    const s3Key = format === 'original' 
      ? track.s3Key 
      : `transcoded/${track.userId}/${trackId}/${format}/${track.originalFileName}`;

    const downloadUrl = await generatePresignedUrl(s3Key, 'download');

    return {
      success: true,
      downloadUrl,
      format,
      filename: track.originalFileName,
    };
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

// Utility Functions
async function extractUser(headers) {
  // Implementation similar to auth handler
  const authHeader = headers.Authorization || headers.authorization;
  if (!authHeader) return null;

  // Verify token and return user info
  // This would integrate with the auth Lambda or Cognito
  return {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    userRole: 'Artist',
  };
}

async function createTrackRecord(trackData) {
  // Store track record in Aurora database
  const params = {
    resourceArn: process.env.DATABASE_ARN,
    secretArn: process.env.DATABASE_SECRET_ARN,
    database: 'mscco_production',
    sql: `
      INSERT INTO tracks (
        id, user_id, title, artist, album, genre, duration, 
        file_size, original_file_name, s3_key, s3_url, status, 
        uploaded_at, metadata
      ) VALUES (
        :id, :userId, :title, :artist, :album, :genre, :duration,
        :fileSize, :originalFileName, :s3Key, :s3Url, :status,
        :uploadedAt, :metadata
      )
    `,
    parameters: [
      { name: 'id', value: { stringValue: trackData.id } },
      { name: 'userId', value: { stringValue: trackData.userId } },
      { name: 'title', value: { stringValue: trackData.title } },
      { name: 'artist', value: { stringValue: trackData.artist } },
      { name: 'album', value: { stringValue: trackData.album } },
      { name: 'genre', value: { stringValue: trackData.genre } },
      { name: 'duration', value: { longValue: trackData.duration } },
      { name: 'fileSize', value: { longValue: trackData.fileSize } },
      { name: 'originalFileName', value: { stringValue: trackData.originalFileName } },
      { name: 's3Key', value: { stringValue: trackData.s3Key } },
      { name: 's3Url', value: { stringValue: trackData.s3Url } },
      { name: 'status', value: { stringValue: trackData.status } },
      { name: 'uploadedAt', value: { stringValue: trackData.uploadedAt } },
      { name: 'metadata', value: { stringValue: JSON.stringify(trackData.metadata) } },
    ],
  };

  return rds.executeStatement(params).promise();
}

async function getTrackById(trackId, user) {
  const params = {
    resourceArn: process.env.DATABASE_ARN,
    secretArn: process.env.DATABASE_SECRET_ARN,
    database: 'mscco_production',
    sql: 'SELECT * FROM tracks WHERE id = :trackId AND user_id = :userId',
    parameters: [
      { name: 'trackId', value: { stringValue: trackId } },
      { name: 'userId', value: { stringValue: user.id } },
    ],
  };

  const result = await rds.executeStatement(params).promise();
  return result.records?.[0] ? parseRecord(result.records[0]) : null;
}

async function getUserTracks(userId) {
  const params = {
    resourceArn: process.env.DATABASE_ARN,
    secretArn: process.env.DATABASE_SECRET_ARN,
    database: 'mscco_production',
    sql: 'SELECT * FROM tracks WHERE user_id = :userId ORDER BY uploaded_at DESC',
    parameters: [
      { name: 'userId', value: { stringValue: userId } },
    ],
  };

  const result = await rds.executeStatement(params).promise();
  return result.records?.map(parseRecord) || [];
}

async function updateTrackRecord(trackId, updates) {
  const setClause = Object.keys(updates)
    .map(key => `${key} = :${key}`)
    .join(', ');

  const parameters = Object.entries(updates).map(([key, value]) => ({
    name: key,
    value: typeof value === 'string' 
      ? { stringValue: value }
      : { longValue: value },
  }));

  parameters.push({ name: 'trackId', value: { stringValue: trackId } });

  const params = {
    resourceArn: process.env.DATABASE_ARN,
    secretArn: process.env.DATABASE_SECRET_ARN,
    database: 'mscco_production',
    sql: `UPDATE tracks SET ${setClause} WHERE id = :trackId`,
    parameters,
  };

  return rds.executeStatement(params).promise();
}

async function deleteTrackRecord(trackId) {
  const params = {
    resourceArn: process.env.DATABASE_ARN,
    secretArn: process.env.DATABASE_SECRET_ARN,
    database: 'mscco_production',
    sql: 'DELETE FROM tracks WHERE id = :trackId',
    parameters: [
      { name: 'trackId', value: { stringValue: trackId } },
    ],
  };

  return rds.executeStatement(params).promise();
}

async function deleteTrackFiles(s3Key) {
  // Delete original file
  await s3.deleteObject({
    Bucket: process.env.MUSIC_FILES_BUCKET,
    Key: s3Key,
  }).promise();

  // Delete transcoded files (if any)
  const prefix = s3Key.replace('originals/', 'transcoded/');
  const listParams = {
    Bucket: process.env.MUSIC_FILES_BUCKET,
    Prefix: prefix,
  };

  const objects = await s3.listObjectsV2(listParams).promise();
  if (objects.Contents && objects.Contents.length > 0) {
    const deleteParams = {
      Bucket: process.env.MUSIC_FILES_BUCKET,
      Delete: {
        Objects: objects.Contents.map(obj => ({ Key: obj.Key })),
      },
    };
    await s3.deleteObjects(deleteParams).promise();
  }
}

async function triggerAudioProcessing(trackId, s3Key) {
  // Send message to SQS for background processing
  const message = {
    trackId,
    s3Key,
    action: 'process',
    timestamp: new Date().toISOString(),
  };

  const params = {
    QueueUrl: process.env.AUDIO_PROCESSING_QUEUE_URL,
    MessageBody: JSON.stringify(message),
  };

  return sqs.sendMessage(params).promise();
}

async function triggerAudioAnalysis(trackId, s3Key, analysisId) {
  const message = {
    trackId,
    s3Key,
    analysisId,
    action: 'analyze',
    timestamp: new Date().toISOString(),
  };

  const params = {
    QueueUrl: process.env.AUDIO_ANALYSIS_QUEUE_URL,
    MessageBody: JSON.stringify(message),
  };

  return sqs.sendMessage(params).promise();
}

async function triggerTranscoding(trackId, s3Key, formats, jobId) {
  const message = {
    trackId,
    s3Key,
    formats,
    jobId,
    action: 'transcode',
    timestamp: new Date().toISOString(),
  };

  const params = {
    QueueUrl: process.env.TRANSCODING_QUEUE_URL,
    MessageBody: JSON.stringify(message),
  };

  return sqs.sendMessage(params).promise();
}

async function generatePresignedUrl(s3Key, action) {
  const operation = action === 'download' ? 'getObject' : 'getObject';
  const params = {
    Bucket: process.env.MUSIC_FILES_BUCKET,
    Key: s3Key,
    Expires: 3600, // 1 hour
  };

  if (action === 'download') {
    params.ResponseContentDisposition = 'attachment';
  }

  return s3.getSignedUrl(operation, params);
}

function parseRecord(record) {
  const result = {};
  record.forEach((field, index) => {
    // Parse RDS Data API response format
    const key = Object.keys(field)[0];
    result[key] = field[key];
  });
  return result;
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}