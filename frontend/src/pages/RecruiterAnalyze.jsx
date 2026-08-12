import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Bell, LogOut, ChevronDown, Upload, X, Sparkles, Users, AlertCircle,
  RotateCcw, ArrowLeft, Wand2, CheckCircle2, Copy, Check
} from 'lucide-react'
import { extractErrorMessage } from '../utils/apiError'

const MAX_FILES = 25
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export default function RecruiterAnalyze() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const isMountedRef = useRef(true)

  // Smart JD Builder Modal States
  const [showJdModal, setShowJdModal] = useState(false)
  const [builderTitle, setBuilderTitle] = useState('')
  const [builderLevel, setBuilderLevel] = useState('Mid-Level')
  const [builderIndustry, setBuilderIndustry] = useState('Technology & SaaS')
  const [builderNotes, setBuilderNotes] = useState('')
  const [buildingJd, setBuildingJd] = useState(false)
  const [generatedJd, setGeneratedJd] = useState(null)
  const [copiedJd, setCopiedJd] = useState(false)

  // Advanced Scoring Calibration State
  const [showCalibration, setShowCalibration] = useState(false)
  const [scoringPreset, setScoringPreset] = useState('balanced') // 'balanced' | 'skills_first' | 'seniority_heavy'
  const [skillsWeight, setSkillsWeight] = useState(50)
  const [expWeight, setExpWeight] = useState(30)
  const [domainWeight, setDomainWeight] = useState(20)
  const [strictMustHaves, setStrictMustHaves] = useState(false)

  const email = localStorage.getItem('hiresense_email') || ''
  const name = localStorage.getItem('hiresense_name') || ''
  const initial = (name || email || '?').trim()[0]?.toUpperCase() || '?'

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_email')
    localStorage.removeItem('hiresense_name')
    localStorage.removeItem('hiresense_role')
    navigate('/recruiter/login')
  }

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files)
    const valid = []
    for (const f of selected) {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        setError(`Skipped '${f.name}': Only PDF files are supported.`)
        continue
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setError(`Skipped '${f.name}': Exceeds 5MB size limit.`)
        continue
      }
      valid.push(f)
    }
    const combined = [...files, ...valid].slice(0, MAX_FILES)
    setFiles(combined)
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleGenerateJd = async (e) => {
    e.preventDefault()
    if (!builderTitle.trim()) return
    setBuildingJd(true)
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/generate-jd`,
        {
          job_title: builderTitle.trim(),
          experience_level: builderLevel,
          industry: builderIndustry,
          raw_notes: builderNotes.trim()
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` },
          timeout: 45000
        }
      )
      if (isMountedRef.current) {
        setGeneratedJd(res.data.data)
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        navigate('/recruiter/login')
        return
      }
      if (isMountedRef.current) {
        alert(extractErrorMessage(err, 'Failed to generate job description.'))
      }
    } finally {
      if (isMountedRef.current) {
        setBuildingJd(false)
      }
    }
  }

  const applyGeneratedJd = () => {
    if (generatedJd?.formatted_jd_text) {
      setJd(generatedJd.formatted_jd_text)
    }
    setShowJdModal(false)
  }

  const handlePresetChange = (preset) => {
    setScoringPreset(preset)
    if (preset === 'balanced') {
      setSkillsWeight(50)
      setExpWeight(30)
      setDomainWeight(20)
    } else if (preset === 'skills_first') {
      setSkillsWeight(70)
      setExpWeight(20)
      setDomainWeight(10)
    } else if (preset === 'seniority_heavy') {
      setSkillsWeight(40)
      setExpWeight(50)
      setDomainWeight(10)
    }
  }

  const handleSubmit = async () => {
    if (files.length === 0) return setError('Please upload at least one candidate resume PDF.')
    const cleanJd = jd.trim()
    if (cleanJd.length < 30) return setError(`Job description too short (${cleanJd.length} chars). Please enter at least 30 characters.`)

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('job_description', cleanJd)
      files.forEach((f) => formData.append('files', f))
      formData.append('skills_weight', (skillsWeight / 100).toString())
      formData.append('exp_weight', (expWeight / 100).toString())
      formData.append('domain_weight', (domainWeight / 100).toString())
      formData.append('strict_must_haves', strictMustHaves ? 'true' : 'false')

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
      if (isMountedRef.current) {
        navigate(`/recruiter/results/${response.data.job_posting_id}`)
      }

    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        navigate('/recruiter/login')
        return
      }
      if (isMountedRef.current) {
        const errorMsg = extractErrorMessage(err, 'Failed to rank candidates. Please check the files and try again.')
        setError(errorMsg)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 font-sans" onClick={() => { setProfileOpen(false); setNotifOpen(false) }}>
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 bg-white relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

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
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="text-xs text-gray-600 hover:text-emerald-600 font-bold hidden md:inline"
          >
            Campaign History
          </button>

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
                  onClick={() => navigate('/recruiter/dashboard')}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 transition text-left"
                >
                  <Users className="w-4 h-4 text-emerald-600" /> Recruiter Dashboard
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

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>BULK SCREENING & TALENT BENCHMARKING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Launch Candidate Screening Batch
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Upload up to {MAX_FILES} candidate resumes and paste a Job Description — AI will rank, calculate seniority & salary fit, and generate interview probing kits.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
          {/* Job Description Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700">
                Job Description (Target Benchmark)
              </label>
              <button
                type="button"
                onClick={() => setShowJdModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200/60 transition"
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>✨ AI Smart JD Builder</span>
              </button>
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-2xl p-4 text-xs sm:text-sm text-gray-700 resize-none focus:outline-none focus:border-emerald-500 transition bg-gray-50/40"
              rows={7}
              placeholder="Paste the complete job description here (responsibilities, required skills, tools, qualifications) or click '✨ AI Smart JD Builder' to generate one..."
              value={jd}
              onChange={(e) => {
                setJd(e.target.value)
                if (error) setError('')
              }}
            />
          </div>

          {/* Resumes Upload Box */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Upload Candidate Resumes ({files.length}/{MAX_FILES})
            </label>
            <div
              className="border-2 border-dashed border-gray-200 hover:border-emerald-400 bg-gray-50/50 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition group"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm text-gray-800 font-bold">Click or drag candidate resumes here</div>
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
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pt-1">
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

          {/* Advanced Scoring Calibration (Custom Recruiter Weights) */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
            <button
              type="button"
              onClick={() => setShowCalibration(!showCalibration)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-700 hover:text-emerald-700 transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">⚙️</span>
                <span>Advanced AI Scoring Calibration &amp; Custom Weights</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {showCalibration ? 'Hide Settings ▲' : 'Customize Weights ▼'}
              </span>
            </button>

            {showCalibration && (
              <div className="pt-2 space-y-4 border-t border-gray-100 animate-fadeIn text-xs">
                {/* Weight Preset Pills */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5 uppercase tracking-wide">
                    Scoring Strategy Preset:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'balanced', label: '⚖️ Balanced', desc: '50% Skills, 30% Exp, 20% Domain' },
                      { id: 'skills_first', label: '💻 Skills-Heavy', desc: '70% Skills, 20% Exp, 10% Domain' },
                      { id: 'seniority_heavy', label: '👔 Seniority-First', desc: '40% Skills, 50% Exp, 10% Domain' },
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetChange(preset.id)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          scoringPreset === preset.id
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold ring-2 ring-emerald-500/10'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-bold text-xs">{preset.label}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Sliders */}
                <div className="grid sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>Hard Skills Fit:</span>
                      <span className="text-emerald-600">{skillsWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={skillsWeight}
                      onChange={(e) => { setSkillsWeight(Number(e.target.value)); setScoringPreset('custom') }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>Experience &amp; YOE:</span>
                      <span className="text-teal-600">{expWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={expWeight}
                      onChange={(e) => { setExpWeight(Number(e.target.value)); setScoringPreset('custom') }}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>Domain &amp; Title Fit:</span>
                      <span className="text-indigo-600">{domainWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={domainWeight}
                      onChange={(e) => { setDomainWeight(Number(e.target.value)); setScoringPreset('custom') }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Strict Must-Have Skills Gate Toggle */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
                  <div>
                    <span className="font-bold text-gray-800 block">Strict Must-Have Skills Gate</span>
                    <span className="text-[11px] text-gray-400">
                      Downrank candidates who miss non-negotiable core technologies
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={strictMustHaves}
                    onChange={(e) => setStrictMustHaves(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto text-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{loading ? `Screening & Scoring ${files.length} Candidates...` : 'Rank & Benchmark Candidates →'}</span>
          </button>

          {loading && (
            <div className="text-center text-xs text-gray-400 animate-pulse font-medium">
              Extracting skills, evaluating experience, and computing ranking matrices...
            </div>
          )}
        </div>
      </main>

      {/* AI Smart JD Builder Modal */}
      {showJdModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">AI Smart Job Description Builder</h3>
                  <p className="text-[11px] text-gray-400">Generate high-conversion, ATS-optimized job requirements</p>
                </div>
              </div>
              <button
                onClick={() => setShowJdModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateJd} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Target Job Title *</label>
                <input
                  type="text"
                  required
                  value={builderTitle}
                  onChange={(e) => setBuilderTitle(e.target.value)}
                  placeholder="e.g. Lead Full Stack AI Engineer, Senior DevOps"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Seniority Level</label>
                  <select
                    value={builderLevel}
                    onChange={(e) => setBuilderLevel(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Fresher / Entry">Fresher / Entry (0-1 yrs)</option>
                    <option value="Junior">Junior (1-3 yrs)</option>
                    <option value="Mid-Level">Mid-Level (3-6 yrs)</option>
                    <option value="Senior">Senior (6-10 yrs)</option>
                    <option value="Lead / Principal">Lead / Principal (10+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Industry / Domain</label>
                  <input
                    type="text"
                    value={builderIndustry}
                    onChange={(e) => setBuilderIndustry(e.target.value)}
                    placeholder="e.g. SaaS, Fintech, Healthtech"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Key Must-Haves / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={builderNotes}
                  onChange={(e) => setBuilderNotes(e.target.value)}
                  placeholder="e.g. Must have FastAPI, Docker, and experience with high-scale APIs..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={buildingJd || !builderTitle.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{buildingJd ? 'Generating Optimized JD...' : 'Generate with AI'}</span>
              </button>
            </form>

            {/* Generated JD Preview */}
            {generatedJd && (
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Generated JD Preview (ATS Realism: {generatedJd.ats_realism_score || 95}%)
                  </span>
                  <span className="text-xs font-bold text-emerald-700">{generatedJd.estimated_salary_range}</span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="font-bold text-gray-900">{generatedJd.job_title} ({generatedJd.experience_level})</div>
                  <p className="text-gray-600">{generatedJd.summary}</p>
                  
                  <div className="pt-1">
                    <span className="font-bold text-gray-900 block mb-1">Must-Have Core Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {generatedJd.must_have_skills?.map((s) => (
                        <span key={s} className="bg-emerald-100 text-emerald-900 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={applyGeneratedJd}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Screening Form</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
