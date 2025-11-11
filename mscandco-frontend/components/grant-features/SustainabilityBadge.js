export default function SustainabilityBadge({ achievement }) {
  const badgeIcons = {
    first_offset: '🌱',
    carbon_neutral: '🏆',
    eco_warrior: '🌍',
    tree_planter: '🌳',
    offset_1kg: '⭐',
    offset_10kg: '✨',
    offset_100kg: '💫',
    offset_1000kg: '🔥',
  };

  const icon = badgeIcons[achievement.achievement_type] || '🎖️';

  return (
    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="flex-shrink-0 text-3xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {achievement.achievement_title}
        </p>
        {achievement.achievement_description && (
          <p className="text-xs text-gray-600 mt-1">
            {achievement.achievement_description}
          </p>
        )}
        {achievement.milestone_value && (
          <p className="text-xs text-green-700 font-medium mt-1">
            {achievement.milestone_value} {achievement.milestone_unit}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 text-xs text-gray-500">
        {new Date(achievement.earned_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}
