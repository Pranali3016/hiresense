import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  UploadCloud, Sparkles, FileText, CheckCircle2, Zap, ArrowRight,
  Briefcase, AlertCircle, RefreshCw, FileCheck2, Loader2, RotateCcw
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { extractErrorMessage } from '../utils/apiError'

const SAMPLE_JOB_PRESETS = [
  {
    title: 'Full Stack Developer',
    description: `We are looking for a Senior Full Stack Engineer with 2+ years of experience building modern web applications.
Core Requirements:
- Proficiency in React, TypeScript, and modern CSS frameworks (Tailwind CSS)
- Strong backend experience with Node.js, Python (FastAPI / Express), and RESTful APIs
- Database expertise with PostgreSQL or MongoDB
- Experience with Docker, Git, CI/CD pipelines, and Cloud infrastructure (AWS or GCP)`
  },
  {
    title: 'AI / ML Engineer',
    description: `Seeking an AI/ML Engineer to develop and deploy machine learning models and LLM applications.
Key Qualifications:
- Python expertise with PyTorch, TensorFlow, Scikit-Learn, and Pandas
- Experience with LLMs, RAG architecture, OpenAI/Gemini APIs, and LangChain
- Deployment experience using Docker, FastAPI, and Model Inference Optimization
- MLOps knowledge, Git version control, and SQL database management`
  },
  {
    title: 'Frontend Developer',
    description: `Looking for a passionate Frontend Developer to create responsive, highly scalable web user interfaces.
Requirements:
- Mastery of JavaScript (ES6+), HTML5, CSS3, and React.js
- State management using Redux or Context API
- Experience with Web performance optimization (LCP, Core Web Vitals) and UI/UX design systems
- Version control with Git and experience with REST APIs`
  }
]

export default function Analyze() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [useProfileResume, setUseProfileResume] = useState(false)
  const [hasProfileResume, setHasProfileResume] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('1. Extracting Resume Text & Key Attributes...')
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }

  useEffect(() => {
    isMountedRef.current = true
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
          { headers: authHeaders, timeout: 15000 }
        )
        if (isMountedRef.current && res.data.has_resume) {
          setHasProfileResume(true)
        }
      } catch (_) {
        // Silently handle if profile fetch fails
      }
    }
    fetchUserProfile()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handlePresetSelect = (description) => {
    setJd(description)
    if (error) setError('')
  }

  const handleSubmit = async () => {
    // 1. Client-Side Input Validation
    if (!file && !useProfileResume) {
      return setError('Please upload your resume PDF or check "Use Saved" to use your profile vault resume.')
    }

    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return setError(`Invalid file '${file.name}'. Only PDF resumes are accepted.`)
      }
      if (file.size > 10 * 1024 * 1024) {
        return setError('File exceeds maximum size limit of 10MB.')
      }
      if (file.size === 0) {
        return setError('The selected PDF file is empty. Please select a valid resume.')
      }
    }

    const cleanJd = jd.trim()
    if (cleanJd.length < 30) {
      return setError(`Job description is too short (${cleanJd.length} chars). Please enter at least 30 characters.`)
    }

    setError('')
    setLoading(true)
    setLoadingStep('1. Parsing Resume Structure & Skill Matrix...')

    const stepTimer1 = setTimeout(() => {
      if (isMountedRef.current) setLoadingStep('2. Benchmarking Experience against Requirements...')
    }, 2500)

    const stepTimer2 = setTimeout(() => {
      if (isMountedRef.current) setLoadingStep('3. Computing Match Score & Generating Skill Gaps...')
    }, 5500)

    try {
      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      formData.append('job_description', cleanJd)

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/analyze/resume`,
        formData,
        {
          headers: {
            ...authHeaders,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 90000
        }
      )

      localStorage.setItem('hiresense_result', JSON.stringify(response.data))
      if (isMountedRef.current) {
        navigate('/results')
      }

    } catch (err) {
      if (isMountedRef.current) {
        const errorMsg = extractErrorMessage(err, 'Resume analysis failed. Please try again.')
        setError(errorMsg)
      }
    } finally {
      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  return (
    <DashboardLayout
      title="AI Resume & Job Match Scanner"
      subtitle="Benchmark your master resume against target job descriptions in seconds"
    >
      <div className="max-w-5xl space-y-6">

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant AI Match Engine</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analyze Your Resume Against Any Job Role
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl font-medium">
              Upload your PDF resume and paste the target job posting. Our AI engine will evaluate your skill overlap, pinpoint missing requirements, and generate a tailored action plan.
            </p>
          </div>
        </div>

        {/* Specific Error Banner with Instant Retry Option */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto text-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Retry Scan</span>
            </button>
          </div>
        )}

        {/* Main 2-Column Scanner Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Master Resume Dropzone */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>1. Master Resume</span>
                </h2>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  PDF Format
                </span>
              </div>

              {hasProfileResume && (
                <div className="mb-4 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-gray-900">Saved Profile Resume Found</div>
                      <div className="text-[10px] text-gray-500">Use resume already stored in your Profile Vault</div>
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-emerald-700">
                    <input
                      type="checkbox"
                      checked={useProfileResume}
                      onChange={(e) => {
                        setUseProfileResume(e.target.checked)
                        if (e.target.checked) setFile(null)
                        if (error) setError('')
                      }}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span>Use Saved</span>
                  </label>
                </div>
              )}

              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  file ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 hover:border-emerald-400 bg-gray-50/50'
                }`}
              >
                <label htmlFor="scan-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-sm">
                    {file ? <CheckCircle2 className="w-7 h-7 text-emerald-600" /> : <UploadCloud className="w-7 h-7" />}
                  </div>
                  <div>
                    {file ? (
                      <div>
                        <div className="text-sm font-bold text-emerald-900 truncate max-w-xs">{file.name}</div>
                        <div className="text-xs text-emerald-600 mt-0.5">Click to swap file</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm font-bold text-gray-900">Upload PDF Resume</div>
                        <div className="text-xs text-gray-400 mt-1">Drag and drop or click to browse (up to 10MB)</div>
                      </div>
                    )}
                  </div>
                </label>
                <input
                  id="scan-file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null
                    setFile(selected)
                    if (selected) {
                      setUseProfileResume(false)
                      if (error) setError('')
                    }
                  }}
                  className="hidden"
                />
              </div>
            </div>

            <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Resume text extracted with multi-layer OCR & natural language parser</span>
            </div>
          </div>

          {/* Right Column: Job Description Studio */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>2. Target Job Description</span>
                </h2>
                <span className="text-[11px] font-semibold text-gray-400">{jd.length} chars</span>
              </div>

              {/* Sample Presets Quick Buttons */}
              <div className="mb-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Try Sample Role Presets:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_JOB_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handlePresetSelect(preset.description)}
                      className="text-xs bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 font-semibold px-2.5 py-1 rounded-xl border border-gray-200/80 transition"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={jd}
                onChange={(e) => {
                  setJd(e.target.value)
                  if (error) setError('')
                }}
                rows={8}
                placeholder="Paste the complete job description here (responsibilities, required skills, tools, qualifications)..."
                className="w-full border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition resize-none bg-gray-50/40"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setJd('')}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                Clear description
              </button>
              <div className="text-[11px] text-gray-400">Paste from LinkedIn, Naukri, or Indeed</div>
            </div>
          </div>
        </div>

        {/* Scan Action CTA & Animated Loading Overlay */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center space-y-4">
          {loading ? (
            <div className="py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-spin">
                <Loader2 className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-gray-900">{loadingStep}</div>
              <p className="text-xs text-gray-400">Our AI model is cross-referencing your resume against 50+ domain skills...</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="text-base font-bold text-gray-900">Ready to audit your resume?</h3>
                <p className="text-xs text-gray-400">Get your overall match score, skill gaps, and custom learning syllabus.</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Run AI Match Scan →</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}
