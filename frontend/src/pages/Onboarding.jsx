import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Sparkles, Target, TrendingUp, BookOpen, MessageSquare, MapPin, UploadCloud, FileCheck2 } from 'lucide-react'
import illustration from '../assets/onboarding-illustration.png'

const FEATURES = [
  { icon: Target, title: 'AI Match Score', desc: 'Get accurate match score for any role' },
  { icon: TrendingUp, title: 'Skill Gap Analysis', desc: 'Find missing skills and improve faster' },
  { icon: BookOpen, title: 'Learning Roadmap', desc: 'Personalized syllabus to bridge your gaps' },
  { icon: MessageSquare, title: 'Interview Prep', desc: 'Practice with frequently asked questions' },
]

const ROLE_SUGGESTIONS = [
  'Fresher', 'AI/ML Engineer', 'Data Scientist', 'Data Analyst',
  'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Product Manager'
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [targetRole, setTargetRole] = useState('')
  const [location, setLocation] = useState('')
  const [resume, setResume] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const name = localStorage.getItem('hiresense_name') || ''
  const firstName = name ? name.split(' ')[0] : ''

  const handleSubmit = async () => {
    if (!targetRole.trim()) return setError('Please enter your current or target role')
    if (!location.trim()) return setError('Please enter your city')

    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('target_role', targetRole.trim())
      formData.append('location', location.trim())
      if (resume) formData.append('resume', resume)

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/onboarding/complete`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('hiresense_token')}`
          },
          timeout: 60000
        }
      )
      navigate('/analyze')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-8 lg:py-12">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 lg:items-center">

        {/* Left: pitch */}
        <div className="hidden lg:block px-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">H</div>
            <span className="font-semibold text-gray-900 text-xl">HireSense</span>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Career Platform
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-3">
            Almost there{firstName ? `, ${firstName}` : ''}. <span className="text-emerald-600">Let's personalize this.</span>
          </h1>
          <p className="text-gray-500 mb-6">
            A couple of quick details help us tailor your match scores, roadmap, and interview prep to the roles you actually want.
          </p>

          <div className="space-y-3 mb-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <img src={illustration} alt="HireSense illustration" className="w-full max-w-xs mx-auto" />
        </div>

        {/* Right: form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Let's set you up</h1>
          <p className="text-sm text-gray-500 text-center mb-5">A few quick details to personalize your dashboard</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Current / target role</label>
              <div className="relative">
                <Target className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  list="role-suggestions"
                  placeholder="e.g. Fresher, AI/ML Engineer, Data Scientist"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
              <datalist id="role-suggestions">
                {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Location (city)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Pune"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Resume (optional, PDF)</label>
              <label
                htmlFor="resume-upload"
                className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition"
              >
                {resume ? (
                  <>
                    <FileCheck2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{resume.name}</div>
                      <div className="text-xs text-gray-400">Click to change</div>
                    </div>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Click to upload your resume</div>
                      <div className="text-xs text-gray-400">PDF, up to 5MB</div>
                    </div>
                  </>
                )}
              </label>
              <input
                id="resume-upload"
                type="file"
                accept="application/pdf"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50 mt-5"
          >
            {loading ? 'Saving...' : 'Finish setup'}
          </button>

          <button
            onClick={() => navigate('/analyze')}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
