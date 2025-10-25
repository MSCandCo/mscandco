/**
 * Standardized Loading Spinner Component
 * Used consistently across the entire application
 */

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  color = 'blue',
  showMessage = true 
}) {
  // Size variants
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  // Color variants
  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-900',
    white: 'border-white',
    purple: 'border-purple-600',
    red: 'border-red-600',
    green: 'border-green-600',
    orange: 'border-orange-600',
    violet: 'border-violet-600'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} mx-auto ${showMessage ? 'mb-4' : ''}`}
      ></div>
      {showMessage && message && (
        <p className="text-gray-600">{message}</p>
      )}
    </div>
  )
}

/**
 * Full Page Loading State
 * For pages that need centered loading
 */
export function PageLoading({ message = 'Loading...', color = 'blue' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="md" message={message} color={color} />
      </div>
    </div>
  )
}

/**
 * Inline Loading State (for buttons, etc.)
 */
export function InlineLoading({ size = 'sm', color = 'white' }) {
  return <LoadingSpinner size={size} showMessage={false} color={color} />
}

