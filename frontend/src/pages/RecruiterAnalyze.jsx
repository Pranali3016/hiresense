import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Bell, LayoutDashboard, Settings, LogOut, ChevronDown, Upload, X, Sparkles, Users } from 'lucide-react'

const MAX_FILES = 25

export default function RecruiterAnalyze() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const email = localStorage.getItem('hiresense_email') || ''
  const name = localStorage.getItem('hiresense_name') || ''
  const initial = (name || email || '?').trim()[0]?.toUpperCase() || '?'

  const handleLogout = () => {
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_email')
    localStorage.removeItem('hiresense_name')
    localStorage.removeItem('hiresense_role')
    navigate('/recruiter/login')
  }

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files)
    const combined = [...files, ...selected].slice(0, MAX_FILES)
    setFiles(combined)
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0) return setError('Please upload at least one candidate resume')
    if (jd.trim().length < 50) return setError('Please paste the job description (at least 50 characters)')

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('job_description', jd)
      files.forEach((f) => formData.append('files', f))

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/rank-candidates`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('hiresense_token')}`
          },
          timeout: 300000
        }
      )

      localStorage.setItem('hiresense_recruiter_result', JSON.stringify(response.data))
      navigate(`/recruiter/results/${response.data.job_posting_id}`)

    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('This is taking longer than usual with this many resumes. Please try again with fewer files.')
      } else if (err.response) {
        setError(err.response.data?.detail || `Server error: ${err.response.status}. Please try again.`)
      } else {
        setError('Network issue — please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" onClick={() => { setProfileOpen(false); setNotifOpen(false) }}>

      <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 bg-white relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">HireSense</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Recruiter
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-3 px-4 text-xs text-gray-400 z-50">
                No new notifications
              </div>
            )}
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
              className="flex items-center gap-1.5 p-0.5 rounded-xl hover:bg-gray-50 transition"
              aria-label="Recruiter account"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {initial}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-50">
                  <div className="text-xs font-bold text-gray-900 truncate">{name || 'Recruiter Account'}</div>
                  <div className="text-[11px] text-gray-400 truncate">{email}</div>
                </div>
                <button
                  onClick={() => navigate('/recruiter/analyze')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition text-left"
                >
                  <Users className="w-4 h-4 text-emerald-600" /> Candidate Ranking
                </button>
                <div className="border-t border-gray-50 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>BULK SCREENING ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Rank candidates for a role</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Upload up to {MAX_FILES} resumes and a job description — we'll score and rank every candidate</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Candidate resumes ({files.length}/{MAX_FILES})
            </label>
            <div
              className="border-2 border-dashed border-gray-200 hover:border-emerald-400 bg-gray-50/50 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm text-gray-700 font-bold">Click or drag candidate resumes here</div>
              <div className="text-[11px] text-gray-400 mt-1">PDF files only, max 5MB each, up to {MAX_FILES} at once</div>
            </div>
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {files.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs">
                    <span className="font-semibold text-gray-700 truncate">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 p-1 shrink-0 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Job description
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-gray-700 resize-none focus:outline-none focus:border-emerald-400 transition bg-gray-50/40"
              rows={7}
              placeholder="Paste the complete job description here (responsibilities, required skills, tools, qualifications)..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl p-4 font-semibold">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Ranking Candidates...' : 'Rank Candidates →'}</span>
          </button>

          {loading && (
            <div className="text-center text-xs text-gray-400">
              Analyzing {files.length} resume{files.length !== 1 ? 's' : ''}... this can take a few moments for larger batches.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
