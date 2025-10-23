'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Lock, Bell, Info, Save, Eye, EyeOff } from 'lucide-react'

export default function SettingsClient({ user }) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    email: '',
    phone: '',
    company_name: '',
    position: '',
    timezone: 'Europe/London',
    language_preference: 'en',
    date_format: 'DD/MM/YYYY',
    role: '',
    created_at: null
  })

  // Password change data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email_new_release: true,
    email_earnings_update: true,
    email_roster_changes: true,
    email_system_updates: true,
    email_weekly_summary: false,
    email_monthly_report: true
  })

  useEffect(() => {
    if (user) {
      fetchUserSettings()
    }
  }, [user])

  const fetchUserSettings = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        console.error('No auth token available')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()

      setProfileData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        display_name: data.display_name || '',
        email: data.email || '',
        phone: data.phone || '',
        company_name: data.company_name || '',
        position: data.position || '',
        timezone: data.timezone || 'Europe/London',
        language_preference: data.language_preference || 'en',
        date_format: data.date_format || 'DD/MM/YYYY',
        role: data.role || '',
        created_at: data.created_at
      })

      if (data.notification_settings) {
        setNotificationSettings({
          ...notificationSettings,
          ...data.notification_settings
        })
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      showNotification('Failed to load settings', 'error')
      setLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    const bgColor = type === 'success' ? '#f0fdf4' : '#fef2f2'
    const borderColor = type === 'success' ? '#065f46' : '#991b1b'
    const textColor = type === 'success' ? '#065f46' : '#991b1b'

    const notificationDiv = document.createElement('div')
    notificationDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        border-left: 4px solid ${borderColor};
        padding: 16px 24px;
        color: ${textColor};
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 400px;
      ">
        ${message}
      </div>
    `
    document.body.appendChild(notificationDiv)
    setTimeout(() => document.body.removeChild(notificationDiv), 4000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        showNotification('Authentication error. Please log in again.', 'error')
        setSaving(false)
        return
      }

      const response = await fetch('/api/admin/settings/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          display_name: profileData.display_name,
          phone: profileData.phone,
          company_name: profileData.company_name,
          position: profileData.position,
          timezone: profileData.timezone,
          language_preference: profileData.language_preference,
          date_format: profileData.date_format
        })
      })

      if (response.ok) {
        showNotification('Profile updated successfully!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.error || 'Failed to update profile', 'error')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.confirm_password) {
      showNotification('New passwords do not match', 'error')
      return
    }

    if (passwordData.new_password.length < 8) {
      showNotification('Password must be at least 8 characters', 'error')
      return
    }

    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        showNotification('Authentication error. Please log in again.', 'error')
        setSaving(false)
        return
      }

      const response = await fetch('/api/admin/settings/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      })

      if (response.ok) {
        showNotification('Password changed successfully!', 'success')
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      } else {
        const error = await response.json()
        showNotification(error.error || 'Failed to change password', 'error')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      showNotification('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        showNotification('Authentication error. Please log in again.', 'error')
        setSaving(false)
        return
      }

      const response = await fetch('/api/admin/settings/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(notificationSettings)
      })

      if (response.ok) {
        showNotification('Notification preferences updated!', 'success')
      } else {
        const error = await response.json()
        showNotification(error.error || 'Failed to update preferences', 'error')
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
      showNotification('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account Info', icon: Info }
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1f2937' }}>Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #1f2937 0%, #374151 100%)' : '#ffffff',
                  color: activeTab === tab.id ? '#ffffff' : '#4b5563',
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? '#1f2937' : '#d1d5db'
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl shadow-lg p-8" style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
          border: '1px solid rgba(31, 41, 55, 0.08)'
        }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1f2937' }}>Profile Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>First Name</label>
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Last Name</label>
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Display Name</label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                    placeholder="How you'd like to be addressed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Email (Read-only)</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                    style={{
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      color: '#6b7280'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Company Name</label>
                  <input
                    type="text"
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Position/Title</label>
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="Europe/London">London (GMT)</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Australia/Sydney">Sydney (AEDT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Date Format</label>
                  <select
                    value={profileData.date_format}
                    onChange={(e) => setProfileData({ ...profileData, date_format: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Language</label>
                  <select
                    value={profileData.language_preference}
                    onChange={(e) => setProfileData({ ...profileData, language_preference: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saving ? '#6b7280' : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                  border: '1px solid #1f2937'
                }}
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1f2937' }}>Change Password</h2>

              <div className="space-y-6 mb-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-12"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saving ? '#6b7280' : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                  border: '1px solid #1f2937'
                }}
              >
                <Lock size={18} />
                <span>{saving ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationUpdate}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1f2937' }}>Email Notifications</h2>

              <div className="space-y-4 mb-6">
                {[
                  { key: 'email_new_release', label: 'New Release Submissions', description: 'Get notified when artists submit new releases' },
                  { key: 'email_earnings_update', label: 'Earnings Updates', description: 'Notifications about new earnings data' },
                  { key: 'email_roster_changes', label: 'Roster Changes', description: 'Updates when artists join or leave your roster' },
                  { key: 'email_system_updates', label: 'System Updates', description: 'Important platform updates and announcements' },
                  { key: 'email_weekly_summary', label: 'Weekly Summary', description: 'Weekly digest of platform activity' },
                  { key: 'email_monthly_report', label: 'Monthly Report', description: 'Comprehensive monthly performance report' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      id={item.key}
                      checked={notificationSettings[item.key]}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [item.key]: e.target.checked
                      })}
                      className="mt-1 h-5 w-5 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
                    />
                    <label htmlFor={item.key} className="flex-1 cursor-pointer">
                      <div className="font-medium" style={{ color: '#1f2937' }}>{item.label}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: saving ? '#6b7280' : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                  border: '1px solid #1f2937'
                }}
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
              </button>
            </form>
          )}

          {/* Account Info Tab */}
          {activeTab === 'account' && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1f2937' }}>Account Information</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Email Address</label>
                    <p className="text-lg font-medium" style={{ color: '#1f2937' }}>{profileData.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Role</label>
                    <p className="text-lg font-medium" style={{ color: '#1f2937' }}>
                      {profileData.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Account Created</label>
                    <p className="text-lg font-medium" style={{ color: '#1f2937' }}>
                      {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">User ID</label>
                    <p className="text-sm font-mono text-gray-600">{user?.id}</p>
                  </div>
                </div>

                <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <h3 className="font-semibold mb-2" style={{ color: '#1f2937' }}>Account Status</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


