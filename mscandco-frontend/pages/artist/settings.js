import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { requirePermission } from '@/lib/serverSidePermissions';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useTheme } from 'next-themes';
import moment from 'moment-timezone';
import CurrencySelector, { formatCurrency as sharedFormatCurrency, useCurrencySync } from '@/components/shared/CurrencySelector';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  CreditCard,
  Key,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Globe,
  Moon,
  Sun
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Comprehensive language list
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', native: '繁體中文' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' }
];

// Curated timezone list - Major cities covering all time offsets
const TIMEZONES = [
  // GMT -12 to -9
  { value: 'Pacific/Midway', label: 'Midway Island (GMT-11:00)', offset: -11 },
  { value: 'Pacific/Honolulu', label: 'Hawaii (GMT-10:00)', offset: -10 },
  { value: 'America/Anchorage', label: 'Alaska (GMT-9:00)', offset: -9 },

  // GMT -8 to -5 (Americas)
  { value: 'America/Los_Angeles', label: 'Pacific Time - Los Angeles (GMT-8:00)', offset: -8 },
  { value: 'America/Denver', label: 'Mountain Time - Denver (GMT-7:00)', offset: -7 },
  { value: 'America/Chicago', label: 'Central Time - Chicago (GMT-6:00)', offset: -6 },
  { value: 'America/New_York', label: 'Eastern Time - New York (GMT-5:00)', offset: -5 },
  { value: 'America/Caracas', label: 'Caracas (GMT-4:00)', offset: -4 },
  { value: 'America/Santiago', label: 'Santiago (GMT-4:00)', offset: -4 },
  { value: 'America/Halifax', label: 'Halifax (GMT-4:00)', offset: -4 },
  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3:00)', offset: -3 },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3:00)', offset: -3 },

  // GMT -2 to +0
  { value: 'Atlantic/South_Georgia', label: 'South Georgia (GMT-2:00)', offset: -2 },
  { value: 'Atlantic/Azores', label: 'Azores (GMT-1:00)', offset: -1 },
  { value: 'Europe/London', label: 'London (GMT+0:00)', offset: 0 },
  { value: 'Africa/Casablanca', label: 'Casablanca (GMT+0:00)', offset: 0 },

  // GMT +1 to +3 (Europe & Africa)
  { value: 'Europe/Paris', label: 'Paris (GMT+1:00)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1:00)', offset: 1 },
  { value: 'Europe/Rome', label: 'Rome (GMT+1:00)', offset: 1 },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1:00)', offset: 1 },
  { value: 'Africa/Lagos', label: 'Lagos (GMT+1:00)', offset: 1 },
  { value: 'Europe/Athens', label: 'Athens (GMT+2:00)', offset: 2 },
  { value: 'Africa/Cairo', label: 'Cairo (GMT+2:00)', offset: 2 },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (GMT+2:00)', offset: 2 },
  { value: 'Europe/Helsinki', label: 'Helsinki (GMT+2:00)', offset: 2 },
  { value: 'Europe/Istanbul', label: 'Istanbul (GMT+3:00)', offset: 3 },
  { value: 'Europe/Moscow', label: 'Moscow (GMT+3:00)', offset: 3 },
  { value: 'Africa/Nairobi', label: 'Nairobi (GMT+3:00)', offset: 3 },

  // GMT +4 to +6 (Middle East & Asia)
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4:00)', offset: 4 },
  { value: 'Asia/Baku', label: 'Baku (GMT+4:00)', offset: 4 },
  { value: 'Asia/Karachi', label: 'Karachi (GMT+5:00)', offset: 5 },
  { value: 'Asia/Kolkata', label: 'Mumbai/New Delhi (GMT+5:30)', offset: 5.5 },
  { value: 'Asia/Dhaka', label: 'Dhaka (GMT+6:00)', offset: 6 },

  // GMT +7 to +9 (Asia)
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7:00)', offset: 7 },
  { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7:00)', offset: 7 },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8:00)', offset: 8 },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8:00)', offset: 8 },
  { value: 'Asia/Shanghai', label: 'Beijing/Shanghai (GMT+8:00)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9:00)', offset: 9 },
  { value: 'Asia/Seoul', label: 'Seoul (GMT+9:00)', offset: 9 },

  // GMT +10 to +12 (Pacific)
  { value: 'Australia/Sydney', label: 'Sydney (GMT+10:00)', offset: 10 },
  { value: 'Australia/Brisbane', label: 'Brisbane (GMT+10:00)', offset: 10 },
  { value: 'Pacific/Guam', label: 'Guam (GMT+10:00)', offset: 10 },
  { value: 'Pacific/Noumea', label: 'Noumea (GMT+11:00)', offset: 11 },
  { value: 'Pacific/Auckland', label: 'Auckland (GMT+12:00)', offset: 12 },
  { value: 'Pacific/Fiji', label: 'Fiji (GMT+12:00)', offset: 12 }
];

const ArtistSettingsPage = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
    const { theme, setTheme } = useTheme();
  const [selectedCurrency, updateCurrency] = useCurrencySync('GBP');

  // Permission check - redirect if no access
  
  // State management
  const [activeTab, setActiveTab] = useState('preferences');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    currency: 'GBP',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY'
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    releaseStatus: true,
    earnings: true,
    messages: true,
    announcements: true,
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

  // Billing state (from existing billing page)
  const [billing, setBilling] = useState({
    currentPlan: null,
    paymentMethod: null,
    billingHistory: []
  });

  // API Access state
  const [apiAccess, setApiAccess] = useState({
    apiKey: '',
    usage: {
      requestsThisMonth: 0,
      rateLimit: 1000,
      quotaRemaining: 1000
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
      const prefsResponse = await fetch('/api/artist/settings/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        if (prefsData.success) {
          setPreferences(prev => ({ ...prev, ...prefsData.data }));
        }
      }

      // Load notification settings
      const notifResponse = await fetch('/api/artist/settings/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        if (notifData.success) {
          setNotifications(prev => ({ ...prev, ...notifData.data }));
        }
      }

      // Load security data (login history)
      const securityResponse = await fetch('/api/artist/settings/security', {
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

      // Load billing data
      const billingResponse = await fetch('/api/artist/settings/billing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        if (billingData.success) {
          setBilling(billingData.data);
        }
      }

      // Load API key data
      const apiResponse = await fetch('/api/artist/settings/api-key', {
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

      const response = await fetch('/api/artist/settings/preferences', {
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

      const response = await fetch('/api/artist/settings/notifications', {
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

      const response = await fetch('/api/artist/settings/security', {
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

      const response = await fetch('/api/artist/settings/api-key', {
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
              <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
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
            <TabsTrigger value="billing">
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
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
                      onClick={() => {
                        setTheme('light');
                        setPreferences(prev => ({ ...prev, theme: 'light' }));
                      }}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        theme === 'light'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setTheme('dark');
                        setPreferences(prev => ({ ...prev, theme: 'dark' }));
                      }}
                      className={`flex items-center px-4 py-2 rounded-lg border ${
                        theme === 'dark'
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
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} - {lang.native}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                  <CurrencySelector
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={(newCurrency) => {
                      updateCurrency(newCurrency);
                      setPreferences(prev => ({ ...prev, currency: newCurrency }));
                    }}
                    showLabel={false}
                    showExchangeRate={true}
                    className="w-full"
                  />
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
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

          {/* Tab 2: Notifications */}
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

                {/* Notification Preferences */}
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h3>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.releaseStatus}
                        onChange={(e) => setNotifications(prev => ({ ...prev, releaseStatus: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Release status updates</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.earnings}
                        onChange={(e) => setNotifications(prev => ({ ...prev, earnings: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Earnings updates</span>
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

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications.announcements}
                        onChange={(e) => setNotifications(prev => ({ ...prev, announcements: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Platform announcements</span>
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

          {/* Tab 3: Privacy & Security */}
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

          {/* Tab 4: Billing & Subscription */}
          <TabsContent value="billing" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing & Subscription</h2>
              <p className="text-sm text-gray-600 mb-6">Manage your subscription and payment methods</p>

              {/* Current Plan */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-gray-900 mb-4">Current Plan</h3>
                {billing.currentPlan ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-900">{billing.currentPlan.name}</h4>
                        <p className="text-sm text-blue-700 mt-1">{billing.currentPlan.billing} billing</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">£{billing.currentPlan.amount}</p>
                        <p className="text-xs text-blue-600">per {billing.currentPlan.billing === 'monthly' ? 'month' : 'year'}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <Button
                        onClick={() => router.push('/billing')}
                        variant="outline"
                        className="w-full"
                      >
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-4">No active subscription</p>
                    <Button
                      onClick={() => router.push('/billing')}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      Choose a Plan
                    </Button>
                  </div>
                )}
              </div>

              {/* Billing History */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Billing History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {billing.billingHistory && billing.billingHistory.length > 0 ? (
                        billing.billingHistory.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">£{item.amount}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button className="text-blue-600 hover:text-blue-800 flex items-center">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-sm text-gray-500">
                            No billing history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: API Access */}
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

export default ArtistSettingsPage;
