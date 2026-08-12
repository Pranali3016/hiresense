import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Users, Search, BarChart3, MessageSquare, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { validateEmail } from '../utils/validation'

const FEATURES = [
  { icon: Search, title: 'AI Candidate Matching' },
  { icon: BarChart3, title: 'Explainable Scores' },
  { icon: Users, title: 'Bulk Resume Ranking' },
  { icon: MessageSquare, title: 'Gap-Based Interview Prep' },
]

export default function RecruiterLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) return setError(emailCheck.error)
    if (!password) return setError('Please enter your password.')
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
        { email, password },
        { timeout: 30000 }
      )
      if (res.data.role !== 'recruiter') {
        setError('This account is registered as a candidate. Please use the candidate login instead.')
        setLoading(false)
        return
      }
      localStorage.setItem('hiresense_token', res.data.access_token)
      localStorage.setItem('hiresense_email', res.data.email)
      localStorage.setItem('hiresense_name', res.data.name || '')
      localStorage.setItem('hiresense_role', res.data.role)
      if (res.data.company_name) {
        localStorage.setItem('hiresense_company', res.data.company_name)
      }
      if (res.data.recruiter_title) {
        localStorage.setItem('hiresense_title', res.data.recruiter_title)
      }

      if (!res.data.onboarding_completed) {
        navigate('/recruiter/onboarding')
      } else {
        navigate('/recruiter/dashboard')
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') setError(detail)
        else if (Array.isArray(detail)) setError(detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', '))
        else setError(JSON.stringify(detail))
      } else if (err.message) {
        setError(`Connection error: ${err.message}. Please verify the server is running.`)
      } else {
        setError('Incorrect email or password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative flex items-center justify-center px-4 sm:px-6 lg:px-10 py-8 sm:py-12 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-14 items-center relative z-10">

        <div className="hidden lg:block pt-4" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">H</div>
            <span className="font-semibold text-gray-900 text-lg">HireSense</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2.5 py-1 rounded-full mb-4">
            <Users className="w-3 h-3" />
            For Recruiters &amp; Hiring Teams
          </div>

          <h1 className="text-2xl font-bold text-gray-900 leading-[1.2] mb-3 tracking-tight">
            Hire by skills,<br />
            <span className="text-emerald-600">not just keywords.</span>
          </h1>
          <p className="text-sm text-gray-500 mb-5 max-w-sm">
            Upload a job description, rank candidates by real skill match, and see exactly why each one scored the way they did.
          </p>

          <div className="grid grid-cols-2 gap-2.5 mb-5 max-w-sm">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-2 bg-white/70 border border-gray-100 rounded-xl px-3 py-2.5 hover:border-emerald-200 hover:bg-white transition-colors">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-800">{f.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 lg:p-7 w-full max-w-[420px] mx-auto"
          style={{ animation: 'fadeInUp 0.6s ease-out' }}
        >
          <h1 className="text-xl font-bold text-gray-900 text-center mb-0.5 tracking-tight">Recruiter Login</h1>
          <p className="text-xs text-gray-500 text-center mb-4">Log in to find your next great hire.</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-lg p-2.5 mb-3">{error}</div>
          )}

          <div className="space-y-2">
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="Work email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-200 rounded-xl pl-8 pr-7 py-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-3">
            Don't have a recruiter account?{' '}
            <Link to="/recruiter/signup" className="text-emerald-600 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            Looking to analyze your own resume instead?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
              Candidate login
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
