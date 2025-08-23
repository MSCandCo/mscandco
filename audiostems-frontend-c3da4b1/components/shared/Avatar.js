import React from 'react';

/**
 * Avatar component that displays user initials or profile images
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.name - User's full name (used for initials)
 * @param {string} props.size - Size variant ('sm', 'md', 'lg', 'xl')
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 */
const Avatar = ({ 
  src, 
  name = '', 
  size = 'md', 
  className = '', 
  onClick 
}) => {
  // Generate initials from name
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  // Base classes
  const baseClasses = `
    inline-flex 
    items-center 
    justify-center 
    rounded-full 
    bg-gray-500 
    text-white 
    font-medium
    select-none
    ${onClick ? 'cursor-pointer hover:bg-gray-600 transition-colors' : ''}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const initials = getInitials(name);

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      title={name || 'User'}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show initials
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
export { Avatar };