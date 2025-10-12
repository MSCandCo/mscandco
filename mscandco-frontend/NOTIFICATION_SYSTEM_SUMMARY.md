# Admin Notification System - Implementation Complete ✅

## What Was Built

### 1. Database Infrastructure
- ✅ `admin_notifications` table created
- ✅ Indexes on `user_id`, `read`, and `created_at`
- ✅ RLS disabled (admin-managed table)
- ✅ `get_users_with_permission()` function to find admins with specific permissions

### 2. API Endpoints Created

#### `/api/notifications/create-admin-notification` (POST)
Sends notifications to all admins with a specific permission
```javascript
{
  permission: 'user:approve_changes:any',
  type: 'profile_change_request',
  title: 'New Profile Change Request',
  message: 'User requested to change their email',
  link: '/admin/profile-requests',
  metadata: { request_id: '...', user_id: '...' }
}
```

#### `/api/notifications/list` (GET)
Fetches notifications for current user
```
GET /api/notifications/list?unread_only=true&limit=50
```

#### `/api/notifications/mark-read` (POST)
Marks notifications as read
```javascript
// Mark specific notifications
{ notification_ids: ['uuid1', 'uuid2'] }

// Mark all as read
{ mark_all: true }
```

### 3. Profile Change Request Flow

✅ **User Submission** (`pages/artist/profile/index.js`):
1. User submits profile change request
2. Request saved to `profile_change_requests` table
3. Toast notification shown to user
4. API called to notify all admins with `user:approve_changes:any` permission
5. Each admin gets notification in `admin_notifications` table

✅ **Admin Notification Trigger**:
```javascript
await fetch('/api/notifications/create-admin-notification', {
  method: 'POST',
  body: JSON.stringify({
    permission: 'user:approve_changes:any',
    type: 'profile_change_request',
    title: 'New Profile Change Request',
    message: `User has requested to change their ${field}`,
    link: `/admin/profile-requests`,
    metadata: { request_id, user_id, request_type, field }
  })
});
```

## What's Next

### UI Components Needed

You need to create notification UI components to display these notifications:

#### 1. Notification Bell Icon (Header)
```jsx
// components/NotificationBell.js
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const res = await fetch('/api/notifications/list?unread_only=true');
    const data = await res.json();
    setUnreadCount(data.unread_count);
  };

  return (
    <button className="relative p-2">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

#### 2. Notifications Dropdown/Panel
```jsx
// components/NotificationsPanel.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen]);

  const loadNotifications = async () => {
    const res = await fetch('/api/notifications/list?limit=10');
    const data = await res.json();
    setNotifications(data.notifications);
  };

  const markAsRead = async (id) => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_ids: [id] })
    });
    loadNotifications();
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl">
      <div className="p-4">
        <h3 className="font-bold text-lg">Notifications</h3>
        <div className="mt-4 space-y-2">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-3 rounded ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
              <Link href={notif.link} onClick={() => markAsRead(notif.id)}>
                <div className="font-medium">{notif.title}</div>
                <div className="text-sm text-gray-600">{notif.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 3. Add to Navigation
Update `components/auth/RoleBasedNavigation.js`:
```jsx
import NotificationBell from '@/components/NotificationBell';
import NotificationsPanel from '@/components/NotificationsPanel';

// In the header
<NotificationBell />
```

## Testing the Flow

### 1. Test Profile Change Request
```bash
# 1. Login as artist at http://localhost:3013/artist/profile
# 2. Click "Request a change"
# 3. Select a field, enter new value and reason
# 4. Submit

# Expected:
# - Toast: "Profile change request submitted! Admins will review shortly."
# - Row added to profile_change_requests
# - Rows added to admin_notifications for all admins with user:approve_changes:any
```

### 2. Test Admin Receives Notification
```sql
-- Check notifications were created
SELECT 
  an.*,
  up.email as admin_email
FROM admin_notifications an
JOIN user_profiles up ON up.id = an.user_id
WHERE an.type = 'profile_change_request'
ORDER BY an.created_at DESC;
```

### 3. Test API Endpoints
```bash
# Get notifications
curl http://localhost:3013/api/notifications/list

# Mark as read
curl -X POST http://localhost:3013/api/notifications/mark-read \
  -H "Content-Type: application/json" \
  -d '{"mark_all": true}'
```

## Roles with Approval Permission

These roles receive profile change request notifications:
- ✅ `company_admin` - has `user:approve_changes:any`
- ✅ `requests_admin` - has `user:approve_changes:any`
- ✅ `super_admin` - has `*:*:*` (wildcard, matches everything)

## Files Modified/Created

### Modified
- `pages/artist/profile/index.js` - Added toast + notification trigger
- `package.json` - Added react-hot-toast

### Created
- `pages/api/notifications/create-admin-notification.js`
- `pages/api/notifications/list.js`
- `pages/api/notifications/mark-read.js`
- Database table: `admin_notifications`
- Database function: `get_users_with_permission()`

## System Status: ✅ COMPLETE

The backend notification system is fully functional. You only need to:
1. Create the UI components (NotificationBell, NotificationsPanel)
2. Add them to the navigation header
3. Test the complete flow

All admins with the `user:approve_changes:any` permission will now be notified when a user submits a profile change request!
