import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Bell, LayoutDashboard, Settings, LogOut, ChevronDown, Upload, X } from 'lucide-react'

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
    if (jd.trim().length < 50) return setError('Please paste the job description')

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
    <div className="min-h-screen bg-white" onClick={() => { setProfileOpen(false); setNotifOpen(false) }}>

      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-gray-900 text-lg">HireSense</span>
          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full ml-1">Recruiter</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <Bell className="w-5 h-5" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-lg py-3 px-4 text-sm text-gray-400 z-20">
                No new notifications
              </div>
            )}
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
              className="flex items-center gap-1.5"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                {initial}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-50">
                  <div className="text-sm font-medium text-gray-900 truncate">{name || 'Your account'}</div>
                  <div className="text-xs text-gray-400 truncate">{email}</div>
                </div>
                <button
                  onClick={() => navigate('/recruiter/dashboard')}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <div className="border-t border-gray-50 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rank candidates for a role</h1>
        <p className="text-gray-500 mb-10">Upload up to {MAX_FILES} resumes and a job description — we'll score and rank every candidate</p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Candidate resumes ({files.length}/{MAX_FILES})
          </label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 transition"
            onClick={() => document.getElementById('fileInput').click()}
          >
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-gray-600 font-medium">Click to upload candidate resumes</div>
            <div className="text-sm text-gray-400 mt-1">PDF files only, max 5MB each, up to {MAX_FILES} at once</div>
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
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-gray-700 truncate">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job description
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 resize-none focus:outline-none focus:border-emerald-400 transition"
            rows={8}
            placeholder="Paste the job description here..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Ranking candidates...' : 'Rank candidates →'}
        </button>

        {loading && (
          <div className="text-center text-sm text-gray-400 mt-4">
            Analyzing {files.length} resume{files.length !== 1 ? 's' : ''}... this can take a few minutes for larger batches.
          </div>
        )}
      </div>
    </div>
  )
}
