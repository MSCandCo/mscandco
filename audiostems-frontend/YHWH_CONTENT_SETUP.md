# 🎵 YHWH MSC CONTENT SETUP GUIDE

## 📋 Overview
This guide will help you create YHWH MSC sample content including songs and projects with rich metadata and proper artist associations through the Strapi admin interface.

## 🎯 YHWH MSC Content to Create

### YHWH MSC SONGS (6 songs)

#### 1. "Heaven's Glory" - yhwh_artist1
- **Title**: Heaven's Glory
- **Artist**: yhwh_artist1
- **Genre**: Contemporary Gospel
- **Duration**: 4:23
- **BPM**: 128
- **Key**: C Major
- **Mood**: Uplifting
- **Description**: An uplifting contemporary gospel song that celebrates the glory of heaven and the majesty of God.
- **Lyrics**: Heaven's glory shines so bright, lifting hearts to new heights...
- **Status**: published
- **Brand**: YHWH MSC
- **Tags**: gospel, worship, uplifting, contemporary
- **Streaming URL**: https://streaming.yhwhmsc.com/heavens-glory
- **Download URL**: https://download.yhwhmsc.com/heavens-glory

#### 2. "Grace Abounds" - yhwh_artist1
- **Title**: Grace Abounds
- **Artist**: yhwh_artist1
- **Genre**: Worship
- **Duration**: 3:45
- **BPM**: 85
- **Key**: G Major
- **Mood**: Peaceful
- **Description**: A peaceful worship song about the abundant grace of God that flows freely to all who believe.
- **Lyrics**: Grace abounds in every moment, peace that passes understanding...
- **Status**: published
- **Brand**: YHWH MSC
- **Tags**: worship, peaceful, grace, meditation
- **Streaming URL**: https://streaming.yhwhmsc.com/grace-abounds
- **Download URL**: https://download.yhwhmsc.com/grace-abounds

#### 3. "Mighty Redeemer" - yhwh_artist2
- **Title**: Mighty Redeemer
- **Artist**: yhwh_artist2
- **Genre**: Gospel Rock
- **Duration**: 5:12
- **BPM**: 140
- **Key**: E Minor
- **Mood**: Powerful
- **Description**: A powerful gospel rock anthem celebrating the mighty redeeming power of Jesus Christ.
- **Lyrics**: Mighty Redeemer, strong and true, breaking chains and making new...
- **Status**: published
- **Brand**: YHWH MSC
- **Tags**: gospel, rock, powerful, redemption
- **Streaming URL**: https://streaming.yhwhmsc.com/mighty-redeemer
- **Download URL**: https://download.yhwhmsc.com/mighty-redeemer

#### 4. "Holy Spirit Flow" - yhwh_artist2
- **Title**: Holy Spirit Flow
- **Artist**: yhwh_artist2
- **Genre**: Contemporary Worship
- **Duration**: 4:56
- **BPM**: 92
- **Key**: D Major
- **Mood**: Spiritual
- **Description**: A spiritual contemporary worship song inviting the Holy Spirit to flow freely in our lives.
- **Lyrics**: Holy Spirit flow, fill this place with Your presence...
- **Status**: published
- **Brand**: YHWH MSC
- **Tags**: worship, spiritual, holy spirit, contemporary
- **Streaming URL**: https://streaming.yhwhmsc.com/holy-spirit-flow
- **Download URL**: https://download.yhwhmsc.com/holy-spirit-flow

#### 5. "Jesus Saves" - Collaboration (yhwh_artist1 & yhwh_artist2)
- **Title**: Jesus Saves
- **Artist**: Collaboration (yhwh_artist1 & yhwh_artist2)
- **Genre**: Traditional Gospel
- **Duration**: 3:38
- **BPM**: 110
- **Key**: F Major
- **Mood**: Joyful
- **Description**: A joyful traditional gospel collaboration celebrating the saving power of Jesus Christ.
- **Lyrics**: Jesus saves, Jesus saves, He's the one who makes us whole...
- **Status**: published
- **Brand**: YHWH MSC
- **Tags**: gospel, traditional, joyful, collaboration
- **Streaming URL**: https://streaming.yhwhmsc.com/jesus-saves
- **Download URL**: https://download.yhwhmsc.com/jesus-saves

#### 6. "Breakthrough" - yhwh_artist1
- **Title**: Breakthrough
- **Artist**: yhwh_artist1
- **Genre**: Modern Worship
- **Duration**: 4:45
- **BPM**: 125
- **Key**: A Major
- **Mood**: Triumphant
- **Description**: A triumphant modern worship song about breakthrough and victory through faith in Christ.
- **Lyrics**: Breakthrough is coming, victory is near, trust in the Lord and have no fear...
- **Status**: published
- **Brand**: YHWH MSC
- **Tags**: worship, modern, triumphant, breakthrough
- **Streaming URL**: https://streaming.yhwhmsc.com/breakthrough
- **Download URL**: https://download.yhwhmsc.com/breakthrough

### YHWH MSC PROJECTS (3 projects)

#### 1. "Worship Sessions Vol. 1" - yhwh_artist1
- **Title**: Worship Sessions Vol. 1
- **Artist**: yhwh_artist1
- **Type**: Album
- **Description**: A collection of powerful worship sessions featuring contemporary gospel and modern worship songs.
- **Status**: In Progress
- **Release Date**: 2025-03-15
- **Brand**: YHWH MSC
- **Genre**: Contemporary Gospel
- **Tracks**: 4
- **Total Duration**: 16:49
- **Collaborators**: []
- **Tags**: worship, album, gospel, contemporary
- **Cover Art**: https://assets.yhwhmsc.com/worship-sessions-vol1.jpg
- **Streaming URL**: https://streaming.yhwhmsc.com/worship-sessions-vol1

#### 2. "Gospel Collaboration EP" - yhwh_artist1 & yhwh_artist2
- **Title**: Gospel Collaboration EP
- **Artist**: yhwh_artist1 & yhwh_artist2
- **Type**: EP
- **Description**: A collaborative EP featuring both artists coming together to create powerful gospel music.
- **Status**: Planning
- **Release Date**: 2025-05-20
- **Brand**: YHWH MSC
- **Genre**: Gospel
- **Tracks**: 3
- **Total Duration**: 12:15
- **Collaborators**: ["yhwh_artist1", "yhwh_artist2"]
- **Tags**: gospel, collaboration, ep, worship
- **Cover Art**: https://assets.yhwhmsc.com/gospel-collaboration-ep.jpg
- **Streaming URL**: https://streaming.yhwhmsc.com/gospel-collaboration-ep

#### 3. "Revival Tour Recordings" - yhwh_artist2
- **Title**: Revival Tour Recordings
- **Artist**: yhwh_artist2
- **Type**: Live Album
- **Description**: Live recordings from the powerful revival tour, capturing the energy and spirit of live worship.
- **Status**: Recording
- **Release Date**: 2025-06-10
- **Brand**: YHWH MSC
- **Genre**: Live Gospel
- **Tracks**: 6
- **Total Duration**: 28:30
- **Collaborators**: []
- **Tags**: live, gospel, revival, worship
- **Cover Art**: https://assets.yhwhmsc.com/revival-tour-recordings.jpg
- **Streaming URL**: https://streaming.yhwhmsc.com/revival-tour-recordings

## 🔐 STEP 1: ACCESS STRAPI ADMIN

### Open Strapi Admin
1. **Go to**: http://localhost:1337/admin
2. **Login** with existing admin credentials
3. **Navigate to**: Content Manager

## 🎵 STEP 2: CREATE YHWH MSC SONGS

### Method 1: Through Strapi Admin Interface

#### Create Each Song
1. **Navigate to**: Content Manager → Songs
2. **Click**: "Create new entry" for each song
3. **Fill in the form** with the details above for each song
4. **Click**: "Save" after each song

### Method 2: Direct Database Insert (Alternative)

If the admin interface doesn't work, you can create songs directly in the database:

```sql
-- Connect to the database
docker exec -it msc-co-postgres psql -U msc_co_user -d msc_co_dev

-- Create Heaven's Glory
INSERT INTO songs (title, artist, genre, duration, bpm, key, mood, description, lyrics, status, brand, tags, streaming_url, download_url, created_at, updated_at) 
VALUES ('Heaven''s Glory', 'yhwh_artist1', 'Contemporary Gospel', '4:23', 128, 'C Major', 'Uplifting', 'An uplifting contemporary gospel song that celebrates the glory of heaven and the majesty of God.', 'Heaven''s glory shines so bright, lifting hearts to new heights...', 'published', 'YHWH MSC', ARRAY['gospel', 'worship', 'uplifting', 'contemporary'], 'https://streaming.yhwhmsc.com/heavens-glory', 'https://download.yhwhmsc.com/heavens-glory', NOW(), NOW());

-- Create Grace Abounds
INSERT INTO songs (title, artist, genre, duration, bpm, key, mood, description, lyrics, status, brand, tags, streaming_url, download_url, created_at, updated_at) 
VALUES ('Grace Abounds', 'yhwh_artist1', 'Worship', '3:45', 85, 'G Major', 'Peaceful', 'A peaceful worship song about the abundant grace of God that flows freely to all who believe.', 'Grace abounds in every moment, peace that passes understanding...', 'published', 'YHWH MSC', ARRAY['worship', 'peaceful', 'grace', 'meditation'], 'https://streaming.yhwhmsc.com/grace-abounds', 'https://download.yhwhmsc.com/grace-abounds', NOW(), NOW());

-- Create Mighty Redeemer
INSERT INTO songs (title, artist, genre, duration, bpm, key, mood, description, lyrics, status, brand, tags, streaming_url, download_url, created_at, updated_at) 
VALUES ('Mighty Redeemer', 'yhwh_artist2', 'Gospel Rock', '5:12', 140, 'E Minor', 'Powerful', 'A powerful gospel rock anthem celebrating the mighty redeeming power of Jesus Christ.', 'Mighty Redeemer, strong and true, breaking chains and making new...', 'published', 'YHWH MSC', ARRAY['gospel', 'rock', 'powerful', 'redemption'], 'https://streaming.yhwhmsc.com/mighty-redeemer', 'https://download.yhwhmsc.com/mighty-redeemer', NOW(), NOW());

-- Create Holy Spirit Flow
INSERT INTO songs (title, artist, genre, duration, bpm, key, mood, description, lyrics, status, brand, tags, streaming_url, download_url, created_at, updated_at) 
VALUES ('Holy Spirit Flow', 'yhwh_artist2', 'Contemporary Worship', '4:56', 92, 'D Major', 'Spiritual', 'A spiritual contemporary worship song inviting the Holy Spirit to flow freely in our lives.', 'Holy Spirit flow, fill this place with Your presence...', 'published', 'YHWH MSC', ARRAY['worship', 'spiritual', 'holy spirit', 'contemporary'], 'https://streaming.yhwhmsc.com/holy-spirit-flow', 'https://download.yhwhmsc.com/holy-spirit-flow', NOW(), NOW());

-- Create Jesus Saves
INSERT INTO songs (title, artist, genre, duration, bpm, key, mood, description, lyrics, status, brand, tags, streaming_url, download_url, created_at, updated_at) 
VALUES ('Jesus Saves', 'Collaboration (yhwh_artist1 & yhwh_artist2)', 'Traditional Gospel', '3:38', 110, 'F Major', 'Joyful', 'A joyful traditional gospel collaboration celebrating the saving power of Jesus Christ.', 'Jesus saves, Jesus saves, He''s the one who makes us whole...', 'published', 'YHWH MSC', ARRAY['gospel', 'traditional', 'joyful', 'collaboration'], 'https://streaming.yhwhmsc.com/jesus-saves', 'https://download.yhwhmsc.com/jesus-saves', NOW(), NOW());

-- Create Breakthrough
INSERT INTO songs (title, artist, genre, duration, bpm, key, mood, description, lyrics, status, brand, tags, streaming_url, download_url, created_at, updated_at) 
VALUES ('Breakthrough', 'yhwh_artist1', 'Modern Worship', '4:45', 125, 'A Major', 'Triumphant', 'A triumphant modern worship song about breakthrough and victory through faith in Christ.', 'Breakthrough is coming, victory is near, trust in the Lord and have no fear...', 'published', 'YHWH MSC', ARRAY['worship', 'modern', 'triumphant', 'breakthrough'], 'https://streaming.yhwhmsc.com/breakthrough', 'https://download.yhwhmsc.com/breakthrough', NOW(), NOW());
```

## 📁 STEP 3: CREATE YHWH MSC PROJECTS

### Method 1: Through Strapi Admin Interface

#### Create Each Project
1. **Navigate to**: Content Manager → Projects
2. **Click**: "Create new entry" for each project
3. **Fill in the form** with the details above for each project
4. **Click**: "Save" after each project

### Method 2: Direct Database Insert (Alternative)

```sql
-- Create Worship Sessions Vol. 1
INSERT INTO projects (title, artist, type, description, status, release_date, brand, genre, tracks, total_duration, collaborators, tags, cover_art, streaming_url, created_at, updated_at) 
VALUES ('Worship Sessions Vol. 1', 'yhwh_artist1', 'Album', 'A collection of powerful worship sessions featuring contemporary gospel and modern worship songs.', 'In Progress', '2025-03-15', 'YHWH MSC', 'Contemporary Gospel', 4, '16:49', ARRAY[], ARRAY['worship', 'album', 'gospel', 'contemporary'], 'https://assets.yhwhmsc.com/worship-sessions-vol1.jpg', 'https://streaming.yhwhmsc.com/worship-sessions-vol1', NOW(), NOW());

-- Create Gospel Collaboration EP
INSERT INTO projects (title, artist, type, description, status, release_date, brand, genre, tracks, total_duration, collaborators, tags, cover_art, streaming_url, created_at, updated_at) 
VALUES ('Gospel Collaboration EP', 'yhwh_artist1 & yhwh_artist2', 'EP', 'A collaborative EP featuring both artists coming together to create powerful gospel music.', 'Planning', '2025-05-20', 'YHWH MSC', 'Gospel', 3, '12:15', ARRAY['yhwh_artist1', 'yhwh_artist2'], ARRAY['gospel', 'collaboration', 'ep', 'worship'], 'https://assets.yhwhmsc.com/gospel-collaboration-ep.jpg', 'https://streaming.yhwhmsc.com/gospel-collaboration-ep', NOW(), NOW());

-- Create Revival Tour Recordings
INSERT INTO projects (title, artist, type, description, status, release_date, brand, genre, tracks, total_duration, collaborators, tags, cover_art, streaming_url, created_at, updated_at) 
VALUES ('Revival Tour Recordings', 'yhwh_artist2', 'Live Album', 'Live recordings from the powerful revival tour, capturing the energy and spirit of live worship.', 'Recording', '2025-06-10', 'YHWH MSC', 'Live Gospel', 6, '28:30', ARRAY[], ARRAY['live', 'gospel', 'revival', 'worship'], 'https://assets.yhwhmsc.com/revival-tour-recordings.jpg', 'https://streaming.yhwhmsc.com/revival-tour-recordings', NOW(), NOW());
```

## 🧪 STEP 4: TEST CONTENT CREATION

### Test Content Display
1. **Go to**: http://localhost:3000
2. **Login** as any YHWH MSC user
3. **Navigate to**: Songs or Projects sections
4. **Verify** YHWH MSC content appears

### Test Brand Filtering
1. **Login** as YHWH MSC user
2. **Check** that only YHWH MSC content is visible
3. **Verify** brand association is correct

### Test Artist Associations
1. **Login** as yhwh_artist1
2. **Check** that only their songs/projects are visible
3. **Login** as yhwh_artist2
4. **Check** that only their songs/projects are visible

## 🔧 STEP 5: TROUBLESHOOTING

### If Content Doesn't Appear
1. **Check Strapi logs**:
   ```bash
   docker logs msc-co-backend --tail 20
   ```

2. **Check database**:
   ```bash
   docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT title, artist, brand FROM songs WHERE brand = 'YHWH MSC';"
   docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT title, artist, brand FROM projects WHERE brand = 'YHWH MSC';"
   ```

3. **Restart Strapi**:
   ```bash
   docker restart msc-co-backend
   ```

### If Brand Filtering Fails
1. **Check brand field**: Ensure "YHWH MSC" is exactly as specified
2. **Check frontend logic**: Ensure brand filtering works correctly
3. **Check user permissions**: Ensure users can see their brand content

### If Artist Associations Fail
1. **Check artist field**: Ensure artist names match user usernames
2. **Check user permissions**: Ensure artists can see their own content
3. **Check collaboration logic**: Ensure collaboration content is visible to all collaborators

## 📋 YHWH MSC CONTENT SUMMARY

### Created Songs (6)
| Title | Artist | Genre | Duration | BPM | Key | Mood |
|-------|--------|-------|----------|-----|-----|------|
| Heaven's Glory | yhwh_artist1 | Contemporary Gospel | 4:23 | 128 | C Major | Uplifting |
| Grace Abounds | yhwh_artist1 | Worship | 3:45 | 85 | G Major | Peaceful |
| Mighty Redeemer | yhwh_artist2 | Gospel Rock | 5:12 | 140 | E Minor | Powerful |
| Holy Spirit Flow | yhwh_artist2 | Contemporary Worship | 4:56 | 92 | D Major | Spiritual |
| Jesus Saves | Collaboration | Traditional Gospel | 3:38 | 110 | F Major | Joyful |
| Breakthrough | yhwh_artist1 | Modern Worship | 4:45 | 125 | A Major | Triumphant |

### Created Projects (3)
| Title | Artist | Type | Status | Release Date | Tracks |
|-------|--------|------|--------|--------------|--------|
| Worship Sessions Vol. 1 | yhwh_artist1 | Album | In Progress | 2025-03-15 | 4 |
| Gospel Collaboration EP | Collaboration | EP | Planning | 2025-05-20 | 3 |
| Revival Tour Recordings | yhwh_artist2 | Live Album | Recording | 2025-06-10 | 6 |

### Access Information
- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **Songs API**: http://localhost:1337/api/songs
- **Projects API**: http://localhost:1337/api/projects

## 🎯 NEXT STEPS

After creating YHWH MSC content:

1. **Test content display** at frontend
2. **Verify brand filtering** (YHWH MSC only)
3. **Check artist associations** and permissions
4. **Test content management** features
5. **Add more sample data** as needed
6. **Test complete workflows** with content

## 🔗 QUICK COMMANDS

### Check Content Status
```bash
# Check YHWH MSC songs in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT title, artist, genre FROM songs WHERE brand = 'YHWH MSC';"

# Check YHWH MSC projects in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT title, artist, type FROM projects WHERE brand = 'YHWH MSC';"

# Check Strapi status
curl -s http://localhost:1337/admin | head -5

# Check frontend status
curl -s http://localhost:3000 | head -5
```

### Restart Services
```bash
# Restart backend
docker restart msc-co-backend

# Restart frontend
docker restart msc-co-frontend

# Check all containers
docker ps
```

---

**🎵 Your YHWH MSC content is ready for revolutionary gospel music distribution!** 