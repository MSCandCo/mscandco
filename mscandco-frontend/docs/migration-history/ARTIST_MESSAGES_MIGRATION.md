# Artist Messages Migration - Pages Router → App Router

## Overview
Successfully migrated the Artist Messages page from the Pages Router (`_migrating_pages/artist-messages.js`) to the App Router (`app/artist/messages/`).

## Changes Made

### 1. Created Client Component (`app/artist/messages/MessagesClient.js`)
- **Full messaging functionality** including:
  - Notification filtering (all, invitation, earning, payout)
  - Partnership invitation management (accept/decline)
  - Mark as read/unread functionality
  - Delete notifications
  - Branded success/error notifications
  - Decline modal with optional reason

### 2. Updated Server Page (`app/artist/messages/page.js`)
- **Permission check**: Requires `artist:messages:access` permission
- **Authentication**: Redirects to `/login` if not authenticated
- **Authorization**: Redirects to `/dashboard` if no access permission
- **Renders**: `MessagesClient` component

### 3. Key Features Restored

#### **Notification Types**
- `invitation` - Partnership invitations from label admins
- `earning` - Earning notifications
- `payout` - Payout notifications
- `all` - All notifications

#### **Invitation Management**
- View revenue split proposals (artist % vs label %)
- Accept partnerships (creates `artist_label_relationships`)
- Decline partnerships (with optional reason)
- Personal messages from label admins

#### **UI/UX**
- Filter tabs for notification types
- Unread indicator (purple dot)
- Visual distinction for unread messages (border-l-4)
- Icon-based notification types
- Branded modal for decline confirmation
- Branded success/error toast notifications

### 4. API Endpoints Used

#### **GET /api/notifications**
- Fetches notifications for the current user
- Supports `?type=` query parameter for filtering
- Returns notifications ordered by `created_at` (descending)

#### **POST /api/notifications/mark-read**
- Marks a notification as read
- Body: `{ notification_id: string }`

#### **DELETE /api/notifications/delete**
- Deletes a notification
- Body: `{ notification_id: string }`

#### **POST /api/artist/respond-invitation**
- Responds to partnership invitations
- Body: `{ invitation_id: string, action: 'accept' | 'decline', decline_reason?: string }`
- Creates `artist_label_relationships` on accept
- Automatically links releases where `record_label` matches label admin's `company_name`
- Sends notification to label admin

## Migration Benefits

### **App Router Advantages**
✅ Server-side permission checks before page render
✅ Better SEO and performance with RSC
✅ Cleaner separation of server/client logic
✅ Automatic code splitting

### **Maintained Features**
✅ All original functionality preserved
✅ Same UI/UX as Pages Router version
✅ Branded notifications and modals
✅ Partnership invitation workflow
✅ Revenue split visualization

### **Security Improvements**
✅ Permission-based access control
✅ Server-side authentication validation
✅ `credentials: 'include'` for all API calls
✅ Authorization headers with Bearer tokens

## Testing Checklist

- [ ] Navigate to `/artist/messages` as an artist
- [ ] Verify permission check redirects non-artists
- [ ] Filter notifications by type (all, invitation, earning, payout)
- [ ] Accept a partnership invitation
- [ ] Decline a partnership invitation (with reason)
- [ ] Mark notifications as read
- [ ] Delete notifications
- [ ] Verify branded success/error notifications appear
- [ ] Test decline modal (open, cancel, confirm)
- [ ] Verify unread indicator (purple dot) appears
- [ ] Verify revenue split proposal displays correctly

## Database Tables Used

### **notifications**
- `id` - UUID
- `user_id` - UUID (foreign key to user_profiles)
- `type` - VARCHAR (invitation, earning, payout, etc.)
- `title` - TEXT
- `message` - TEXT
- `data` - JSONB (invitation details, etc.)
- `read` - BOOLEAN
- `action_required` - BOOLEAN
- `created_at` - TIMESTAMP

### **artist_invitations**
- `id` - UUID
- `artist_id` - UUID
- `label_admin_id` - UUID
- `artist_split_percentage` - DECIMAL
- `label_split_percentage` - DECIMAL
- `status` - VARCHAR (pending, accepted, declined)
- `responded_at` - TIMESTAMP
- `response_note` - TEXT

### **artist_label_relationships**
- `id` - UUID
- `artist_id` - UUID
- `label_admin_id` - UUID
- `artist_split_percentage` - DECIMAL
- `label_split_percentage` - DECIMAL
- `status` - VARCHAR (active, inactive)

## Next Steps

1. **Test thoroughly** with real data
2. **Verify** all API endpoints work correctly
3. **Check** permission assignments for artist role
4. **Monitor** for any console errors or warnings
5. **Confirm** partnership creation workflow end-to-end

## Notes

- The original Pages Router file remains in `_migrating_pages/artist-messages.js` for reference
- All API endpoints are in the Pages Router (`pages/api/`) and work with both routers
- The `requireAuth` middleware is used on the invitation response API
- Notifications automatically CC super admins (handled by `createNotification` utility)

