import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const error = params.get('error')
    if (error) {
      navigate(`/login?oauth_error=${encodeURIComponent(error)}`)
      return
    }

    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')
    const onboardingCompleted = params.get('onboarding_completed') === 'true'

    if (!token) {
      navigate('/login?oauth_error=no_token')
      return
    }

    localStorage.setItem('hiresense_token', token)
    localStorage.setItem('hiresense_email', email || '')
    localStorage.setItem('hiresense_name', name || '')
    navigate(onboardingCompleted ? '/analyze' : '/onboarding')
  }, [params, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Authenticating and redirecting to your dashboard...</span>
      </div>
    </div>
  )
}
