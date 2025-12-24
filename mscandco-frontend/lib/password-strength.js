/**
 * Password Strength Validation
 *
 * Enforces password security requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a common password
 */

// List of common passwords to block (top 100 most common)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
  'password1', '123456789', 'password123', '1234567890', 'admin', 'welcome1',
  'hello', 'Password1', '12345', 'liverpool', 'qwertyuiop', 'Charlie', 'admin123'
]

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  blockCommonPasswords: true
}

/**
 * Calculate password strength score (0-100)
 */
export function calculatePasswordStrength(password) {
  if (!password) return 0

  let score = 0
  const checks = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    notCommon: true,
    longLength: false,
    variety: false
  }

  // Length check (0-30 points)
  if (password.length >= 8) {
    score += 10
    checks.length = true
  }
  if (password.length >= 12) {
    score += 10
    checks.longLength = true
  }
  if (password.length >= 16) {
    score += 10
  }

  // Character variety (0-50 points)
  if (/[A-Z]/.test(password)) {
    score += 10
    checks.uppercase = true
  }
  if (/[a-z]/.test(password)) {
    score += 10
    checks.lowercase = true
  }
  if (/[0-9]/.test(password)) {
    score += 10
    checks.number = true
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 10
    checks.specialChar = true
  }

  // Character diversity (0-10 points)
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.6) {
    score += 10
    checks.variety = true
  }

  // Penalty for common passwords (-30 points)
  const lowerPassword = password.toLowerCase()
  if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
    score -= 30
    checks.notCommon = false
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score))
}

/**
 * Get password strength level
 */
export function getPasswordStrengthLevel(score) {
  if (score >= 80) return { level: 'strong', color: 'green', label: 'Strong' }
  if (score >= 60) return { level: 'good', color: 'blue', label: 'Good' }
  if (score >= 40) return { level: 'fair', color: 'yellow', label: 'Fair' }
  if (score >= 20) return { level: 'weak', color: 'orange', label: 'Weak' }
  return { level: 'very-weak', color: 'red', label: 'Very Weak' }
}

/**
 * Validate password against requirements
 */
export function validatePassword(password) {
  const errors = []

  if (!password) {
    return { valid: false, errors: ['Password is required'] }
  }

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`)
  }

  // Character requirements
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  }

  // Common password check
  if (PASSWORD_REQUIREMENTS.blockCommonPasswords) {
    const lowerPassword = password.toLowerCase()
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
      errors.push('Password is too common or easily guessable')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    score: calculatePasswordStrength(password)
  }
}

/**
 * Get password requirements as a checklist
 */
export function getPasswordRequirements() {
  return [
    {
      id: 'length',
      label: `At least ${PASSWORD_REQUIREMENTS.minLength} characters`,
      check: (password) => password.length >= PASSWORD_REQUIREMENTS.minLength
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      check: (password) => /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      check: (password) => /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'One number (0-9)',
      check: (password) => /[0-9]/.test(password)
    },
    {
      id: 'special',
      label: 'One special character (!@#$%^&*)',
      check: (password) => /[^A-Za-z0-9]/.test(password)
    },
    {
      id: 'notCommon',
      label: 'Not a common password',
      check: (password) => {
        const lowerPassword = password.toLowerCase()
        return !COMMON_PASSWORDS.some(common => lowerPassword.includes(common))
      }
    }
  ]
}

/**
 * Generate a strong password suggestion
 */
export function generateStrongPassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*-_=+[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + special
  let password = ''

  // Ensure at least one of each required type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export default {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  validatePassword,
  getPasswordRequirements,
  generateStrongPassword,
  PASSWORD_REQUIREMENTS
}
