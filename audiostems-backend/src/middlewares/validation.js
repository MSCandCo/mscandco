const { RELEASE_STATUSES, GENRES, RELEASE_TYPES } = require('../../lib/constants');

// Validation middleware for project/release data
const validateProjectData = (req, res, next) => {
  const { status, genre, releaseType, trackListing } = req.body;

  // Validate status
  if (status && !Object.values(RELEASE_STATUSES).includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: `Status must be one of: ${Object.values(RELEASE_STATUSES).join(', ')}`,
      validStatuses: Object.values(RELEASE_STATUSES)
    });
  }

  // Validate genre
  if (genre && !GENRES.includes(genre)) {
    return res.status(400).json({
      error: 'Invalid genre',
      message: `Genre must be one of: ${GENRES.join(', ')}`,
      validGenres: GENRES
    });
  }

  // Validate release type
  if (releaseType && !RELEASE_TYPES.includes(releaseType)) {
    return res.status(400).json({
      error: 'Invalid release type',
      message: `Release type must be one of: ${RELEASE_TYPES.join(', ')}`,
      validReleaseTypes: RELEASE_TYPES
    });
  }

  // Validate track listing if provided
  if (trackListing && Array.isArray(trackListing)) {
    for (let i = 0; i < trackListing.length; i++) {
      const track = trackListing[i];
      
      // Validate BPM if provided
      if (track.bpm && (typeof track.bpm !== 'number' || track.bpm < 1 || track.bpm > 999)) {
        return res.status(400).json({
          error: 'Invalid BPM',
          message: `BPM must be a number between 1 and 999`,
          trackIndex: i
        });
      }

      // Validate song key if provided
      if (track.songKey && typeof track.songKey !== 'string') {
        return res.status(400).json({
          error: 'Invalid song key',
          message: `Song key must be a string`,
          trackIndex: i
        });
      }

      // Validate ISRC if provided
      if (track.isrc && typeof track.isrc !== 'string') {
        return res.status(400).json({
          error: 'Invalid ISRC',
          message: `ISRC must be a string`,
          trackIndex: i
        });
      }
    }
  }

  next();
};

// Validation middleware for status updates
const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;

  if (status && !Object.values(RELEASE_STATUSES).includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: `Status must be one of: ${Object.values(RELEASE_STATUSES).join(', ')}`,
      validStatuses: Object.values(RELEASE_STATUSES)
    });
  }

  next();
};

// Validation middleware for genre updates
const validateGenreUpdate = (req, res, next) => {
  const { genre } = req.body;

  if (genre && !GENRES.includes(genre)) {
    return res.status(400).json({
      error: 'Invalid genre',
      message: `Genre must be one of: ${GENRES.join(', ')}`,
      validGenres: GENRES
    });
  }

  next();
};

module.exports = {
  validateProjectData,
  validateStatusUpdate,
  validateGenreUpdate
}; 