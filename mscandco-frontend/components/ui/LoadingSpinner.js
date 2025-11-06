/**
 * Standardized Loading Spinner Component
 * Used consistently across the entire application
 */

export default function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  color = 'brand',
  showMessage = true 
}) {
  // Size variants
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  // Color variants - brand color (#1f2937) is default
  const getBorderColor = () => {
    switch (color) {
      case 'brand':
        return { borderColor: '#1f2937' }
      case 'white':
        return { borderColor: '#ffffff' }
      case 'blue':
        return { borderColor: '#2563eb' }
      case 'gray':
        return { borderColor: '#111827' }
      case 'red':
        return { borderColor: '#dc2626' }
      case 'green':
        return { borderColor: '#16a34a' }
      default:
        return { borderColor: '#1f2937' } // Default to brand color
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} mx-auto ${showMessage ? 'mb-4' : ''}`}
        style={getBorderColor()}
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
export function PageLoading({ message = 'Loading...', color = 'brand' }) {
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

