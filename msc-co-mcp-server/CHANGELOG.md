# Changelog

All notable changes to the MSC & Co MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-08

### Added

#### 🎤 Artist Management
- **check_or_create_account** - New tool to check if an artist has an MSC & Co account or create one
  - Collects artist information (email, artist name, legal name)
  - Sets up payment method for royalty distribution (PayPal, Stripe, Bank Transfer)
  - Returns artist ID for use in other tools
  - Handles both new artist registration and existing artist lookup

#### 🎵 Music Distribution
- **upload_track** - New tool to upload audio files for distribution
  - Supports MP3, WAV, and FLAC formats
  - Reads files directly from local filesystem
  - Handles track metadata (title, genre, explicit content flag)
  - Uses multipart/form-data for efficient file uploads
  - Returns track ID and upload confirmation

- **submit_distribution** - New tool to submit tracks to streaming platforms
  - Upload and attach cover artwork (3000x3000px recommended)
  - Select target platforms (Spotify, Apple Music, YouTube Music, Amazon Music, Tidal, or all)
  - Set release date
  - Automatic artwork upload and processing
  - Returns release ID and expected live date

#### 💸 Payments
- **request_payout** - New tool to request payout of accumulated earnings
  - Request full balance or specific amount
  - Minimum payout threshold: £50
  - Supports configured payment method (PayPal, Stripe, Bank Transfer)
  - Returns payout ID, amount, ETA, and status
  - Tracks payout status (pending, processing, completed)

### Changed
- Updated README.md with comprehensive examples for all new tools
- Reorganized tool documentation by category (Artist Management, Music Distribution, Earnings & Payments, Analytics & Platform)
- Enhanced example usage section with real-world scenarios
- Updated package description to include new capabilities

### Technical
- Added file upload helper function (`uploadFile`) for multipart/form-data requests
- Added Node.js `fs` module for reading local files
- Added `path` module for file path handling
- Improved error handling for file operations
- Added file existence validation before upload attempts

### Documentation
- Created test-tools.js script for testing all tools
- Added CHANGELOG.md for version tracking
- Updated README with 8 detailed usage examples
- Added troubleshooting section for file upload issues

## [1.0.0] - 2024-10-28

### Added
- Initial release of MSC & Co MCP Server
- **get_releases** - Get all music releases with status filter
- **get_earnings** - Get earnings summary by timeframe and platform
- **get_wallet_balance** - Check current wallet balance and pending funds
- **get_analytics** - Get streaming analytics and performance metrics
- **create_release** - Create a new draft release
- **get_profile** - Get artist profile information
- **get_platform_stats** - Get overall platform statistics
- **get_release_details** - Get detailed info about a specific release
- **search_releases** - Search releases by title or genre
- **get_notifications** - Get recent platform notifications

### Technical
- MCP SDK integration (@modelcontextprotocol/sdk v0.5.0)
- Bearer token authentication
- Environment-based configuration (MSC_CO_API_KEY, MSC_CO_API_URL)
- StdioServerTransport for Claude Desktop/Cursor integration
- Comprehensive error handling and API response formatting

---

## Version History Summary

- **v1.1.0** - Added artist onboarding, track uploads, distribution submission, and payout requests
- **v1.0.0** - Initial release with 10 core tools for music management and analytics
