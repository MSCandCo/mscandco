import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HiHome, 
  HiUsers, 
  HiCog, 
  HiShieldCheck, 
  HiDocumentText, 
  HiChartBar,
  HiCollection,
  HiTag,
  HiGlobeAlt,
  HiMusicNote,
  HiUser,
  HiCurrencyDollar,
  HiDocument,
  HiUserGroup,
  HiCube,
  HiOfficeBuilding,
  HiCreditCard
} from 'react-icons/hi';
import { getUserRole, ROLE_NAVIGATION } from '@/lib/role-config';
import { useAuth0 } from '@auth0/auth0-react';

const iconMap = {
  home: HiHome,
  users: HiUsers,
  cog: HiCog,
  'shield-check': HiShieldCheck,
  'document-text': HiDocumentText,
  'chart-bar': HiChartBar,
  collection: HiCollection,
  tag: HiTag,
  'globe-alt': HiGlobeAlt,
  'music-note': HiMusicNote,
  user: HiUser,
  'currency-dollar': HiCurrencyDollar,
  document: HiDocument,
  'user-group': HiUserGroup,
  cube: HiCube,
  'office-building': HiOfficeBuilding,
  'credit-card': HiCreditCard
};

export default function RoleBasedNavigation({ className = '' }) {
  const { user } = useAuth0();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState(new Set());

  const userRole = getUserRole(user);
  const navigation = ROLE_NAVIGATION[userRole.id] || [];

  const toggleSection = (sectionTitle) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || HiHome;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <nav className={`space-y-6 ${className}`}>
      {/* Role Badge */}
      <div className="px-4 py-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-${userRole.color}-500`}></div>
          <span className="text-sm font-medium text-gray-700">
            {userRole.displayName}
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      {navigation.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-1">
          <button
            onClick={() => toggleSection(section.title)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <span>{section.title}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                expandedSections.has(section.title) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {expandedSections.has(section.title) && (
            <div className="ml-4 space-y-1">
              {section.items.map((item, itemIndex) => {
                const IconComponent = getIcon(item.icon);
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2 text-sm rounded-md transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {IconComponent}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>
        
        <div className="space-y-1">
          {userRole.id === 'artist' && (
            <>
              <Link
                href="/distribution/publishing/artist-portal/releases/create"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HiMusicNote className="w-5 h-5" />
                <span>Create Release</span>
              </Link>
              <Link
                href="/distribution/publishing/artist-portal/profile"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HiUser className="w-5 h-5" />
                <span>Update Profile</span>
              </Link>
            </>
          )}
          
          {userRole.id === 'super_admin' && (
            <>
              <Link
                href="/admin/users"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HiUsers className="w-5 h-5" />
                <span>Manage Users</span>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HiCog className="w-5 h-5" />
                <span>System Settings</span>
              </Link>
            </>
          )}
          
          {userRole.id === 'distribution_partner' && (
            <>
              <Link
                href="/distribution/content"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HiCollection className="w-5 h-5" />
                <span>Review Content</span>
              </Link>
              <Link
                href="/distribution/analytics"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HiChartBar className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Mobile navigation component
export function MobileRoleNavigation({ isOpen, onClose }) {
  const { user } = useAuth0();
  const router = useRouter();
  const userRole = getUserRole(user);
  const navigation = ROLE_NAVIGATION[userRole.id] || [];

  const isActive = (href) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || HiHome;
    return <IconComponent className="w-5 h-5" />;
  };

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75"
        onClick={onClose}
      ></div>

      {/* Navigation Panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <RoleBasedNavigation />
        </div>
      </div>
    </div>
  );
} 