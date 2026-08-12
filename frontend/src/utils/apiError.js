/**
 * Extracts a human-readable, specific error message from an Axios or JavaScript error.
 * Accurately distinguishes between network timeouts, connection drops, and server errors.
 */
export function extractErrorMessage(err, fallback = 'An unexpected error occurred. Please try again.') {
  if (!err) return fallback

  // 1. Client-side or Network Timeout (ECONNABORTED)
  if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
    return 'Request timed out. The server is taking longer than usual to respond. Please check your connection and retry.'
  }

  // 2. Network disconnect / Server unreachable (no response received)
  if (!err.response) {
    if (err.message === 'Network Error' || (err.message && err.message.toLowerCase().includes('network'))) {
      return 'Network connection issue. Please verify your internet connection or check if the backend service is running.'
    }
    return err.message || fallback
  }

  // 3. HTTP 401 Unauthorized / Token Expiration
  if (err.response.status === 401) {
    return 'Your session has expired or is invalid. Please sign in again.'
  }

  // 4. HTTP 403 Forbidden
  if (err.response.status === 403) {
    return err.response.data?.message || err.response.data?.detail || 'Access forbidden: You do not have permission to access this resource.'
  }

  // 5. HTTP 429 Rate Limit Exceeded
  if (err.response.status === 429) {
    return err.response.data?.message || err.response.data?.detail || 'Rate limit reached. Please wait a moment before sending another request.'
  }

  // 6. HTTP 422 Validation Error
  if (err.response.status === 422) {
    if (err.response.data?.message) return err.response.data.message
    if (typeof err.response.data?.detail === 'string') return err.response.data.detail
    if (Array.isArray(err.response.data?.detail)) {
      return err.response.data.detail.map(d => d.msg || d.message || JSON.stringify(d)).join('; ')
    }
  }

  // 7. Structured Server Response Message or Detail
  const serverMsg = err.response.data?.message || err.response.data?.detail
  if (serverMsg) {
    if (typeof serverMsg === 'string') return serverMsg
    if (typeof serverMsg === 'object') {
      try {
        return JSON.stringify(serverMsg)
      } catch (_) {
        return fallback
      }
    }
  }

  // 8. General HTTP Status Fallbacks
  if (err.response.status >= 500) {
    return 'The backend service encountered a temporary error. Our team has been notified. Please try again shortly.'
  }

  return fallback
}
