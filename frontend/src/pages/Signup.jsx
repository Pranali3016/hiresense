import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'
import {
  Sparkles, Target, TrendingUp, BookOpen, MessageSquare, User, Mail, Lock, Eye, EyeOff,
  ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft, AlertCircle, Check, X
} from 'lucide-react'
import { evaluatePassword, validateEmail } from '../utils/validation'

const FEATURES = [
  { icon: Target, title: 'AI Match Score', desc: 'Real-time resume overlap against job postings' },
  { icon: TrendingUp, title: 'Skill Gap Matrix', desc: 'Identify missing requirements automatically' },
  { icon: BookOpen, title: 'Learning Roadmaps', desc: 'Structured weekly module syllabi' },
  { icon: MessageSquare, title: 'Interview Prep', desc: 'Role-specific technical questions & answers' },
]

export default function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Live password strength evaluation
  const pwdStrength = useMemo(() => evaluatePassword(password), [password])

  useEffect(() => {
    const oauthError = searchParams.get('oauth_error')
    if (oauthError) {
      if (oauthError === 'linkedin_not_configured') {
        setError('LinkedIn OAuth is not configured on this server. Please use Google Sign-In or Email.')
      } else if (oauthError === 'google_not_configured') {
        setError('Google OAuth is not configured on the backend server.')
      } else if (oauthError === 'access_denied') {
        setError('Google sign-up was cancelled or access was denied.')
      } else if (oauthError === 'token_exchange_failed') {
        setError("Google authentication token exchange failed. Please ensure 'https://hiresense-backend-53pg.onrender.com/api/v1/oauth/google/callback' is registered in Google Cloud Console.")
      } else if (oauthError === 'userinfo_failed') {
        setError('Could not retrieve user profile from Google. Please try again.')
      } else if (oauthError === 'no_token') {
        setError('Authentication session was incomplete. Please try signing up again.')
      } else if (oauthError === 'auth_internal_error') {
        setError('A temporary authentication issue occurred. Please try signing up again.')
      } else {
        setError(`OAuth error: ${oauthError}`)
      }
    }
  }, [searchParams])

  const handleOAuthRedirect = (provider) => {
    const origin = window.location.origin
    window.location.href = `${import.meta.env.VITE_API_URL}/api/v1/oauth/${provider}/login?redirect_to=${encodeURIComponent(origin)}`
  }

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Please enter your full name.')
    
    // Validate Email syntax and typo domains (e.g. gmail.comm)
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      return setError(emailCheck.error)
    }

    if (!password) return setError('Please enter a password.')
    if (password.length < 8) return setError('Password must be at least 8 characters long.')
    if (!pwdStrength.checks.hasNumber || (!pwdStrength.checks.hasUpper && !pwdStrength.checks.hasLower)) {
      return setError('Please use a stronger password with both letters and numbers.')
    }
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (!agreed) return setError('Please agree to the Terms of Service & Privacy Policy.')

    setError('')
    setLoading(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/signup`,
        { name: name.trim(), email: email.trim().toLowerCase(), password },
        { timeout: 30000 }
      )
      localStorage.setItem('hiresense_token', res.data.access_token)
      localStorage.setItem('hiresense_email', res.data.email)
      localStorage.setItem('hiresense_name', res.data.name || '')
      navigate('/analyze')
    } catch (err) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        if (typeof detail === 'string') {
          setError(detail)
        } else if (Array.isArray(detail)) {
          setError(detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', '))
        } else {
          setError(JSON.stringify(detail))
        }
      } else if (err.message) {
        setError(`Connection issue: ${err.message}. Please verify the backend server is running at ${import.meta.env.VITE_API_URL}.`)
      } else {
        setError('Could not create account. Please verify your details.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">

      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Top Navbar */}
      <header className="p-4 sm:p-8 flex items-center justify-between relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <span className="font-extrabold text-gray-900 text-xl tracking-tight">HireSense</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigate('/recruiter/signup')}
            className="text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl border border-gray-200 transition shadow-xs"
          >
            Recruiter Signup →
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">

          {/* Left Column: Product Showcase */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-full w-fit shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FREE CANDIDATE REGISTRATION</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Create Your Candidate Profile & <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Supercharge Your Job Search
              </span>
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
              Join thousands of job seekers using HireSense AI to audit their resumes, close skill gaps, and get candidate callback recommendations.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm hover:border-emerald-200 transition duration-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-gray-900 mb-0.5">{f.title}</div>
                  <div className="text-[11px] text-gray-400 leading-snug">{f.desc}</div>
                </div>
              ))}
            </div>

            {/* Trust Metric Badges */}
            <div className="flex items-center gap-6 pt-3 text-xs text-gray-500 font-semibold border-t border-gray-200/80">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free For Candidates
              </span>
              <span className="flex items-center gap-1.5 text-teal-700">
                <CheckCircle2 className="w-4 h-4 text-teal-500" /> Instant Setup
              </span>
            </div>
          </div>

          {/* Right Column: Clean White Auth Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 space-y-5">
              
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Create Free Account ✨</h2>
                <p className="text-xs text-gray-400">Get instant access to AI resume audits & skill roadmaps</p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl p-3.5 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* OAuth Social Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthRedirect('google')}
                  className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-gray-200 rounded-2xl py-2.5 text-xs font-bold text-gray-700 transition shadow-xs"
                >
                  <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 flex items-center justify-center text-white text-[9px] font-black">G</span>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthRedirect('linkedin')}
                  className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-2xl py-2.5 text-xs font-bold text-gray-700 transition shadow-xs"
                >
                  <span className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[8px] font-black">in</span>
                  <span>LinkedIn</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 block">Password</label>
                    {password && (
                      <span className={`text-[11px] font-bold ${pwdStrength.textColor}`}>
                        {pwdStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters with letters & numbers"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Dynamic Password Strength Progress Meter */}
                  {password && (
                    <div className="pt-1.5 space-y-2">
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`rounded-full transition-all duration-300 ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-gray-200'}`} />
                        <div className={`rounded-full transition-all duration-300 ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-gray-200'}`} />
                        <div className={`rounded-full transition-all duration-300 ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-gray-200'}`} />
                        <div className={`rounded-full transition-all duration-300 ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-gray-200'}`} />
                      </div>

                      {/* Password Requirements Checklist */}
                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                        <div className={`flex items-center gap-1 font-medium ${pwdStrength.checks.length ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {pwdStrength.checks.length ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-3 h-3 text-center text-xs leading-none">•</span>}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 font-medium ${pwdStrength.checks.hasNumber ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {pwdStrength.checks.hasNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-3 h-3 text-center text-xs leading-none">•</span>}
                          <span>At least 1 number</span>
                        </div>
                        <div className={`flex items-center gap-1 font-medium ${pwdStrength.checks.hasUpper && pwdStrength.checks.hasLower ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {pwdStrength.checks.hasUpper && pwdStrength.checks.hasLower ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-3 h-3 text-center text-xs leading-none">•</span>}
                          <span>Upper & lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 font-medium ${pwdStrength.checks.hasSpecial ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {pwdStrength.checks.hasSpecial ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-3 h-3 text-center text-xs leading-none">•</span>}
                          <span>Special symbol</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                />
                <span className="text-[11px] text-gray-500 leading-snug">
                  I agree to the <span className="text-emerald-600 font-bold">Terms of Service</span> and{' '}
                  <span className="text-emerald-600 font-bold">Privacy Policy</span>.
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-sm shadow-emerald-600/20 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                  Sign In
                </Link>
              </p>

            </div>
          </div>

        </div>
      </main>

      <footer className="p-4 text-center text-[11px] text-gray-400 relative z-10">
        © {new Date().getFullYear()} HireSense AI Inc. Secure Candidate Registration.
      </footer>

    </div>
  )
}
