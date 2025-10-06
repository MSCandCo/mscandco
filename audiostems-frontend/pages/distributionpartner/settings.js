import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/components/providers/SupabaseProvider';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Key,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Check,
  AlertCircle,
  Globe,
  Moon,
  Sun,
  Mail,
  Building2
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const DistributionPartnerSettingsPage = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  // State management
  const [activeTab, setActiveTab] = useState('preferences');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Preferences state (Distribution Partner specific)
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'GBP',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    emailSignature: '',
    companyVisibility: 'public' // Distribution Partner specific
  });

  // Notifications state (Distribution Partner specific)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    revisionRequests: true,
    platformUpdates: true,
    messages: true,
    frequency: 'immediate'
  });

  // Security state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    loginHistory: []
  });

  // API Access state
  const [apiAccess, setApiAccess] = useState({
    apiKey: '',
    usage: {
      requestsThisMonth: 0,
      rateLimit: 5000, // Higher limit for distribution partners
      quotaRemaining: 5000
    },
    webhookUrl: ''
  });

  // Load settings data
  useEffect(() => {
    if (user) {
      loadAllSettings();
    }
  }, [user]);

  const loadAllSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) return;

      // Load preferences
      const prefsResponse = await fetch('/api/distributionpartner/settings/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        if (prefsData.success) {
          setPreferences(prev => ({ ...prev, ...prefsData.data }));
        }
      }

      // Load notification settings
      const notifResponse = await fetch('/api/distributionpartner/settings/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        if (notifData.success) {
          setNotifications(prev => ({ ...prev, ...notifData.data }));
        }
      }

      // Load security data
      const securityResponse = await fetch('/api/distributionpartner/settings/security', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (securityResponse.ok) {
        const securityData = await securityResponse.json();
        if (securityData.success) {
          setSecurity(prev => ({
            ...prev,
            loginHistory: securityData.data.loginHistory || [],
            twoFactorEnabled: securityData.data.twoFactorEnabled || false
          }));
        }
      }

      // Load API key data
      const apiResponse = await fetch('/api/distributionpartner/settings/api-key', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData.success) {
          setApiAccess(prev => ({ ...prev, ...apiData.data }));
        }
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/distributionpartner/settings/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        showSaveMessage('Preferences saved successfully!', 'success');
      } else {
        showSaveMessage('Failed to save preferences', 'error');
      }
    } catch (error) {
      showSaveMessage('Error saving preferences', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotifications = async () => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/distributionpartner/settings/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notifications)
      });

      if (response.ok) {
        showSaveMessage('Notification settings saved!', 'success');
      } else {
        showSaveMessage('Failed to save notification settings', 'error');
      }
    } catch (error) {
      showSaveMessage('Error saving notification settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showSaveMessage('Passwords do not match', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/distributionpartner/settings/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        })
      });

      if (response.ok) {
        showSaveMessage('Password changed successfully!', 'success');
        setSecurity(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        const data = await response.json();
        showSaveMessage(data.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      showSaveMessage('Error changing password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/distributionpartner/settings/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'regenerate' })
      });

      if (response.ok) {
        const data = await response.json();
        setApiAccess(prev => ({ ...prev, apiKey: data.data.apiKey }));
        showSaveMessage('API key regenerated successfully!', 'success');
      } else {
        showSaveMessage('Failed to regenerate API key', 'error');
      }
    } catch (error) {
      showSaveMessage('Error regenerating API key', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiAccess.apiKey);
    showSaveMessage('API key copied to clipboard!', 'success');
  };

  const showSaveMessage = (message, type) => {
    setSaveMessage({ text: message, type });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <SettingsIcon className="w-6 h-6 mr-2" />
                Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your distribution partner preferences and settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className={`rounded-lg p-4 ${
            saveMessage.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              )}
              <p className={`text-sm font-medium ${
                saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveMessage.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content - 4 tabs (no Billing) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="preferences">
              <Globe className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="w-4 h-4 mr-2" />
              API Access
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Platform Preferences */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Preferences</h2>
              <p className="text-sm text-gray-600 mb-6">Customize your platform experience</p>

              <div className="space-y-4">
                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        preferences.theme === 'light'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </button>
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        preferences.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GBP">GBP (£)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Europe/London">London (GMT)</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                {/* Email Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Signature
                  </label>
                  <textarea
                    value={preferences.emailSignature}
                    onChange={(e) => setPreferences(prev => ({ ...prev, emailSignature: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Your email signature..."
                  />
                </div>

                {/* Company Information Visibility (Distribution Partner specific) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Company Information Visibility
                  </label>
                  <select
                    value={preferences.companyVisibility}
                    onChange={(e) => setPreferences(prev => ({ ...prev, companyVisibility: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Control who can see your company information</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Notifications (Distribution Partner specific) */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
              <p className="text-sm text-gray-600 mb-6">Manage how you receive notifications</p>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-xs text-gray-600">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-xs text-gray-600">Receive push notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Notification Preferences (Distribution Partner specific) */}
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h3>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.revisionRequests}
                        onChange={(e) => setNotifications(prev => ({ ...prev, revisionRequests: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Revision requests from platform</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.platformUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, platformUpdates: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Platform updates and announcements</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.messages}
                        onChange={(e) => setNotifications(prev => ({ ...prev, messages: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">New messages</span>
                    </label>
                  </div>
                </div>

                {/* Frequency */}
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
                  <select
                    value={notifications.frequency}
                    onChange={(e) => setNotifications(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily digest</option>
                    <option value="weekly">Weekly digest</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={saveNotifications}
                  disabled={isSaving}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Security (same as others) */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h2>
              <p className="text-sm text-gray-600 mb-6">Manage your account security and privacy settings</p>

              {/* Change Password */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    onClick={changePassword}
                    disabled={isSaving}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {security.twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.twoFactorEnabled}
                      onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Login History */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Login History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {security.loginHistory.length > 0 ? (
                        security.loginHistory.map((login, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{login.device}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{login.location}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{login.ip}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{login.timestamp}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                            No login history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: API Access (reordered as 4th tab, no billing) */}
          <TabsContent value="api" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">API Access</h2>
              <p className="text-sm text-gray-600 mb-6">Manage your API keys and integration settings</p>

              {/* API Key */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">API Key</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <code className="text-sm text-gray-900 font-mono">
                      {showApiKey ? apiAccess.apiKey : 'sk_' + '•'.repeat(40)}
                    </code>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-200"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={copyApiKey}
                        className="p-2 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-200"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={regenerateApiKey}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate API Key
                  </Button>
                </div>
              </div>

              {/* API Usage */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">API Usage</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-600 mb-1">Requests This Month</p>
                    <p className="text-2xl font-bold text-blue-900">{apiAccess.usage.requestsThisMonth}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-600 mb-1">Rate Limit</p>
                    <p className="text-2xl font-bold text-green-900">{apiAccess.usage.rateLimit}/mo</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-xs text-purple-600 mb-1">Quota Remaining</p>
                    <p className="text-2xl font-bold text-purple-900">{apiAccess.usage.quotaRemaining}</p>
                  </div>
                </div>
              </div>

              {/* API Documentation */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Documentation</h3>
                <Button
                  onClick={() => window.open('https://docs.mscandco.com/api', '_blank')}
                  variant="outline"
                  className="w-full"
                >
                  View API Documentation
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DistributionPartnerSettingsPage;
