# Accessibility Admin Workflow

## ✅ Confirmed Workflow

**The accessibility admin acts as the coordinator between users and interpreters.**

---

## 🔄 Complete Workflow

### Step 1: User Makes Request
```
User (Artist or End User):
├─ Visits release page
├─ Clicks "Request Accessibility Feature"
├─ Selects: "Sign Language Video (ASL)"
└─ Submits request

Request Created in Database:
├─ Status: "pending"
├─ Request Type: "sign_language_video"
├─ Target Language: "ASL"
└─ Release ID: Linked to release
```

### Step 2: Admin Sees Request
```
Accessibility Admin Logs In:
├─ Goes to: /admin/accessibility
├─ Sees Dashboard Stats:
│  └─ "Pending Requests: 3" (highlighted)
└─ Clicks "Requests" Tab

Requests Tab Shows:
├─ All pending requests
├─ Filter by status, type, language
├─ Search by release/artist
└─ Each request shows:
   ├─ Release name
   ├─ Request type (ASL video)
   ├─ Requester info
   ├─ Priority level
   └─ Deadline
```

### Step 3: Admin Coordinates with Interpreter
```
Admin Actions:
├─ Reviews request details
├─ Contacts interpreter (external):
│  ├─ Email: "Hi Sarah, we need ASL video for 'Song Name'"
│  ├─ Sends: Song file + Lyrics
│  └─ Deadline: 3 days
├─ OR assigns to platform interpreter
└─ Updates request status: "in_progress"

Admin Can Add Notes:
└─ "Contacted Sarah Johnson, deadline 3 days"
```

### Step 4: Interpreter Creates Content
```
Interpreter (External):
├─ Receives email from admin
├─ Downloads song + lyrics
├─ Creates sign language video
└─ Sends video back to admin (email/Dropbox)

Interpreter (Platform):
├─ Logs into platform (if they have account)
├─ Sees assigned project
├─ Downloads materials
├─ Creates video
└─ Uploads directly (if system supports)
```

### Step 5: Admin Uploads Content
```
Admin Receives Video:
├─ Downloads video from interpreter
├─ Goes to: /admin/accessibility
├─ Navigates to "Content" tab
├─ Clicks "Upload New Content"
└─ Uploads:
   ├─ Video file
   ├─ Links to release
   ├─ Content type: "sign_language_video"
   ├─ Language: "ASL"
   └─ Quality rating

Content Published:
└─ Video now available on release page
```

### Step 6: Admin Marks Request Complete
```
Admin Actions:
├─ Goes back to "Requests" tab
├─ Finds completed request
├─ Clicks "Complete" button
├─ Adds notes: "Video uploaded, quality verified"
└─ Status changes: "completed"

Request Closed:
├─ Status: "completed"
├─ Completed date: Set
└─ Stats update automatically
```

---

## 🎯 Admin Dashboard Features

### What Admin Can See:

**1. Dashboard Overview:**
- Total content items
- Languages supported
- WCAG compliance %
- Pending requests (highlighted)
- Active interpreters
- Completed requests

**2. Requests Tab:**
- All accessibility requests
- Filter by status (pending/in_progress/completed)
- Filter by type (ASL video, translation, etc.)
- Search by release/artist
- Update status with one click
- Add admin notes

**3. Content Tab:**
- All accessibility content
- Filter by type/language
- View quality ratings
- Verify content
- Upload new content

**4. Interpreters Tab:**
- Interpreter profiles
- Languages they support
- Availability status
- Contact information
- Portfolio examples

**5. Compliance Tab:**
- WCAG compliance levels
- Missing features per release
- Audit history
- Certification status

---

## 📋 Admin Actions Available

### For Requests:
- ✅ **Start** - Change status from "pending" to "in_progress"
- ✅ **Complete** - Mark request as completed
- ✅ **Reject** - Reject request (with reason)
- ✅ **Add Notes** - Internal notes about coordination

### For Content:
- ✅ **View** - See content details
- ✅ **Verify** - Mark content as verified
- ✅ **Upload** - Add new content (video, audio, text)
- ✅ **Delete** - Remove low-quality content

### For Interpreters:
- ✅ **View Profile** - See interpreter details
- ✅ **Contact** - Get contact information
- ✅ **Assign** - Assign interpreter to request

---

## 🔐 Permission-Based Access

### Accessibility Admin Role:
```
Permission: "accessibility:manage"

Grants Access To:
├─ /admin/accessibility (Full dashboard)
├─ View all requests
├─ Update request status
├─ Upload content
├─ Manage interpreters
└─ View compliance data
```

### How to Create Accessibility Admin:
```
1. Go to: /superadmin/permissionsroles
2. Create new role: "Accessibility Admin"
3. Assign permission: "accessibility:manage"
4. Assign role to user
5. User can now access /admin/accessibility
```

---

## 💡 Real Example Workflow

### Scenario: ASL Video Request for "Summer Vibes"

**Day 1 - Request Received:**
```
9:00 AM - User requests ASL video
9:05 AM - Admin sees notification: "1 new request"
9:10 AM - Admin opens /admin/accessibility
9:15 AM - Admin reviews request:
   ├─ Release: "Summer Vibes"
   ├─ Type: Sign Language Video
   ├─ Language: ASL
   └─ Priority: Medium
9:20 AM - Admin contacts interpreter Sarah Johnson
9:25 AM - Admin updates status: "in_progress"
9:30 AM - Admin adds note: "Contacted Sarah, deadline 3 days"
```

**Day 2-3 - Interpreter Works:**
```
Admin receives email from Sarah:
"Hi, I've completed the ASL video for 'Summer Vibes'.
Video file attached. Let me know if you need any changes."
```

**Day 4 - Admin Uploads:**
```
10:00 AM - Admin downloads video from email
10:05 AM - Admin goes to Content tab
10:10 AM - Admin clicks "Upload New Content"
10:15 AM - Admin uploads:
   ├─ File: summer_vibes_asl.mp4
   ├─ Release: "Summer Vibes"
   ├─ Type: sign_language_video
   ├─ Language: ASL
   └─ Quality: 5 stars
10:20 AM - Content published
10:25 AM - Admin goes to Requests tab
10:30 AM - Admin marks request: "completed"
10:35 AM - Admin adds note: "Video uploaded, quality verified"
```

**Result:**
- ✅ Request completed
- ✅ Video available on release page
- ✅ Deaf users can access ASL video
- ✅ Stats updated automatically

---

## 🎯 Key Benefits of This Workflow

### ✅ Simple for Admin:
- One dashboard to manage everything
- Clear workflow: See → Coordinate → Upload → Complete
- All requests in one place

### ✅ Flexible:
- Can work with external interpreters (no login needed)
- Can work with platform interpreters (if they have accounts)
- Can upload content manually
- Can track everything

### ✅ Scalable:
- Admin can handle multiple requests
- Can assign to different interpreters
- Can track progress easily
- Stats show workload

### ✅ Quality Control:
- Admin reviews content before publishing
- Can verify quality
- Can add notes for future reference
- Can reject low-quality content

---

## 📊 Admin Dashboard Stats Help With:

**Workload Management:**
- See how many requests pending
- Prioritize urgent requests
- Track completion rate

**Quality Monitoring:**
- See average compliance %
- Track verified content
- Monitor interpreter quality

**Resource Planning:**
- See active interpreters
- Track language coverage
- Plan interpreter network

---

## ✅ Summary

**The workflow is:**
1. User requests → Request appears in admin dashboard
2. Admin sees request → Reviews details
3. Admin coordinates → Contacts interpreter (external or platform)
4. Interpreter creates → Sends content to admin
5. Admin uploads → Adds content to platform
6. Admin completes → Marks request done

**The admin page supports all of this!** 🎉

You just need to:
- Create accessibility admin role with `accessibility:manage` permission
- Admin can then see requests and manage everything
- Simple, efficient, scalable workflow

