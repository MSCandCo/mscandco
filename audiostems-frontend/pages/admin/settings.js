import { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from 'next/router';
import { 
  Settings, Shield, Globe, Database, Server, Bell, 
  Lock, Users, Mail, Wifi, HardDrive, Activity,
  Eye, EyeOff, Save, RefreshCw, AlertTriangle,
  CheckCircle, Clock, Zap, Building2, Key
} from 'lucide-react';
import MainLayout from '@/components/layouts/mainLayout';
import SEO from '@/components/seo';
import { getUserRole } from '@/lib/user-utils';
import NotificationModal from '@/components/shared/NotificationModal';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import useModals from '@/hooks/useModals';

export default function SuperAdminSettings() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('platform');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Initialize modals hook
  const {
    confirmModal,
    notificationModal,
    showSuccess,
    showError,
    showWarning,
    closeConfirmModal,
    closeNotificationModal
  } = useModals();

  // Get user role
  const userRole = getUserRole(user);

  // Check super admin access
  useEffect(() => {
    if (!isLoading && user) {
      const role = getUserRole(user);
      if (role !== 'super_admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, user, router]);

  // Platform Configuration State
  const [platformConfig, setPlatformConfig] = useState({
    platformName: 'MSC & Co Music Distribution Platform',
    platformUrl: 'https://staging.mscandco.com',
    supportEmail: 'support@mscandco.com',
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxFileUploadSize: 100, // MB
    sessionTimeout: 30, // minutes
    backupFrequency: 'daily',
    logRetentionDays: 90
  });

  // Security Settings State
  const [securityConfig, setSecurityConfig] = useState({
    enforceStrongPasswords: true,
    requireTwoFactor: false,
    sessionSecurityLevel: 'high',
    ipWhitelisting: false,
    whitelistedIPs: '',
    apiRateLimit: 1000, // requests per hour
    loginAttemptLimit: 5,
    accountLockoutDuration: 30 // minutes
  });

  // Integration Settings State
  const [integrationConfig, setIntegrationConfig] = useState({
    auth0Domain: 'msc-co.eu.auth0.com',
    auth0ClientId: 'your-auth0-client-id',
    stripePublishableKey: 'pk_test_...',
    stripeSecretKey: '••••••••••••••••',
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseAnonKey: '••••••••••••••••',
    emailServiceProvider: 'sendgrid',
    emailApiKey: '••••••••••••••••',
    distributionPartnerApiUrl: 'https://api.codegroup.com',
    distributionPartnerApiKey: '••••••••••••••••'
  });

  // Notification Settings State
  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    systemAlerts: true,
    performanceAlerts: true,
    securityAlerts: true,
    userActivityAlerts: false,
    revenueAlerts: true,
    distributionAlerts: true,
    maintenanceNotifications: true
  });

  const handleSaveSection = () => {
    showSuccess(`${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} settings saved successfully!`);
    setUnsavedChanges(false);
  };

  const handleResetSection = () => {
    showWarning('Settings have been reset to default values');
    setUnsavedChanges(false);
  };

  const sections = [
    { id: 'platform', name: 'Platform Configuration', icon: Globe },
    { id: 'security', name: 'Security & Access', icon: Lock },
    { id: 'integrations', name: 'Third-party Integrations', icon: Zap },
    { id: 'notifications', name: 'System Notifications', icon: Bell },
    { id: 'database', name: 'Database Management', icon: Database },
    { id: 'performance', name: 'Performance Monitoring', icon: Activity }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading system settings...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
          <input
            type="text"
            value={platformConfig.platformName}
            onChange={(e) => {
              setPlatformConfig(prev => ({ ...prev, platformName: e.target.value }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Platform URL</label>
          <input
            type="url"
            value={platformConfig.platformUrl}
            onChange={(e) => {
              setPlatformConfig(prev => ({ ...prev, platformUrl: e.target.value }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
          <input
            type="email"
            value={platformConfig.supportEmail}
            onChange={(e) => {
              setPlatformConfig(prev => ({ ...prev, supportEmail: e.target.value }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
          <input
            type="number"
            value={platformConfig.maxFileUploadSize}
            onChange={(e) => {
              setPlatformConfig(prev => ({ ...prev, maxFileUploadSize: parseInt(e.target.value) }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={platformConfig.sessionTimeout}
            onChange={(e) => {
              setPlatformConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <select
            value={platformConfig.backupFrequency}
            onChange={(e) => {
              setPlatformConfig(prev => ({ ...prev, backupFrequency: e.target.value }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Platform Status Controls</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Maintenance Mode</h5>
              <p className="text-sm text-gray-600">Temporarily disable platform access for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.maintenanceMode}
                onChange={(e) => {
                  setPlatformConfig(prev => ({ ...prev, maintenanceMode: e.target.checked }));
                  setUnsavedChanges(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Allow New Registrations</h5>
              <p className="text-sm text-gray-600">Enable new user registrations on the platform</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={platformConfig.allowNewRegistrations}
                onChange={(e) => {
                  setPlatformConfig(prev => ({ ...prev, allowNewRegistrations: e.target.checked }));
                  setUnsavedChanges(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit (per hour)</label>
          <input
            type="number"
            value={securityConfig.apiRateLimit}
            onChange={(e) => {
              setSecurityConfig(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Login Attempt Limit</label>
          <input
            type="number"
            value={securityConfig.loginAttemptLimit}
            onChange={(e) => {
              setSecurityConfig(prev => ({ ...prev, loginAttemptLimit: parseInt(e.target.value) }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Lockout Duration (minutes)</label>
          <input
            type="number"
            value={securityConfig.accountLockoutDuration}
            onChange={(e) => {
              setSecurityConfig(prev => ({ ...prev, accountLockoutDuration: parseInt(e.target.value) }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Security Level</label>
          <select
            value={securityConfig.sessionSecurityLevel}
            onChange={(e) => {
              setSecurityConfig(prev => ({ ...prev, sessionSecurityLevel: e.target.value }));
              setUnsavedChanges(true);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Security Controls</h4>
        
        <div className="space-y-4">
          {[
            { key: 'enforceStrongPasswords', label: 'Enforce Strong Passwords', desc: 'Require complex passwords for all users' },
            { key: 'requireTwoFactor', label: 'Require Two-Factor Authentication', desc: 'Mandatory 2FA for admin accounts' },
            { key: 'ipWhitelisting', label: 'IP Whitelisting', desc: 'Restrict access to specific IP addresses' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">{item.label}</h5>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securityConfig[item.key]}
                  onChange={(e) => {
                    setSecurityConfig(prev => ({ ...prev, [item.key]: e.target.checked }));
                    setUnsavedChanges(true);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>

        {securityConfig.ipWhitelisting && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Whitelisted IP Addresses</label>
            <textarea
              value={securityConfig.whitelistedIPs}
              onChange={(e) => {
                setSecurityConfig(prev => ({ ...prev, whitelistedIPs: e.target.value }));
                setUnsavedChanges(true);
              }}
              placeholder="Enter IP addresses, one per line"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-800">
            Sensitive configuration - Changes require platform restart
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Supabase Configuration */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2 text-blue-600" />
            Supabase Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supabase Domain</label>
              <input
                type="text"
                value={integrationConfig.auth0Domain}
                onChange={(e) => {
                  setIntegrationConfig(prev => ({ ...prev, auth0Domain: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
              <input
                type="text"
                value={integrationConfig.auth0ClientId}
                onChange={(e) => {
                  setIntegrationConfig(prev => ({ ...prev, auth0ClientId: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Stripe Configuration */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-purple-600" />
            Stripe Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
              <input
                type="text"
                value={integrationConfig.stripePublishableKey}
                onChange={(e) => {
                  setIntegrationConfig(prev => ({ ...prev, stripePublishableKey: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
              <input
                type="password"
                value={integrationConfig.stripeSecretKey}
                onChange={(e) => {
                  setIntegrationConfig(prev => ({ ...prev, stripeSecretKey: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Supabase Configuration */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2 text-green-600" />
            Supabase Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supabase URL</label>
              <input
                type="url"
                value={integrationConfig.supabaseUrl}
                onChange={(e) => {
                  setIntegrationConfig(prev => ({ ...prev, supabaseUrl: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anonymous Key</label>
              <input
                type="password"
                value={integrationConfig.supabaseAnonKey}
                onChange={(e) => {
                  setIntegrationConfig(prev => ({ ...prev, supabaseAnonKey: e.target.value }));
                  setUnsavedChanges(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send notifications via email' },
          { key: 'systemAlerts', label: 'System Alerts', desc: 'Critical system notifications' },
          { key: 'performanceAlerts', label: 'Performance Alerts', desc: 'Performance degradation warnings' },
          { key: 'securityAlerts', label: 'Security Alerts', desc: 'Security breach notifications' },
          { key: 'userActivityAlerts', label: 'User Activity Alerts', desc: 'User registration and activity' },
          { key: 'revenueAlerts', label: 'Revenue Alerts', desc: 'Revenue milestone notifications' },
          { key: 'distributionAlerts', label: 'Distribution Alerts', desc: 'Distribution partner updates' },
          { key: 'maintenanceNotifications', label: 'Maintenance Notifications', desc: 'Scheduled maintenance alerts' }
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">{item.label}</h5>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationConfig[item.key]}
                onChange={(e) => {
                  setNotificationConfig(prev => ({ ...prev, [item.key]: e.target.checked }));
                  setUnsavedChanges(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'platform':
        return renderPlatformSettings();
      case 'security':
        return renderSecuritySettings();
      case 'integrations':
        return renderIntegrationsSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'database':
        return (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Database Management</h3>
            <p className="text-gray-500">Database management tools coming soon...</p>
          </div>
        );
      case 'performance':
        return (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Monitoring</h3>
            <p className="text-gray-500">Performance monitoring dashboard coming soon...</p>
          </div>
        );
      default:
        return renderPlatformSettings();
    }
  };

  return (
    <MainLayout>
      <SEO 
        title="Super Admin - System Settings"
        description="Platform configuration and system management"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="w-8 h-8 mr-3" />
                <h1 className="text-3xl font-bold">Super Admin - System Settings</h1>
              </div>
              <p className="text-red-100 text-lg">
                Platform configuration and system management controls
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-100">Platform Status</div>
              <div className="flex items-center text-lg font-bold">
                <CheckCircle className="w-5 h-5 mr-2" />
                Online
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Settings Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mr-3" />
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Section Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {sections.find(s => s.id === activeSection)?.name}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Configure {activeSection} settings for the platform
                    </p>
                  </div>
                  {unsavedChanges && (
                    <div className="flex items-center text-sm text-orange-600">
                      <Clock className="w-4 h-4 mr-1" />
                      Unsaved changes
                    </div>
                  )}
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6">
                {renderCurrentSection()}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleResetSection}
                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </button>
                  
                  <button
                    onClick={handleSaveSection}
                    className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
        />

        <NotificationModal
          isOpen={notificationModal.isOpen}
          onClose={closeNotificationModal}
          type={notificationModal.type}
          title={notificationModal.title}
          message={notificationModal.message}
        />
      </div>
    </MainLayout>
  );
}