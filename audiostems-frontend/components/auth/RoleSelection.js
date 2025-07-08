import React from 'react';
import { ROLES } from '@/lib/role-config';
import { 
  HiShieldCheck,
  HiOfficeBuilding,
  HiGlobeAlt,
  HiMusicNote,
  HiCube
} from 'react-icons/hi';

const roleIcons = {
  super_admin: HiShieldCheck,
  company_admin: HiOfficeBuilding,
  distribution_partner: HiGlobeAlt,
  artist: HiMusicNote,
  distributor: HiCube
};

const RoleSelection = ({ selectedRole, onRoleChange, error }) => {
  const roleOptions = [
    {
      value: 'artist',
      label: 'Artist',
      description: 'Music creators and performers',
      icon: HiMusicNote,
      features: [
        'Upload and manage your music',
        'Track streaming analytics',
        'Connect with fans',
        'Manage your artist profile',
        'View earnings and royalties'
      ]
    },
    {
      value: 'distribution_partner',
      label: 'Distribution Partner',
      description: 'Manage distribution partnerships and content',
      icon: HiGlobeAlt,
      features: [
        'Manage distribution partnerships',
        'Content approval workflow',
        'Analytics and reporting',
        'Partner management',
        'Release coordination'
      ]
    },
    {
      value: 'distributor',
      label: 'Distributor',
      description: 'Music distribution and licensing specialists',
      icon: HiCube,
      features: [
        'Manage distribution networks',
        'Licensing management',
        'Content curation',
        'Client management',
        'Revenue tracking'
      ]
    }
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Choose Your Role * <span className="text-gray-500">(Default: Artist)</span>
      </label>
      <div className="space-y-3">
        {roleOptions.map((role) => {
          const IconComponent = role.icon;
          return (
            <label
              key={role.value}
              className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === role.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={selectedRole === role.value}
                onChange={(e) => onRoleChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedRole === role.value ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-5 h-5 ${
                    selectedRole === role.value ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-lg font-semibold ${
                      selectedRole === role.value ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {role.label}
                    </h4>
                    {selectedRole === role.value && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <p className={`mt-1 text-sm ${
                    selectedRole === role.value ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {role.description}
                  </p>
                  
                  <ul className="mt-3 space-y-1">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-xs text-gray-500">
                        <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </label>
          );
        })}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Your role determines your access level and available features. 
          You can request role changes from an administrator if needed.
        </p>
      </div>
    </div>
  );
};

export default RoleSelection; 