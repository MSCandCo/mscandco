'use client'

import { useState, useEffect } from 'react'
import { Check, X, Eye, EyeOff, RefreshCw } from 'lucide-react'
import {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  getPasswordRequirements,
  generateStrongPassword
} from '@/lib/password-strength'

export default function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  showStrengthBar = true,
  showSuggestion = false,
  onSuggestionGenerated = null
}) {
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(null)
  const [requirements, setRequirements] = useState([])

  useEffect(() => {
    if (!password) {
      setScore(0)
      setLevel(null)
      setRequirements(getPasswordRequirements().map(req => ({ ...req, met: false })))
      return
    }

    const newScore = calculatePasswordStrength(password)
    const newLevel = getPasswordStrengthLevel(newScore)

    setScore(newScore)
    setLevel(newLevel)

    // Update requirements
    const reqs = getPasswordRequirements().map(req => ({
      ...req,
      met: req.check(password)
    }))
    setRequirements(reqs)
  }, [password])

  const generatePassword = () => {
    const suggested = generateStrongPassword()
    if (onSuggestionGenerated) {
      onSuggestionGenerated(suggested)
    }
  }

  const getStrengthBarColor = () => {
    if (!level) return 'bg-gray-200'
    switch (level.level) {
      case 'strong': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'fair': return 'bg-yellow-500'
      case 'weak': return 'bg-orange-500'
      case 'very-weak': return 'bg-red-500'
      default: return 'bg-gray-200'
    }
  }

  const getStrengthTextColor = () => {
    if (!level) return 'text-gray-500'
    switch (level.level) {
      case 'strong': return 'text-green-700'
      case 'good': return 'text-blue-700'
      case 'fair': return 'text-yellow-700'
      case 'weak': return 'text-orange-700'
      case 'very-weak': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  if (!password && !showRequirements) return null

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      {showStrengthBar && password && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Password Strength</span>
            {level && (
              <span className={`text-sm font-semibold ${getStrengthTextColor()}`}>
                {level.label}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements Checklist */}
      {showRequirements && requirements.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Password Requirements
          </div>
          <div className="space-y-1.5">
            {requirements.map(req => (
              <div key={req.id} className="flex items-center gap-2">
                {req.met ? (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-sm ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Strong Password Button */}
      {showSuggestion && (
        <button
          type="button"
          onClick={generatePassword}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Generate strong password
        </button>
      )}
    </div>
  )
}

// Standalone password input with built-in strength indicator
export function PasswordInputWithStrength({
  value,
  onChange,
  onBlur,
  name = 'password',
  placeholder = 'Enter password',
  autoComplete = 'new-password',
  required = false,
  disabled = false,
  className = '',
  showSuggestion = false
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSuggestionGenerated = (suggested) => {
    onChange({ target: { name, value: suggested } })
  }

  return (
    <div className="space-y-2">
      {/* Input Field */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false)
            if (onBlur) onBlur(e)
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 rounded transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Strength Indicator (show when focused or has value) */}
      {(isFocused || value) && (
        <PasswordStrengthIndicator
          password={value}
          showRequirements={true}
          showStrengthBar={true}
          showSuggestion={showSuggestion}
          onSuggestionGenerated={handleSuggestionGenerated}
        />
      )}
    </div>
  )
}
