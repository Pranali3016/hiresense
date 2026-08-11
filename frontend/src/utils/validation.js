/**
 * Evaluates password strength and returns score, labels, and criteria checks.
 */
export function evaluatePassword(pwd = '') {
  const checks = {
    length: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  }

  let score = 0
  if (checks.length) score += 1
  if (checks.hasUpper && checks.hasLower) score += 1
  if (checks.hasNumber) score += 1
  if (checks.hasSpecial) score += 1

  let label = 'Too Short'
  let color = 'bg-gray-200'
  let textColor = 'text-gray-400'

  if (pwd.length === 0) {
    return { score: 0, label: '', color: 'bg-gray-200', textColor: 'text-gray-400', checks, isStrong: false }
  }

  if (score === 1) {
    label = 'Weak'
    color = 'bg-rose-500'
    textColor = 'text-rose-600'
  } else if (score === 2) {
    label = 'Fair'
    color = 'bg-amber-500'
    textColor = 'text-amber-600'
  } else if (score === 3) {
    label = 'Good'
    color = 'bg-blue-500'
    textColor = 'text-blue-600'
  } else if (score >= 4) {
    label = 'Strong'
    color = 'bg-emerald-500'
    textColor = 'text-emerald-600'
  }

  return {
    score,
    label,
    color,
    textColor,
    checks,
    isStrong: score >= 3 && checks.length
  }
}

/**
 * Validates email address format and detects common domain typos (e.g. gmail.comm)
 */
export function validateEmail(email = '') {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) {
    return { valid: false, error: 'Please enter your email address.' }
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address format (e.g. name@example.com).' }
  }

  const typoDomains = [
    { typo: '@gmail.comm', suggestion: '@gmail.com' },
    { typo: '@gmail.con', suggestion: '@gmail.com' },
    { typo: '@gmail.co', suggestion: '@gmail.com' },
    { typo: '@gmai.com', suggestion: '@gmail.com' },
    { typo: '@gamil.com', suggestion: '@gmail.com' },
    { typo: '@yahoo.comm', suggestion: '@yahoo.com' },
    { typo: '@yahoo.con', suggestion: '@yahoo.com' },
    { typo: '@yahooo.com', suggestion: '@yahoo.com' },
    { typo: '@hotmail.comm', suggestion: '@hotmail.com' },
    { typo: '@hotmail.con', suggestion: '@hotmail.com' },
    { typo: '@outlook.comm', suggestion: '@outlook.com' },
    { typo: '@outlook.con', suggestion: '@outlook.com' },
  ]

  for (const item of typoDomains) {
    if (trimmed.endsWith(item.typo)) {
      return {
        valid: false,
        error: `Typo detected in email domain (${item.typo}). Did you mean ${item.suggestion}?`
      }
    }
  }

  return { valid: true, error: null }
}
