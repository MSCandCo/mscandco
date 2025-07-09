# 🚀 MSC & CO TEST ENVIRONMENT SETUP GUIDE

## 📋 Overview
This guide will help you set up a comprehensive test environment for the MSC & Co platform with all test users and sample data.

## 🔐 STEP 1: AUTH0 USER CREATION

### Manual Auth0 User Creation
1. **Access Auth0 Dashboard**: Go to https://manage.auth0.com/
2. **Navigate to Users**: Select your application domain
3. **Create Users**: Add the following users manually:

#### SUPER ADMIN USER
- **Email**: superadmin@mscandco.com
- **Password**: Test@2025
- **Name**: Super Admin
- **Nickname**: MSC Admin
- **User Metadata**:
  ```json
  {
    "username": "superadmin",
    "role": "super_admin",
    "brand": "MSC & Co",
    "stageName": "MSC Admin",
    "firstName": "Super",
    "lastName": "Admin"
  }
  ```

#### YHWH MSC USERS
- **Email**: admin@yhwhmsc.com
- **Password**: Test@2025
- **Name**: YHWH Admin
- **Nickname**: YHWH Admin
- **User Metadata**:
  ```json
  {
    "username": "yhwh_admin",
    "role": "company_admin",
    "brand": "YHWH MSC",
    "stageName": "YHWH Admin",
    "firstName": "YHWH",
    "lastName": "Admin"
  }
  ```

- **Email**: artist1@yhwhmsc.com
- **Password**: Test@2025
- **Name**: Grace Johnson
- **Nickname**: Grace Johnson
- **User Metadata**:
  ```json
  {
    "username": "yhwh_artist1",
    "role": "artist",
    "brand": "YHWH MSC",
    "stageName": "Grace Johnson",
    "firstName": "Grace",
    "lastName": "Johnson"
  }
  ```

- **Email**: artist2@yhwhmsc.com
- **Password**: Test@2025
- **Name**: Michael Thompson
- **Nickname**: Michael T
- **User Metadata**:
  ```json
  {
    "username": "yhwh_artist2",
    "role": "artist",
    "brand": "YHWH MSC",
    "stageName": "Michael T",
    "firstName": "Michael",
    "lastName": "Thompson"
  }
  ```

#### AUDIO MSC USERS
- **Email**: admin@audiomsc.com
- **Password**: Test@2025
- **Name**: Audio Admin
- **Nickname**: Audio Admin
- **User Metadata**:
  ```json
  {
    "username": "audio_admin",
    "role": "company_admin",
    "brand": "Audio MSC",
    "stageName": "Audio Admin",
    "firstName": "Audio",
    "lastName": "Admin"
  }
  ```

- **Email**: artist1@audiomsc.com
- **Password**: Test@2025
- **Name**: Sarah Chen
- **Nickname**: Sarah Chen
- **User Metadata**:
  ```json
  {
    "username": "audio_artist1",
    "role": "artist",
    "brand": "Audio MSC",
    "stageName": "Sarah Chen",
    "firstName": "Sarah",
    "lastName": "Chen"
  }
  ```

- **Email**: artist2@audiomsc.com
- **Password**: Test@2025
- **Name**: David Martinez
- **Nickname**: David M
- **User Metadata**:
  ```json
  {
    "username": "audio_artist2",
    "role": "artist",
    "brand": "Audio MSC",
    "stageName": "David M",
    "firstName": "David",
    "lastName": "Martinez"
  }
  ```

#### DISTRIBUTION PARTNERS
- **Email**: distadmin@mscandco.com
- **Password**: Test@2025
- **Name**: Distribution Admin
- **Nickname**: Dist Admin
- **User Metadata**:
  ```json
  {
    "username": "dist_admin",
    "role": "distribution_partner_admin",
    "brand": "MSC & Co",
    "stageName": "Dist Admin",
    "firstName": "Distribution",
    "lastName": "Admin"
  }
  ```

- **Email**: distributor1@mscandco.com
- **Password**: Test@2025
- **Name**: John Distributor
- **Nickname**: John D
- **User Metadata**:
  ```json
  {
    "username": "distributor1",
    "role": "distributor",
    "brand": "MSC & Co",
    "stageName": "John D",
    "firstName": "John",
    "lastName": "Distributor"
  }
  ```

## 🎵 STEP 2: STRAPI CONTENT CREATION

### Access Strapi Admin
1. **Go to**: http://localhost:1337/admin
2. **Create Admin Account**: If first time, create admin account
3. **Navigate to Content Manager**

### Create Artist Profiles

#### Grace Johnson (YHWH MSC)
- **Name**: Grace Johnson
- **Email**: artist1@yhwhmsc.com
- **Brand**: YHWH MSC
- **Bio**: Professional YHWH MSC artist with a passion for creating meaningful gospel and worship music.
- **Social Media**:
  - Instagram: @yhwh_artist1
  - Twitter: @yhwh_artist1
  - Facebook: yhwh_artist1
- **Genres**: Gospel, Worship
- **Location**: United States
- **Status**: Active

#### Michael T (YHWH MSC)
- **Name**: Michael T
- **Email**: artist2@yhwhmsc.com
- **Brand**: YHWH MSC
- **Bio**: Professional YHWH MSC artist specializing in gospel rock and contemporary worship.
- **Social Media**:
  - Instagram: @yhwh_artist2
  - Twitter: @yhwh_artist2
  - Facebook: yhwh_artist2
- **Genres**: Gospel, Worship
- **Location**: United States
- **Status**: Active

#### Sarah Chen (Audio MSC)
- **Name**: Sarah Chen
- **Email**: artist1@audiomsc.com
- **Brand**: Audio MSC
- **Bio**: Professional Audio MSC artist creating synthwave and pop music.
- **Social Media**:
  - Instagram: @audio_artist1
  - Twitter: @audio_artist1
  - Facebook: audio_artist1
- **Genres**: Pop, Electronic
- **Location**: United States
- **Status**: Active

#### David M (Audio MSC)
- **Name**: David M
- **Email**: artist2@audiomsc.com
- **Brand**: Audio MSC
- **Bio**: Professional Audio MSC artist specializing in indie rock and electronic music.
- **Social Media**:
  - Instagram: @audio_artist2
  - Twitter: @audio_artist2
  - Facebook: audio_artist2
- **Genres**: Indie Rock, Electronic
- **Location**: United States
- **Status**: Active

### Create Sample Songs

#### YHWH MSC Songs

**1. Heaven's Glory**
- **Title**: Heaven's Glory
- **Artist**: Grace Johnson
- **Genre**: Contemporary Gospel
- **Duration**: 4:23
- **BPM**: 128
- **Key**: C Major
- **Mood**: Uplifting
- **Brand**: YHWH MSC
- **Description**: A powerful contemporary gospel anthem celebrating God's glory
- **Lyrics**: Heaven's glory fills the earth...
- **Tags**: gospel, worship, uplifting, contemporary
- **Streams**: 15420
- **Earnings**: $1250.50
- **Release Date**: 2024-01-15
- **Status**: Published

**2. Grace Abounds**
- **Title**: Grace Abounds
- **Artist**: Grace Johnson
- **Genre**: Worship
- **Duration**: 3:45
- **BPM**: 85
- **Key**: G Major
- **Mood**: Peaceful
- **Brand**: YHWH MSC
- **Description**: A peaceful worship song about God's abundant grace
- **Lyrics**: Grace abounds in every season...
- **Tags**: worship, peaceful, grace, meditation
- **Streams**: 8920
- **Earnings**: $750.25
- **Release Date**: 2024-02-20
- **Status**: Published

**3. Mighty Redeemer**
- **Title**: Mighty Redeemer
- **Artist**: Michael T
- **Genre**: Gospel Rock
- **Duration**: 5:12
- **BPM**: 140
- **Key**: E Minor
- **Mood**: Powerful
- **Brand**: YHWH MSC
- **Description**: A powerful gospel rock anthem about redemption
- **Lyrics**: Mighty Redeemer, strong to save...
- **Tags**: gospel, rock, powerful, redemption
- **Streams**: 18750
- **Earnings**: $1650.75
- **Release Date**: 2024-03-10
- **Status**: Published

**4. Holy Spirit Flow**
- **Title**: Holy Spirit Flow
- **Artist**: Michael T
- **Genre**: Contemporary Worship
- **Duration**: 4:56
- **BPM**: 92
- **Key**: D Major
- **Mood**: Spiritual
- **Brand**: YHWH MSC
- **Description**: A spiritual worship song inviting the Holy Spirit
- **Lyrics**: Holy Spirit flow through me...
- **Tags**: worship, spiritual, holy spirit, contemporary
- **Streams**: 12340
- **Earnings**: $1100.00
- **Release Date**: 2024-04-05
- **Status**: Published

**5. Jesus Saves**
- **Title**: Jesus Saves
- **Artist**: Grace Johnson & Michael T
- **Genre**: Traditional Gospel
- **Duration**: 3:38
- **BPM**: 110
- **Key**: F Major
- **Mood**: Joyful
- **Brand**: YHWH MSC
- **Description**: A joyful collaboration celebrating salvation
- **Lyrics**: Jesus saves, Jesus saves...
- **Tags**: gospel, collaboration, joyful, salvation
- **Streams**: 22100
- **Earnings**: $1950.50
- **Release Date**: 2024-05-15
- **Status**: Published

**6. Breakthrough**
- **Title**: Breakthrough
- **Artist**: Grace Johnson
- **Genre**: Modern Worship
- **Duration**: 4:45
- **BPM**: 125
- **Key**: A Major
- **Mood**: Triumphant
- **Brand**: YHWH MSC
- **Description**: A triumphant modern worship song about breakthrough
- **Lyrics**: Breakthrough is coming, breakthrough is here...
- **Tags**: worship, triumphant, breakthrough, modern
- **Streams**: 16890
- **Earnings**: $1450.25
- **Release Date**: 2024-06-20
- **Status**: Published

#### Audio MSC Songs

**7. Midnight Drive**
- **Title**: Midnight Drive
- **Artist**: Sarah Chen
- **Genre**: Synthwave
- **Duration**: 3:28
- **BPM**: 115
- **Key**: B Minor
- **Mood**: Nostalgic
- **Brand**: Audio MSC
- **Description**: A nostalgic synthwave track perfect for night driving
- **Tags**: synthwave, nostalgic, electronic, night
- **Streams**: 23450
- **Earnings**: $2100.75
- **Release Date**: 2024-01-10
- **Status**: Published

**8. Summer Nights**
- **Title**: Summer Nights
- **Artist**: Sarah Chen
- **Genre**: Pop
- **Duration**: 3:15
- **BPM**: 120
- **Key**: C Major
- **Mood**: Happy
- **Brand**: Audio MSC
- **Description**: A happy pop song about summer romance
- **Tags**: pop, happy, summer, romance
- **Streams**: 18920
- **Earnings**: $1700.50
- **Release Date**: 2024-02-15
- **Status**: Published

**9. Electric Dreams**
- **Title**: Electric Dreams
- **Artist**: David M
- **Genre**: Electronic
- **Duration**: 4:32
- **BPM**: 130
- **Key**: F# Minor
- **Mood**: Energetic
- **Brand**: Audio MSC
- **Description**: An energetic electronic track with futuristic vibes
- **Tags**: electronic, energetic, futuristic, dance
- **Streams**: 15670
- **Earnings**: $1400.25
- **Release Date**: 2024-03-20
- **Status**: Published

**10. City Lights**
- **Title**: City Lights
- **Artist**: David M
- **Genre**: Indie Rock
- **Duration**: 4:02
- **BPM**: 105
- **Key**: G Minor
- **Mood**: Melancholic
- **Brand**: Audio MSC
- **Description**: A melancholic indie rock song about urban life
- **Tags**: indie rock, melancholic, urban, atmospheric
- **Streams**: 9870
- **Earnings**: $850.75
- **Release Date**: 2024-04-25
- **Status**: Published

**11. Together We Rise**
- **Title**: Together We Rise
- **Artist**: Sarah Chen & David M
- **Genre**: Anthemic Pop
- **Duration**: 4:18
- **BPM**: 128
- **Key**: D Major
- **Mood**: Inspiring
- **Brand**: Audio MSC
- **Description**: An inspiring anthem about unity and strength
- **Tags**: pop, anthemic, inspiring, unity
- **Streams**: 28750
- **Earnings**: $2600.00
- **Release Date**: 2024-05-30
- **Status**: Published

### Create Sample Projects

#### YHWH MSC Projects

**1. Worship Sessions Vol. 1**
- **Title**: Worship Sessions Vol. 1
- **Artist**: Grace Johnson
- **Type**: Album
- **Status**: In Progress
- **Release Date**: 2025-03-15
- **Brand**: YHWH MSC
- **Description**: A collection of contemporary worship songs
- **Songs**: Heaven's Glory, Grace Abounds, Breakthrough
- **Genre**: Contemporary Worship
- **Target Audience**: Christian worship communities

**2. Gospel Collaboration EP**
- **Title**: Gospel Collaboration EP
- **Artist**: Grace Johnson & Michael T
- **Type**: EP
- **Status**: Planning
- **Release Date**: 2025-05-20
- **Brand**: YHWH MSC
- **Description**: A collaborative gospel EP featuring both artists
- **Songs**: Jesus Saves
- **Genre**: Gospel
- **Target Audience**: Gospel music fans

**3. Revival Tour Recordings**
- **Title**: Revival Tour Recordings
- **Artist**: Michael T
- **Type**: Live Album
- **Status**: Recording
- **Release Date**: 2025-06-10
- **Brand**: YHWH MSC
- **Description**: Live recordings from the revival tour
- **Songs**: Mighty Redeemer, Holy Spirit Flow
- **Genre**: Gospel Rock
- **Target Audience**: Live music enthusiasts

#### Audio MSC Projects

**4. Neon Nights Album**
- **Title**: Neon Nights Album
- **Artist**: Sarah Chen
- **Type**: Album
- **Status**: Mixing
- **Release Date**: 2025-04-15
- **Brand**: Audio MSC
- **Description**: A full-length synthwave album
- **Songs**: Midnight Drive, Summer Nights
- **Genre**: Synthwave
- **Target Audience**: Electronic music fans

**5. Indie Collective LP**
- **Title**: Indie Collective LP
- **Artist**: David M
- **Type**: Album
- **Status**: In Progress
- **Release Date**: 2025-07-20
- **Brand**: Audio MSC
- **Description**: A collaborative indie rock album
- **Songs**: Electric Dreams, City Lights
- **Genre**: Indie Rock
- **Target Audience**: Indie music listeners

**6. Summer Hits Compilation**
- **Title**: Summer Hits Compilation
- **Artist**: Sarah Chen & David M
- **Type**: Compilation
- **Status**: Planning
- **Release Date**: 2025-08-15
- **Brand**: Audio MSC
- **Description**: A summer compilation featuring both artists
- **Songs**: Together We Rise
- **Genre**: Pop
- **Target Audience**: Pop music fans

#### Cross-Platform Project

**7. Music for Change**
- **Title**: Music for Change
- **Artist**: Various Artists
- **Type**: Charity Compilation
- **Status**: Concept
- **Release Date**: 2025-12-01
- **Brand**: MSC & Co
- **Description**: A charity compilation featuring artists from both brands
- **Songs**: Heaven's Glory, Together We Rise
- **Genre**: Various
- **Target Audience**: Music for social change

### Create AI Scoring Data

#### Grace Johnson Analysis
- **Artist**: Grace Johnson
- **Insight Type**: Performance
- **Confidence**: 85%
- **Priority**: High
- **Title**: AI Analysis: Grace Johnson
- **Description**: Comprehensive AI analysis for Grace Johnson
- **Data**:
  - Creativity Index: 8.5
  - Commercial Potential: 7.8
  - Market Fit: 9.2
  - Technical Skill: 8.9
  - Innovation Score: 7.6
  - Audience Engagement: 8.7
- **Recommendations**:
  - Focus on contemporary worship market
  - Develop more collaborative projects
  - Expand into digital streaming platforms
- **Status**: Reviewed

#### Michael T Analysis
- **Artist**: Michael T
- **Insight Type**: Performance
- **Confidence**: 85%
- **Priority**: High
- **Title**: AI Analysis: Michael T
- **Description**: Comprehensive AI analysis for Michael T
- **Data**:
  - Creativity Index: 8.2
  - Commercial Potential: 8.1
  - Market Fit: 8.8
  - Technical Skill: 8.5
  - Innovation Score: 8.3
  - Audience Engagement: 8.4
- **Recommendations**:
  - Explore gospel rock fusion
  - Develop live performance content
  - Target younger gospel audience
- **Status**: Reviewed

#### Sarah Chen Analysis
- **Artist**: Sarah Chen
- **Insight Type**: Performance
- **Confidence**: 85%
- **Priority**: High
- **Title**: AI Analysis: Sarah Chen
- **Description**: Comprehensive AI analysis for Sarah Chen
- **Data**:
  - Creativity Index: 9.1
  - Commercial Potential: 8.7
  - Market Fit: 8.9
  - Technical Skill: 9.0
  - Innovation Score: 8.8
  - Audience Engagement: 8.6
- **Recommendations**:
  - Expand into film/TV licensing
  - Develop more pop crossover hits
  - Explore international markets
- **Status**: Reviewed

#### David M Analysis
- **Artist**: David M
- **Insight Type**: Performance
- **Confidence**: 85%
- **Priority**: High
- **Title**: AI Analysis: David M
- **Description**: Comprehensive AI analysis for David M
- **Data**:
  - Creativity Index: 8.8
  - Commercial Potential: 7.9
  - Market Fit: 8.3
  - Technical Skill: 8.7
  - Innovation Score: 8.5
  - Audience Engagement: 8.2
- **Recommendations**:
  - Focus on indie rock authenticity
  - Develop atmospheric soundscapes
  - Target alternative radio markets
- **Status**: Reviewed

### Create Analytics Data

#### Platform Analytics
- **Total Streams**: 189,450
- **Total Earnings**: $16,850.25
- **Monthly Growth**: 12.5%
- **Top Genres**: Gospel, Pop, Electronic, Worship, Indie Rock
- **Top Markets**: United States, United Kingdom, Canada, Australia, Germany
- **Period**: 2024-2025
- **Brand**: MSC & Co

#### Audience Demographics
- **Age Groups**:
  - 18-24: 25%
  - 25-34: 35%
  - 35-44: 22%
  - 45-54: 12%
  - 55+: 6%
- **Gender**:
  - Female: 58%
  - Male: 42%

## 🧪 STEP 3: TESTING THE PLATFORM

### Test User Login
1. **Go to**: http://localhost:3000
2. **Click Login**: Test with each user account
3. **Verify Brand Switching**: Test YHWH MSC vs Audio MSC
4. **Check Role Access**: Verify different user permissions

### Test Features
1. **Dashboard**: Verify analytics and data display
2. **Song Management**: Test song upload and editing
3. **Project Management**: Test project creation and collaboration
4. **Analytics**: Verify real-time data and reports
5. **Export Features**: Test PDF/Excel generation
6. **AI Insights**: Verify AI scoring and recommendations

## 🎯 STEP 4: COMPREHENSIVE TESTING

### User Journey Testing
1. **Registration Flow**: Test multi-step registration
2. **Profile Setup**: Complete artist profiles
3. **Content Upload**: Upload songs and projects
4. **Collaboration**: Test artist collaborations
5. **Analytics Review**: Check performance metrics
6. **Export Generation**: Test report generation

### Performance Testing
1. **Page Load Times**: Should be under 2 seconds
2. **API Response**: Should be under 100ms
3. **Concurrent Users**: Test with multiple users
4. **Data Loading**: Verify smooth data display

### Security Testing
1. **Authentication**: Test login/logout
2. **Authorization**: Verify role-based access
3. **Data Protection**: Check sensitive data handling
4. **Input Validation**: Test form security

## 🎉 SUCCESS CRITERIA

### ✅ Platform Ready When:
- [ ] All test users can login successfully
- [ ] Brand switching works correctly
- [ ] All sample data is visible
- [ ] Analytics dashboard loads properly
- [ ] Export features work correctly
- [ ] AI insights are displayed
- [ ] Performance meets targets
- [ ] Security measures are active

## 🔗 ACCESS INFORMATION

### Frontend
- **URL**: http://localhost:3000
- **Status**: ✅ Running

### Backend Admin
- **URL**: http://localhost:1337/admin
- **Status**: ✅ Running

### Test Users
All users use password: `Test@2025`

### Database
- **Type**: PostgreSQL
- **Status**: ✅ Healthy
- **Tables**: 82 content types created

## 📞 SUPPORT

If you encounter any issues during setup:
1. Check Docker container status
2. Verify environment variables
3. Review application logs
4. Test individual services

---

**🎵 Your MSC & Co platform is ready for revolutionary music distribution!** 