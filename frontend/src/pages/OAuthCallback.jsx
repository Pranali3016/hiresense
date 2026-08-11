import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    const error = params.get('error')
    if (error) {
      navigate(`/login?oauth_error=${error}`)
      return
    }

    const token = params.get('token')
    const email = params.get('email')
    const name = params.get('name')
    const onboardingCompleted = params.get('onboarding_completed') === 'true'

    if (!token) {
      navigate('/login')
      return
    }

    localStorage.setItem('hiresense_token', token)
    localStorage.setItem('hiresense_email', email || '')
    localStorage.setItem('hiresense_name', name || '')
    navigate(onboardingCompleted ? '/analyze' : '/onboarding')
  }, [params, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
      Signing you in...
    </div>
  )
}
