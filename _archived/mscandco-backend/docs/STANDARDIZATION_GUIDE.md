# Status and Genre Standardization Guide

## Overview

This document outlines the complete standardization of status and genre values across the entire Audiostems platform. All components now use the same comprehensive set of values, ensuring consistency and maintainability.

## 🎯 Standardized Values

### Status Options
```javascript
RELEASE_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  COMPLETED: 'completed',
  LIVE: 'live'
}
```

**Workflow:**
1. **Draft** - Artist creates initial release
2. **Submitted** - Artist submits for review
3. **Under Review** - Distribution partner reviews
4. **Completed** - Approved and processed
5. **Live** - Released on DSPs

### Genre Options (26 genres)
```javascript
GENRES = [
  'Acoustic', 'Alternative', 'Ambient', 'Blues', 'Classical',
  'Country', 'Dance', 'Electronic', 'Experimental', 'Folk',
  'Funk', 'Gospel', 'Hip Hop', 'House', 'Indie', 'Jazz',
  'Latin', 'Metal', 'Pop', 'Punk', 'R&B', 'Reggae',
  'Rock', 'Soul', 'Techno', 'World'
]
```

### Release Types
```javascript
RELEASE_TYPES = ['Single', 'EP', 'Album', 'Mixtape']
```

## 📁 File Structure

### Frontend (`audiostems-frontend/`)
- `lib/constants.js` - Centralized constants
- `components/releases/CreateReleaseModal.js` - Updated form
- `pages/artist/releases.js` - Updated artist dashboard
- `pages/distribution-partner/dashboard.js` - Updated DP dashboard

### Backend (`audiostems-backend/`)
- `lib/constants.js` - Backend constants
- `src/middlewares/validation.js` - API validation
- `src/api/project/content-types/project/schema.json` - Updated schema
- `src/components/project/track-listing.json` - Updated track component
- `scripts/migrate-status-genre.js` - Data migration script
- `scripts/test-standardization.js` - Testing script
- `database/migrations/20241201_standardize_status_genre.js` - DB migration

## 🔧 Implementation Details

### 1. Database Schema Updates

**Project Table:**
- `status`: ENUM with 5 standardized values
- `genre`: ENUM with 26 standardized values (was relation)
- `release_type`: ENUM with 4 standardized values

**Track Listing Component:**
- Added `bpm`: INTEGER (nullable)
- Added `song_key`: STRING (nullable)
- Added `isrc`: STRING (nullable)

### 2. API Validation

**Validation Middleware:**
- `validateProjectData()` - Validates all project fields
- `validateStatusUpdate()` - Validates status changes
- `validateGenreUpdate()` - Validates genre changes

**Validation Rules:**
- Status must be one of 5 standardized values
- Genre must be one of 26 standardized values
- Release type must be one of 4 standardized values
- BPM must be number between 1-999
- Song key and ISRC must be strings

### 3. Data Migration

**Migration Script Features:**
- Maps old status values to new standardized values
- Maps old genre relations to standardized enum values
- Maps old release types to standardized values
- Adds BPM, Key, and ISRC fields to track listings
- Provides detailed logging of all changes

**Status Mapping:**
```javascript
{
  'in_progress': 'submitted',
  'approved': 'completed',
  'scheduled': 'under_review',
  'released': 'live',
  'cancelled': 'draft'
}
```

**Genre Mapping:**
```javascript
{
  'Electronic Music': 'Electronic',
  'Hip-Hop': 'Hip Hop',
  'R&B/Soul': 'R&B',
  'Rock & Roll': 'Rock',
  // ... 20+ more mappings
}
```

## 🚀 Deployment Steps

### 1. Database Migration
```bash
# Run the database migration
cd audiostems-backend
npm run strapi migrate
```

### 2. Data Migration
```bash
# Run the data migration script
cd audiostems-backend
node scripts/migrate-status-genre.js
```

### 3. Testing
```bash
# Run the standardization tests
cd audiostems-backend
node scripts/test-standardization.js
```

### 4. Frontend Deployment
```bash
# Deploy frontend changes
cd audiostems-frontend
npm run build
```

## 🧪 Testing

### Automated Tests
The testing script verifies:
- ✅ Constants are properly defined
- ✅ Helper functions work correctly
- ✅ API validation functions properly
- ✅ Database contains only standardized values
- ✅ Track listing fields are present
- ✅ Frontend-backend consistency

### Manual Testing Checklist
- [ ] Artist can create releases with standardized genres
- [ ] Artist can select from standardized status options
- [ ] Distribution partner sees standardized values
- [ ] API returns standardized values
- [ ] Migration script runs without errors
- [ ] All existing data is properly migrated

## 🔄 Rollback Plan

### If Issues Occur:
1. **Database Rollback:**
   ```bash
   npm run strapi migrate:rollback
   ```

2. **Frontend Rollback:**
   - Revert to previous commit
   - Rebuild and redeploy

3. **Data Rollback:**
   - Restore from backup
   - Run rollback migration

## 📊 Benefits

### 1. Consistency
- Same genres everywhere
- Same status workflow everywhere
- Same terminology everywhere

### 2. Maintainability
- Single source of truth for all values
- Easy to add new genres/statuses
- Centralized validation

### 3. Professional Standards
- Comprehensive genre coverage
- Clear status workflow
- Industry-standard terminology

### 4. Developer Experience
- Type-safe constants
- Helper functions for common operations
- Clear validation rules

## 🆕 Adding New Values

### To Add a New Genre:
1. Add to `GENRES` array in both frontend and backend `lib/constants.js`
2. Update database schema if needed
3. Update validation middleware
4. Test thoroughly

### To Add a New Status:
1. Add to `RELEASE_STATUSES` in both frontend and backend
2. Add corresponding label and color
3. Update database schema
4. Update validation middleware
5. Test thoroughly

## 📞 Support

For questions or issues with the standardization:
1. Check the testing script output
2. Review migration logs
3. Verify database schema
4. Test API endpoints manually

## 🎉 Success Metrics

- ✅ All components use standardized values
- ✅ No duplicate or inconsistent values
- ✅ API validation prevents invalid data
- ✅ Migration completed successfully
- ✅ All tests pass
- ✅ Frontend and backend are synchronized 