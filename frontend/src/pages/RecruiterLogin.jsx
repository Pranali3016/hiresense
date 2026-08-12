import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  Users, Search, BarChart3, MessageSquare, Mail, Lock, Eye, EyeOff,
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Star, Zap,
  Award, TrendingUp, ChevronRight, Check
} from 'lucide-react'
import { validateEmail } from '../utils/validation'
import { extractErrorMessage } from '../utils/apiError'

const RECRUITER_PERKS = [
  {
    icon: Zap,
    title: 'Instant Bulk AI Ranking',
    desc: 'Upload 25+ resumes and get calibrated fit scores in seconds.'
  },
  {
    icon: ShieldCheck,
    title: 'Bias-Free Blind Screening',
    desc: 'Anonymize names and demographics for objective merit-first hiring.'
  },
  {
    icon: BarChart3,
    title: 'Standardized 1-5 Rubrics',
    desc: 'Objective competency scorecards ready for your hiring managers.'
  },
  {
    icon: MessageSquare,
    title: 'Candidate Pool RAG AI Chat',
    desc: 'Ask natural language questions across your entire talent pipeline.'
  }
]

export default function RecruiterLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Quick Demo Autofill Helper
  const handleFillDemo = () => {
    setEmail('recruiter@hiresense.com')
    setPassword('Recruiter2026!')
    setError('')
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) return setError(emailCheck.error)
    if (!password) return setError('Please enter your password.')

    setError('')
    setLoading(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
        { email: email.trim().toLowerCase(), password },
        { timeout: 30000 }
      )
      if (res.data.role !== 'recruiter') {
        setError('This account is registered as a candidate. Please use the candidate login portal.')
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
      setError(extractErrorMessage(err, 'Incorrect email or password. Please verify your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-900 font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Top Navbar */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-gray-900 text-xl tracking-tight">HireSense</span>
            <span className="text-[10px] ml-2 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Recruiter Suite
            </span>
          </div>
        </div>

        {/* Switch to Candidate Portal Link */}
        <Link
          to="/login"
          className="text-xs font-bold text-gray-500 hover:text-emerald-700 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-200/80 shadow-xs hover:border-emerald-300 transition flex items-center gap-1.5"
        >
          <span>Candidate Login</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Showcase Hero & Login Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 w-full relative z-10 flex-1 flex items-center">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center w-full">

          {/* LEFT COLUMN: Visual Talent Intelligence Showcase (7 Cols) */}
          <div className="lg:col-span-7 space-y-7">
            
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200/70">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enterprise Talent Intelligence Platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]">
                Screen 10x faster.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                  Hire by verified skills.
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed">
                Rank hundreds of applicant resumes against your exact Job Description with explainable skill match scores, automated gap interview kits, and bias-free screening.
              </p>
            </div>

            {/* Interactive Live Candidate Match Card Demo */}
            <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-xl shadow-gray-200/40 space-y-4 max-w-lg relative overflow-hidden group hover:border-emerald-300 transition duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    AM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-sm">Alex Mercer</span>
                      <span className="bg-amber-50 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>#1 Top Pick</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium">Senior Full Stack Engineer • 6 YOE</div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-2xl text-center">
                  <div className="text-lg font-black leading-tight">92%</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-tight">Match Fit</div>
                </div>
              </div>

              {/* Verified Matched Skills Cloud */}
              <div className="space-y-1.5 relative z-10">
                <div className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Key Competencies:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Python', 'FastAPI', 'PostgreSQL', 'React', 'Docker', 'System Design'].map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-50 border border-gray-200/80 text-gray-700 font-semibold text-[11px] px-2.5 py-0.5 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Hiring Verdict Strip */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs relative z-10">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>AI Verdict: Strong Hire (Exceeds Bar)</span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">⚡ 0.4s response</span>
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {RECRUITER_PERKS.map((perk) => (
                <div
                  key={perk.title}
                  className="bg-white/70 backdrop-blur-sm border border-gray-100 hover:border-emerald-200 hover:bg-white rounded-2xl p-3.5 transition duration-200 shadow-2xs space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <perk.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-extrabold text-gray-900 text-xs">{perk.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug pl-9">{perk.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust & Social Proof Strip */}
            <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 font-medium border-t border-gray-200/70 max-w-xl">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-emerald-500 text-white font-black text-[10px] flex items-center justify-center">S</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center">R</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-teal-500 text-white font-black text-[10px] flex items-center justify-center">M</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">A</div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-gray-900 font-extrabold ml-1">4.9/5</span>
                </div>
                <div className="text-[11px] text-gray-400">Trusted by 1,200+ high-growth talent teams</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Glassmorphic Recruiter Login Form (5 Cols) */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-gray-200/60 space-y-5 relative">
              
              {/* Form Title & Role Badge */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-3 py-0.5 rounded-full border border-emerald-200">
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span>Recruiter Portal Access</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  Welcome Back 👋
                </h2>
                <p className="text-xs text-gray-400">
                  Log in to manage candidate batches and leaderboards
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-3.5 font-medium flex items-start gap-2 animate-fadeIn">
                  <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Work Email */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-700 block">Work Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="recruiter@company.com"
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-gray-700 block">Password</label>
                    <span className="text-[11px] text-gray-400 font-semibold">Min. 8 characters</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] mt-2"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{loading ? 'Authenticating...' : 'Log In to Recruiter Workspace →'}</span>
                </button>
              </form>

              {/* 1-Click Demo Fill Assistant */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full py-2 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200/60 transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>✨ Fill Demo Recruiter Account</span>
                </button>
              </div>

              {/* Sign Up Redirect */}
              <div className="text-center pt-2 border-t border-gray-100 space-y-2">
                <p className="text-xs text-gray-600 font-medium">
                  Don't have a recruiter account?{' '}
                  <Link
                    to="/recruiter/signup"
                    className="text-emerald-700 font-extrabold hover:underline inline-flex items-center gap-0.5"
                  >
                    <span>Sign up here</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </p>

                <p className="text-[11px] text-gray-400">
                  Looking to evaluate your own resume?{' '}
                  <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
                    Candidate Portal
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted • Enterprise Security</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="p-4 text-center text-xs text-gray-400 relative z-10 border-t border-gray-100 bg-white/40">
        HireSense Enterprise Recruiter Platform • Built for high-velocity talent acquisition
      </footer>

    </div>
  )
}
