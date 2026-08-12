import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Sparkles, Building2, Globe, Users, Briefcase, CheckCircle2,
  ArrowRight, ArrowLeft, ShieldCheck, Mail, Zap, Check, Star,
  Award, TrendingUp, ChevronRight
} from 'lucide-react'
import { extractErrorMessage } from '../utils/apiError'

const COMPANY_SIZES = [
  { id: '1-10', label: '1 - 10', desc: 'Seed / Early Startup' },
  { id: '11-50', label: '11 - 50', desc: 'Growth Stage' },
  { id: '51-200', label: '51 - 200', desc: 'Scaleup' },
  { id: '201-1000+', label: '200+', desc: 'Enterprise' },
]

const HIRING_DOMAINS = [
  '💻 Software & Full Stack Engineering',
  '🤖 AI / Machine Learning & Data Science',
  '☁️ DevOps & Cloud Infrastructure',
  '🎨 Product Design & UI/UX',
  '📊 Product & Engineering Management',
  '🚀 Multi-Disciplinary Tech Roles'
]

export default function RecruiterOnboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Company Profile, 2: Recruiter Persona, 3: Email Signature & Confirmation

  // Form States
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companySize, setCompanySize] = useState('11-50')
  const [recruiterTitle, setRecruiterTitle] = useState('Talent Acquisition Lead')
  const [hiringDomain, setHiringDomain] = useState('💻 Software & Full Stack Engineering')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const recruiterName = localStorage.getItem('hiresense_name') || 'Hiring Lead'
  const recruiterEmail = localStorage.getItem('hiresense_email') || ''

  useEffect(() => {
    // If company name was saved during signup, pre-fill it
    const storedCompany = localStorage.getItem('hiresense_company')
    if (storedCompany) {
      setCompanyName(storedCompany)
    }
  }, [])

  const handleNext = () => {
    setError('')
    if (step === 1) {
      if (!companyName.trim()) {
        return setError('Please enter your company or organization name.')
      }
      setStep(2)
    } else if (step === 2) {
      if (!recruiterTitle.trim()) {
        return setError('Please specify your designation or role title.')
      }
      setStep(3)
    }
  }

  const handleFinishOnboarding = async () => {
    setError('')
    setLoading(true)
    try {
      const token = localStorage.getItem('hiresense_token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/recruiter-onboarding`,
        {
          company_name: companyName.trim(),
          company_website: companyWebsite.trim() || undefined,
          recruiter_title: recruiterTitle.trim(),
          company_size: companySize,
          hiring_domain: hiringDomain
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 20000
        }
      )

      localStorage.setItem('hiresense_company', res.data.company_name || companyName)
      localStorage.setItem('hiresense_title', res.data.recruiter_title || recruiterTitle)

      navigate('/recruiter/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save onboarding details. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-900 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-5xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-black text-gray-900 text-lg tracking-tight">HireSense</span>
            <span className="text-[10px] ml-2 bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Recruiter Setup
            </span>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Company' },
            { num: 2, label: 'Persona' },
            { num: 3, label: 'Signature' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                step === s.num
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-white border border-gray-200 text-gray-400'
              }`}
            >
              <span>{step > s.num ? '✓' : s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Main Multi-Step Wizard Card */}
      <main className="max-w-2xl mx-auto w-full px-4 py-6 relative z-10 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6 animate-fadeIn">
          
          {/* STEP 1: COMPANY PROFILE */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 uppercase tracking-wide">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Step 1 of 3: Organization Details</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Tell us about your company
                </h2>
                <p className="text-xs text-gray-500">
                  This company name will appear on candidate outreach emails, evaluation rubrics, and dossiers.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-700 block">Company / Studio Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies, OpenAI, Razorpay..."
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Company Website */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-700 block">Company Website (Optional)</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="e.g. https://acme.io or acme.com"
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Company Size Pills */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-extrabold text-gray-700 block">Team &amp; Company Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {COMPANY_SIZES.map((cs) => (
                      <button
                        key={cs.id}
                        type="button"
                        onClick={() => setCompanySize(cs.id)}
                        className={`p-3 rounded-2xl border text-center transition ${
                          companySize === cs.id
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black ring-2 ring-emerald-500/10'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-extrabold text-xs">{cs.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{cs.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RECRUITER IDENTITY & HIRING FOCUS */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 uppercase tracking-wide">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Step 2 of 3: Hiring Persona</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Your Role &amp; Hiring Focus
                </h2>
                <p className="text-xs text-gray-500">
                  Tailors your AI screening calibration and default recruiter signatures.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Designation / Role Title */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-gray-700 block">Your Job Title / Designation *</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={recruiterTitle}
                      onChange={(e) => setRecruiterTitle(e.target.value)}
                      placeholder="e.g. Lead Technical Recruiter, VP of Engineering, Founder..."
                      className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Primary Hiring Domain */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-extrabold text-gray-700 block">Primary Roles You Hire For</label>
                  <div className="space-y-2">
                    {HIRING_DOMAINS.map((domain) => (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => setHiringDomain(domain)}
                        className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          hiringDomain === domain
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/10'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-bold text-xs">{domain}</span>
                        {hiringDomain === domain && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LIVE PREVIEW & SIGNATURE CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Step 3 of 3: Ready to Launch</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Confirm Company Branding
                </h2>
                <p className="text-xs text-gray-500">
                  Preview how your company and signature will appear to candidates when sending interview invitations.
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                      {companyName.trim()[0]?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-xs sm:text-sm">{companyName}</div>
                      <div className="text-[11px] text-gray-500">{companyWebsite || 'Verified Employer'}</div>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    Active Hiring Team
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-700 leading-relaxed font-mono bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="text-gray-400 font-bold text-[10px] mb-1">CANDIDATE OUTREACH PREVIEW:</div>
                  <p>Hi Alex,</p>
                  <p>
                    I was impressed by your experience and wanted to invite you to interview for our opening at{' '}
                    <strong className="text-emerald-700 font-extrabold">{companyName}</strong>.
                  </p>
                  <div className="pt-2 text-gray-800">
                    <div>Warm regards,</div>
                    <div className="font-bold">{recruiterName}</div>
                    <div className="text-gray-500">{recruiterTitle} • {companyName}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl p-3.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/25 flex items-center gap-2 ml-auto disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{loading ? 'Finalizing Profile...' : 'Complete & Launch Dashboard →'}</span>
              </button>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-gray-400 relative z-10">
        HireSense Enterprise Recruiter Platform • Built for high-growth hiring teams
      </footer>
    </div>
  )
}
