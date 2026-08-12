import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessedRef.current) return
    hasProcessedRef.current = true

    const error = params.get('error')
    if (error) {
      navigate(`/login?oauth_error=${encodeURIComponent(error)}`, { replace: true })
      return
    }

    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')
    const onboardingCompleted = params.get('onboarding_completed') === 'true'

    if (!token) {
      navigate('/login?oauth_error=no_token', { replace: true })
      return
    }

    try {
      localStorage.setItem('hiresense_token', token)
      localStorage.setItem('hiresense_email', email || '')
      localStorage.setItem('hiresense_name', name || '')
      navigate(onboardingCompleted ? '/analyze' : '/onboarding', { replace: true })
    } catch (err) {
      console.error('Failed to store OAuth session:', err)
      navigate('/login?oauth_error=storage_failed', { replace: true })
    }
  }, [params, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
        <div>
          <div className="font-bold text-gray-900 text-base">Signing you in securely...</div>
          <div className="text-xs text-gray-400">Authenticating session and preparing your career dashboard</div>
        </div>
      </div>
    </div>
  )
}
