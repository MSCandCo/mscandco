import React from 'react';

function Avatar({ name, image, size = "w-10 h-10", textSize = "text-sm" }) {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Generate consistent color based on name
  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${size} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${size} ${getBackgroundColor(name)} rounded-full flex items-center justify-center text-white font-bold ${textSize}`}>
      {getInitials(name)}
    </div>
  );
}

export default Avatar;
export { Avatar };