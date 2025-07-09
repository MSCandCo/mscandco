# 🎵 YHWH MSC CONTENT REFERENCE

## 📋 YHWH MSC SONGS (6 songs)

### 1. "Heaven's Glory" - yhwh_artist1
- **Genre**: Contemporary Gospel
- **Duration**: 4:23
- **BPM**: 128
- **Key**: C Major
- **Mood**: Uplifting
- **Brand**: YHWH MSC

### 2. "Grace Abounds" - yhwh_artist1
- **Genre**: Worship
- **Duration**: 3:45
- **BPM**: 85
- **Key**: G Major
- **Mood**: Peaceful
- **Brand**: YHWH MSC

### 3. "Mighty Redeemer" - yhwh_artist2
- **Genre**: Gospel Rock
- **Duration**: 5:12
- **BPM**: 140
- **Key**: E Minor
- **Mood**: Powerful
- **Brand**: YHWH MSC

### 4. "Holy Spirit Flow" - yhwh_artist2
- **Genre**: Contemporary Worship
- **Duration**: 4:56
- **BPM**: 92
- **Key**: D Major
- **Mood**: Spiritual
- **Brand**: YHWH MSC

### 5. "Jesus Saves" - Collaboration (yhwh_artist1 & yhwh_artist2)
- **Genre**: Traditional Gospel
- **Duration**: 3:38
- **BPM**: 110
- **Key**: F Major
- **Mood**: Joyful
- **Brand**: YHWH MSC

### 6. "Breakthrough" - yhwh_artist1
- **Genre**: Modern Worship
- **Duration**: 4:45
- **BPM**: 125
- **Key**: A Major
- **Mood**: Triumphant
- **Brand**: YHWH MSC

## 📁 YHWH MSC PROJECTS (3 projects)

### 1. "Worship Sessions Vol. 1" - yhwh_artist1
- **Type**: Album
- **Status**: In Progress
- **Release Date**: 2025-03-15
- **Tracks**: 4
- **Duration**: 16:49
- **Brand**: YHWH MSC

### 2. "Gospel Collaboration EP" - yhwh_artist1 & yhwh_artist2
- **Type**: EP
- **Status**: Planning
- **Release Date**: 2025-05-20
- **Tracks**: 3
- **Duration**: 12:15
- **Brand**: YHWH MSC

### 3. "Revival Tour Recordings" - yhwh_artist2
- **Type**: Live Album
- **Status**: Recording
- **Release Date**: 2025-06-10
- **Tracks**: 6
- **Duration**: 28:30
- **Brand**: YHWH MSC

## 🎯 QUICK TESTING GUIDE

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
   - Should see: Heaven's Glory, Grace Abounds, Jesus Saves, Breakthrough
   - Should see: Worship Sessions Vol. 1, Gospel Collaboration EP
2. **Login** as yhwh_artist2
   - Should see: Mighty Redeemer, Holy Spirit Flow, Jesus Saves
   - Should see: Gospel Collaboration EP, Revival Tour Recordings

## 🧪 TESTING CHECKLIST

### ✅ Content Creation
- [ ] All 6 YHWH MSC songs created
- [ ] All 3 YHWH MSC projects created
- [ ] All content has correct brand association (YHWH MSC)
- [ ] All content has proper artist associations
- [ ] All content has rich metadata (BPM, Key, Mood, etc.)

### ✅ Content Display
- [ ] Songs display correctly at frontend
- [ ] Projects display correctly at frontend
- [ ] Brand filtering works (YHWH MSC only)
- [ ] Artist filtering works (individual artist content)
- [ ] Collaboration content visible to all collaborators

### ✅ Content Management
- [ ] Songs can be edited through admin interface
- [ ] Projects can be edited through admin interface
- [ ] Content status updates work correctly
- [ ] Content metadata updates work correctly

### ✅ User Permissions
- [ ] YHWH MSC users can see YHWH MSC content
- [ ] Individual artists can see their own content
- [ ] Collaborators can see collaboration content
- [ ] Brand restrictions work correctly

## 🔧 TROUBLESHOOTING

### If Content Doesn't Appear
```bash
# Check YHWH MSC songs in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT title, artist, genre FROM songs WHERE brand = 'YHWH MSC';"

# Check YHWH MSC projects in database
docker exec msc-co-postgres psql -U msc_co_user -d msc_co_dev -c "SELECT title, artist, type FROM projects WHERE brand = 'YHWH MSC';"
```

### If Brand Filtering Fails
1. Verify brand field is exactly "YHWH MSC"
2. Check frontend brand filtering logic
3. Ensure user permissions are correct

### If Artist Associations Fail
1. Verify artist names match user usernames
2. Check user permissions for content access
3. Ensure collaboration logic works correctly

## 🔗 ACCESS LINKS

- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:1337/admin
- **Songs API**: http://localhost:1337/api/songs
- **Projects API**: http://localhost:1337/api/projects

## 🎯 NEXT STEPS

After creating YHWH MSC content:

1. **Test content display** at frontend ✅
2. **Verify brand filtering** (YHWH MSC only) ✅
3. **Check artist associations** and permissions ✅
4. **Test content management** features ✅
5. **Add more sample data** as needed 🔄
6. **Test complete workflows** with content 🔄

---

**🎵 Your YHWH MSC content is ready for revolutionary gospel music distribution!** 