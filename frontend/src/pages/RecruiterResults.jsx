import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertCircle, RotateCcw,
  ArrowLeft, EyeOff, Eye, Download, MessageSquare, Scale, Users, Send,
  HelpCircle, Mail, Copy, Check, Printer, FileSpreadsheet, X, ShieldAlert,
  Award, Briefcase, DollarSign, Clock, Star, Zap, Bookmark, Calendar,
  ThumbsDown, CheckCircle, Filter, Edit3, MessageCircle, FileText,
  ExternalLink, ClipboardList, CheckSquare
} from 'lucide-react'
import { extractErrorMessage } from '../utils/apiError'

const GREEK_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega']

const STAGES = [
  { id: 'under_review', label: 'Under Review', icon: Clock, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { id: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'interview_scheduled', label: 'Interview Scheduled', icon: Calendar, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'rejected', label: 'Rejected', icon: ThumbsDown, color: 'bg-rose-100 text-rose-800 border-rose-300' },
]

function parseInlineStyles(text) {
  if (!text) return text
  // Split by bold patterns **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldText = part.slice(2, -2)
      return (
        <strong key={i} className="font-extrabold text-gray-950">
          {boldText}
        </strong>
      )
    }
    // Check for *italic*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.includes('**')) {
      return (
        <span key={i} className="italic text-gray-700">
          {part.slice(1, -1)}
        </span>
      )
    }
    return part
  })
}

function FormattedAiMessage({ content, isRecruiter }) {
  if (isRecruiter) {
    return <div className="whitespace-pre-line text-white font-medium">{content}</div>
  }

  const lines = (content || '').split('\n')

  return (
    <div className="space-y-2 text-xs text-gray-800 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-0.5" />

        // Header ###
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const headerText = trimmed.replace(/^#+\s*/, '')
          return (
            <h4 key={idx} className="font-black text-sm text-gray-900 pt-1 pb-0.5 border-b border-gray-100">
              {parseInlineStyles(headerText)}
            </h4>
          )
        }

        // Bullet points (*, -, +)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('+ ')) {
          const bulletContent = trimmed.replace(/^[\*\-\+]\s+/, '')
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="flex-1 text-gray-800">{parseInlineStyles(bulletContent)}</div>
            </div>
          )
        }

        // Standard paragraph
        return (
          <p key={idx} className="my-0.5">
            {parseInlineStyles(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

export default function RecruiterResults() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [activeTab, setActiveTab] = useState('leaderboard') // 'leaderboard' | 'chat' | 'compare'
  const [stageFilter, setStageFilter] = useState('all')
  const isMountedRef = useRef(true)

  // Bias-Free / Blind Screening Mode
  const [blindMode, setBlindMode] = useState(false)

  // Gap Questions Modal
  const [gapModalCandidate, setGapModalCandidate] = useState(null)
  const [gapQuestions, setGapQuestions] = useState(null)
  const [loadingGapQ, setLoadingGapQ] = useState(false)

  // Outreach Email Modal
  const [emailModalCandidate, setEmailModalCandidate] = useState(null)
  const [emailType, setEmailType] = useState('invitation') // 'invitation' | 'rejection_feedback'
  const [emailDraft, setEmailDraft] = useState(null)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  // AI 30-Second Elevator Pitch Modal
  const [pitchCandidate, setPitchCandidate] = useState(null)
  const [pitchData, setPitchData] = useState(null)
  const [loadingPitch, setLoadingPitch] = useState(false)

  // Resume In-App Reader Drawer
  const [resumeCandidate, setResumeCandidate] = useState(null)
  const [resumeViewMode, setResumeViewMode] = useState('pdf') // 'pdf' | 'text'
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [copiedRawText, setCopiedRawText] = useState(false)

  // Standardized Interview Scorecard Rubric Modal
  const [scorecardCandidate, setScorecardCandidate] = useState(null)
  const [scorecardData, setScorecardData] = useState(null)
  const [loadingScorecard, setLoadingScorecard] = useState(false)
  const [scorecardScores, setScorecardScores] = useState({})
  const [selectedRecommendation, setSelectedRecommendation] = useState('Hire')
  const [scorecardNotes, setScorecardNotes] = useState('')
  const [savingScorecard, setSavingScorecard] = useState(false)
  const [scorecardSaved, setScorecardSaved] = useState(false)

  // Candidate Pool RAG Chat
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Head-to-Head Comparison
  const [selectedForCompare, setSelectedForCompare] = useState([])

  // Notes Editing State
  const [editingNotesId, setEditingNotesId] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('hiresense_token')}`
  }

  const fetchResults = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/job/${jobId}`,
        { headers: authHeaders, timeout: 30000 }
      )
      if (isMountedRef.current) {
        setData(res.data)
        if (res.data?.candidates?.length > 0) {
          setSelectedForCompare(res.data.candidates.slice(0, 2).map((c) => c.id))
        }
      }
    } catch (e) {
      if (isMountedRef.current) {
        setError(extractErrorMessage(e, 'Could not load candidate results. Please try again.'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchResults()
    return () => {
      isMountedRef.current = false
    }
  }, [jobId])

  const getScoreBadgeStyle = (score) => {
    if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-600 border-red-200'
  }

  const getDisplayName = (candidate, index) => {
    if (blindMode) {
      const greek = GREEK_NAMES[index % GREEK_NAMES.length]
      return `Candidate #${index + 1} (${greek})`
    }
    return candidate.candidate_name || `Candidate #${index + 1}`
  }

  // --- Pipeline Status & Rating Updater ---
  const handleUpdateWorkflow = async (candidateId, updates) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${candidateId}/status`,
        updates,
        { headers: authHeaders }
      )
      setData((prev) => {
        if (!prev) return prev
        const updated = prev.candidates.map((c) =>
          c.id === candidateId ? { ...c, ...updates } : c
        )
        return { ...prev, candidates: updated }
      })
    } catch (err) {
      alert(extractErrorMessage(err, 'Failed to update candidate status.'))
    }
  }

  // --- Save Notes ---
  const handleSaveNote = async (candidateId) => {
    setSavingNote(true)
    await handleUpdateWorkflow(candidateId, { notes: noteText })
    setSavingNote(false)
    setEditingNotesId(null)
  }

  // --- Gap-Targeted Interview Questions Handler ---
  const handleOpenGapQuestions = async (candidate) => {
    setGapModalCandidate(candidate)
    setGapQuestions(null)
    setLoadingGapQ(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${candidate.id}/gap-questions`,
        { headers: authHeaders, timeout: 35000 }
      )
      if (isMountedRef.current) {
        setGapQuestions(res.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        alert(extractErrorMessage(err, 'Failed to generate gap-targeted questions.'))
        setGapModalCandidate(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingGapQ(false)
      }
    }
  }

  // --- AI 30-Second Elevator Pitch Handler ---
  const handleOpenElevatorPitch = async (candidate) => {
    setPitchCandidate(candidate)
    setPitchData(null)
    setLoadingPitch(true)
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${candidate.id}/pitch`,
        { headers: authHeaders, timeout: 35000 }
      )
      if (isMountedRef.current) {
        setPitchData(res.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        alert(extractErrorMessage(err, 'Failed to generate elevator pitch.'))
        setPitchCandidate(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingPitch(false)
      }
    }
  }

  // --- Interview Scorecard Rubric Handler ---
  const handleOpenScorecard = async (candidate) => {
    setScorecardCandidate(candidate)
    setScorecardData(null)
    setScorecardScores({})
    setSelectedRecommendation(candidate.status === 'rejected' ? 'No Hire' : candidate.overall_score >= 70 ? 'Strong Hire' : 'Hire')
    setScorecardNotes(candidate.notes || '')
    setScorecardSaved(false)
    setLoadingScorecard(true)
    try {
      const token = localStorage.getItem('hiresense_token')
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${candidate.id}/scorecard`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 35000 }
      )
      if (isMountedRef.current) {
        setScorecardData(res.data)
        const initialScores = {}
        const defaultScore = candidate.overall_score >= 80 ? 5 : candidate.overall_score >= 65 ? 4 : candidate.overall_score >= 50 ? 3 : 2
        res.data.technical_rubrics?.forEach((_, idx) => {
          initialScores[idx] = defaultScore
        })
        setScorecardScores(initialScores)
      }
    } catch (err) {
      if (isMountedRef.current) {
        alert(extractErrorMessage(err, 'Failed to generate interview scorecard rubric.'))
        setScorecardCandidate(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingScorecard(false)
      }
    }
  }

  const handleSaveScorecard = async () => {
    if (!scorecardCandidate) return
    setSavingScorecard(true)
    try {
      const token = localStorage.getItem('hiresense_token')
      const scoreValues = Object.values(scorecardScores)
      const avgScore = scoreValues.length > 0 ? (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) : 3
      const starRating = Math.min(5, Math.max(1, Math.round(avgScore)))
      
      let nextStatus = scorecardCandidate.status || 'under_review'
      if (selectedRecommendation === 'Strong Hire' || selectedRecommendation === 'Hire') {
        nextStatus = 'shortlisted'
      } else if (selectedRecommendation === 'No Hire') {
        nextStatus = 'rejected'
      } else if (selectedRecommendation === 'Hold / Potential') {
        nextStatus = 'under_review'
      }

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${scorecardCandidate.id}/status`,
        {
          status: nextStatus,
          notes: scorecardNotes,
          star_rating: starRating
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (isMountedRef.current) {
        setScorecardSaved(true)
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            candidates: prev.candidates.map((c) =>
              c.id === scorecardCandidate.id
                ? { ...c, status: nextStatus, notes: scorecardNotes, star_rating: starRating }
                : c
            )
          }
        })
        setTimeout(() => {
          if (isMountedRef.current) {
            setScorecardSaved(false)
          }
        }, 3000)
      }
    } catch (err) {
      alert(extractErrorMessage(err, 'Failed to save scorecard evaluation.'))
    } finally {
      if (isMountedRef.current) {
        setSavingScorecard(false)
      }
    }
  }

  // --- In-App Resume PDF & Text Viewer Handler ---
  const handleOpenResumeViewer = async (candidate) => {
    setResumeCandidate(candidate)
    setResumeViewMode('pdf')
    setPdfBlobUrl(null)
    setPdfError('')
    setCopiedRawText(false)
    setLoadingPdf(true)

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${candidate.id}/pdf`,
        {
          headers: authHeaders,
          responseType: 'blob',
          timeout: 30000
        }
      )
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      if (isMountedRef.current) {
        setPdfBlobUrl(blobUrl)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setPdfError('PDF file not stored for this older record. Showing extracted text.')
        setResumeViewMode('text')
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingPdf(false)
      }
    }
  }

  // --- Outreach Email Handler ---
  const handleOpenEmailModal = async (candidate, type = 'invitation') => {
    setEmailModalCandidate(candidate)
    setEmailType(type)
    setEmailDraft(null)
    setLoadingEmail(true)
    setCopiedEmail(false)
    try {
      const company = localStorage.getItem('hiresense_company') || 'HireSense'
      const token = localStorage.getItem('hiresense_token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/candidate/${candidate.id}/outreach-email`,
        { email_type: type, company_name: company },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 }
      )
      if (isMountedRef.current) {
        setEmailDraft(res.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        alert(extractErrorMessage(err, 'Failed to generate email draft.'))
        setEmailModalCandidate(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingEmail(false)
      }
    }
  }

  // --- Candidate Pool RAG Chat Handler ---
  const handleSendChatMessage = async (presetText = '') => {
    const query = (presetText || chatInput).trim()
    if (!query || chatLoading) return

    const newHistory = [...chatMessages, { sender: 'recruiter', text: query }]
    setChatMessages(newHistory)
    setChatInput('')
    setChatLoading(true)

    try {
      const token = localStorage.getItem('hiresense_token')
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/job/${jobId}/chat`,
        { query },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 60000
        }
      )
      if (isMountedRef.current) {
        setChatMessages([
          ...newHistory,
          {
            sender: 'ai',
            text: res.data.answer || 'No specific insights found for this query in the candidate pool.',
            top_recommendation: res.data.top_recommendation
          }
        ])
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('hiresense_token')
        navigate('/recruiter/login')
        return
      }
      if (isMountedRef.current) {
        const errorMsg = extractErrorMessage(
          err,
          'Sorry, I could not complete this search across the candidate pool. Please try again.'
        )
        setChatMessages([
          ...newHistory,
          { sender: 'ai', text: errorMsg }
        ])
      }
    } finally {
      if (isMountedRef.current) {
        setChatLoading(false)
      }
    }
  }

  // --- Head-to-Head Toggle Handler ---
  const toggleCandidateForCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id))
    } else {
      if (selectedForCompare.length >= 3) {
        setSelectedForCompare([selectedForCompare[1], selectedForCompare[2], id])
      } else {
        setSelectedForCompare([...selectedForCompare, id])
      }
    }
  }

  // --- Export CSV Handler ---
  const handleExportCSV = () => {
    if (!data?.candidates?.length) return
    const headers = ['Rank', 'Candidate Name', 'Match Score', 'Experience', 'Seniority', 'Estimated Salary', 'Pipeline Status', 'Star Rating', 'Matched Skills', 'Missing Skills', 'Explanation']
    const rows = data.candidates.map((c, i) => [
      i + 1,
      `"${c.candidate_name || `Candidate #${i + 1}`}"`,
      `${c.overall_score}%`,
      `${c.years_of_experience || 0} YOE`,
      `"${c.seniority_level || 'Mid'}"`,
      `"${c.estimated_salary_range || 'N/A'}"`,
      `"${c.status || 'under_review'}"`,
      `${c.star_rating || 0}/5`,
      `"${(c.matched_skills || []).join(', ')}"`,
      `"${(c.missing_skills || []).join(', ')}"`,
      `"${(c.explanation || '').replace(/"/g, '""')}"`
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `HireSense_Candidate_Ranking_${jobId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrintDossier = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-base font-extrabold text-gray-900">Loading Candidate Intelligence...</div>
          <div className="text-xs text-gray-400">Parsing scores, missing skill gaps, and experience matrices</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Unable to Load Candidates</h2>
          <p className="text-xs text-gray-500">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={fetchResults}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => navigate('/recruiter/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const candidates = data?.candidates || []
  const filteredCandidates = stageFilter === 'all'
    ? candidates
    : candidates.filter((c) => (c.status || 'under_review') === stageFilter)

  const comparedCandidates = candidates.filter((c) => selectedForCompare.includes(c.id))

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="no-print flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recruiter/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          {/* Bias-Free Screening Mode Toggle */}
          <button
            onClick={() => setBlindMode(!blindMode)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
              blindMode
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/20'
                : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
            }`}
            title="Anonymize candidate names and demographic cues to prevent unconscious bias"
          >
            {blindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{blindMode ? 'Blind Mode: ON' : 'Blind Mode'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 transition"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Executive Dossier Print */}
          <button
            onClick={handlePrintDossier}
            className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 transition"
            title="Print Executive Dossier"
          >
            <Printer className="w-3.5 h-3.5 text-gray-600" />
            <span className="hidden md:inline">Dossier</span>
          </button>

          <button
            onClick={() => navigate('/recruiter/analyze')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
          >
            + New Screening
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* Campaign Header & Job Description Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ACTIVE CAMPAIGN #{jobId}
                </span>
                <span className="text-xs text-gray-400">• {candidates.length} Resumes Evaluated</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {data?.job_title || 'Candidate Screening Benchmark'}
              </h1>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center min-w-[90px]">
                <div className="text-xl font-black text-emerald-700">
                  {candidates.length > 0 ? `${candidates[0].overall_score}%` : '0%'}
                </div>
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-tight">Top Match</div>
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-3 text-center min-w-[90px]">
                <div className="text-xl font-black text-teal-700">
                  {candidates.length > 0
                    ? `${Math.round(candidates.reduce((acc, c) => acc + (c.overall_score || 0), 0) / candidates.length)}%`
                    : '0%'}
                </div>
                <div className="text-[10px] font-bold text-teal-800 uppercase tracking-tight">Pool Avg</div>
              </div>
            </div>
          </div>

          {/* Expandable JD Summary */}
          {data?.job_description && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 text-xs text-gray-600 space-y-1">
              <div className="font-bold text-gray-800 flex items-center justify-between">
                <span>Target Job Description:</span>
              </div>
              <p className="line-clamp-2 text-gray-500">{data.job_description}</p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="no-print flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Leaderboard ({candidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition shrink-0 ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Chat (RAG)</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition shrink-0 ${
              activeTab === 'compare'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Head-to-Head ({comparedCandidates.length}/3)</span>
          </button>
        </div>

        {/* TAB 1: LEADERBOARD & CANDIDATE CARDS */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            
            {/* Pipeline Stage Filter Bar */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>Filter Pipeline Stage:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setStageFilter('all')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                    stageFilter === 'all'
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  All ({candidates.length})
                </button>
                {STAGES.map((s) => {
                  const count = candidates.filter((c) => (c.status || 'under_review') === s.id).length
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStageFilter(s.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                        stageFilter === s.id
                          ? `${s.color} ring-2 ring-emerald-500/20`
                          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      <span>{s.label} ({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Candidate List */}
            {filteredCandidates.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center space-y-2">
                <div className="text-gray-400 font-bold text-sm">No candidates in this pipeline stage.</div>
                <button
                  onClick={() => setStageFilter('all')}
                  className="text-xs text-emerald-600 font-extrabold hover:underline"
                >
                  View All Candidates
                </button>
              </div>
            ) : (
              filteredCandidates.map((c, index) => {
                const isExpanded = expandedId === c.id
                const isCompared = selectedForCompare.includes(c.id)
                const currentStage = STAGES.find((s) => s.id === (c.status || 'under_review')) || STAGES[0]

                return (
                  <div
                    key={c.id}
                    className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-sm ${
                      isCompared ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        {/* Rank Badge / Compare Selector */}
                        <div className="flex flex-col items-center gap-1.5 pt-0.5">
                          <span className="w-7 h-7 rounded-xl bg-gray-100 text-gray-700 font-black text-xs flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={() => toggleCandidateForCompare(c.id)}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer no-print"
                            title="Select to compare side-by-side"
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">
                              {getDisplayName(c, index)}
                            </h3>

                            {/* Top Winner Badge */}
                            {index === 0 && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                                <Award className="w-3 h-3 text-amber-600" />
                                <span>#1 Top Pick</span>
                              </span>
                            )}

                            {/* Current Stage Badge */}
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${currentStage.color}`}>
                              <currentStage.icon className="w-3 h-3" />
                              <span>{currentStage.label}</span>
                            </span>
                          </div>

                          {!blindMode && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-sm">
                              {c.resume_filename}
                            </p>
                          )}

                          {/* Seniority, Salary, & Experience Chips */}
                          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                              <span>{c.seniority_level || 'Mid-Level'}</span>
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span>{c.years_of_experience || 0} YOE</span>
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              <DollarSign className="w-3 h-3" />
                              <span>Est: {c.estimated_salary_range || '₹12 - ₹24 LPA'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score & Primary Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        {/* Interactive Star Rating */}
                        <div className="no-print flex items-center gap-0.5 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleUpdateWorkflow(c.id, { star_rating: star === c.star_rating ? 0 : star })}
                              className="p-0.5 hover:scale-110 transition"
                              title={`Rate ${star} stars`}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  star <= (c.star_rating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300 hover:text-amber-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        {/* Overall Match Score */}
                        <div className={`px-4 py-2 rounded-2xl border text-center font-black text-lg sm:text-xl ${getScoreBadgeStyle(c.overall_score)}`}>
                          {c.overall_score}%
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : c.id)}
                          className="no-print p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition"
                          aria-label="Toggle details"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Action Buttons Row */}
                    <div className="no-print flex flex-wrap items-center gap-2 pt-4 mt-3 border-t border-gray-100">
                      {/* AI 30-Second Elevator Pitch */}
                      <button
                        onClick={() => handleOpenElevatorPitch(c)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200 transition"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>⚡ 30s Pitch</span>
                      </button>

                      {/* Standardized Interview Scorecard Rubric */}
                      <button
                        onClick={() => handleOpenScorecard(c)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                        <span>📋 Scorecard Rubric</span>
                      </button>

                      {/* Gap Questions Button */}
                      <button
                        onClick={() => handleOpenGapQuestions(c)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                        <span>🎯 Gap Questions ({c.missing_skills?.length || 0})</span>
                      </button>

                      {/* Resume In-App Reader */}
                      <button
                        onClick={() => handleOpenResumeViewer(c)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-gray-600" />
                        <span>📄 Resume Reader</span>
                      </button>

                      {/* 1-Click Outreach Email */}
                      <button
                        onClick={() => handleOpenEmailModal(c, 'invitation')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✉️ Outreach</span>
                      </button>

                      {/* Stage Changer Dropdown */}
                      <div className="ml-auto flex items-center gap-1">
                        {STAGES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => handleUpdateWorkflow(c.id, { status: s.id })}
                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                              (c.status || 'under_review') === s.id
                                ? `${s.color} font-black shadow-xs`
                                : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                            title={`Move to ${s.label}`}
                          >
                            <s.icon className="w-3 h-3 inline mr-1" />
                            <span>{s.label.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fadeIn">
                        {/* Explanation Paragraph */}
                        {c.explanation && (
                          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 text-xs text-gray-700 leading-relaxed">
                            <span className="font-bold text-gray-900 block mb-1">AI Match Breakdown &amp; Rationale:</span>
                            {c.explanation}
                          </div>
                        )}

                        {/* Matched vs Missing Skills Grid */}
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Matched Skills ({c.matched_skills?.length || 0})</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {c.matched_skills?.map((s) => (
                                <span key={s} className="bg-white text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-3.5 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              <span>Missing Gaps for this JD ({c.missing_skills?.length || 0})</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {c.missing_skills?.map((s) => (
                                <span key={s} className="bg-white text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-rose-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Internal Recruiter Notes */}
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 space-y-2 no-print">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                            <span className="flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                              <span>Internal Recruiter Notes:</span>
                            </span>
                            {editingNotesId !== c.id && (
                              <button
                                onClick={() => { setEditingNotesId(c.id); setNoteText(c.notes || '') }}
                                className="text-[11px] text-emerald-600 hover:underline font-bold"
                              >
                                {c.notes ? 'Edit Note' : '+ Add Note'}
                              </button>
                            )}
                          </div>

                          {editingNotesId === c.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add team interview feedback, salary expectations, or observations..."
                                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                                rows={3}
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingNotesId(null)}
                                  className="text-xs text-gray-500 hover:bg-gray-200 px-2.5 py-1 rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveNote(c.id)}
                                  disabled={savingNote}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg"
                                >
                                  {savingNote ? 'Saving...' : 'Save Note'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600 italic">
                              {c.notes || 'No internal notes added yet.'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 2: CANDIDATE POOL RAG CHAT */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg">Candidate Pool AI Chat (RAG Engine)</h2>
                <p className="text-xs text-gray-500">
                  Ask natural language questions across all {candidates.length} candidate resumes uploaded in this batch.
                </p>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-2">
              {[
                'Who has experience in Python and FastAPI?',
                'Compare the top 2 candidates',
                'Who has 3+ years of experience in Docker or Cloud?',
                'Which candidate is best suited for lead architecture?'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendChatMessage(prompt)}
                  className="text-xs font-semibold bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 transition text-left"
                >
                  💡 {prompt}
                </button>
              ))}
            </div>

            {/* Chat Conversation Thread */}
            <div className="border border-gray-100 rounded-2xl p-4 min-h-[300px] max-h-[480px] overflow-y-auto space-y-4 bg-gray-50/40">
              {chatMessages.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-400 space-y-1">
                  <Sparkles className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                  <div className="font-bold text-gray-600">No questions asked yet.</div>
                  <div>Type a query below or click one of the suggested prompts above.</div>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'recruiter' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        msg.sender === 'recruiter'
                          ? 'bg-emerald-700 text-white rounded-br-none shadow-xs'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <FormattedAiMessage content={msg.text} isRecruiter={msg.sender === 'recruiter'} />
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 text-xs text-gray-400 flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                    <span>Searching across all parsed candidate resumes...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder="Ask anything about the candidates (skills, experience, comparisons)..."
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: HEAD-TO-HEAD CANDIDATE COMPARISON */}
        {activeTab === 'compare' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-extrabold text-gray-900 text-lg">Head-to-Head Candidate Battle Matrix</h2>
                <p className="text-xs text-gray-500">
                  Side-by-side comparison of selected candidates (select checkboxes in the leaderboard).
                </p>
              </div>
            </div>

            {comparedCandidates.length < 2 ? (
              <div className="text-center py-12 text-xs text-gray-400 space-y-2">
                <Scale className="w-8 h-8 text-gray-300 mx-auto" />
                <div className="font-bold text-gray-600">Select at least 2 candidates to compare</div>
                <div>Check the boxes next to candidate names in the Leaderboard tab.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {comparedCandidates.map((c, i) => (
                  <div key={c.id} className="border border-gray-100 rounded-3xl p-5 bg-gray-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Candidate #{i + 1}</span>
                      <span className={`text-xs font-black px-3 py-1 rounded-xl border ${getScoreBadgeStyle(c.overall_score)}`}>
                        {c.overall_score}% Match
                      </span>
                    </div>

                    <h4 className="font-extrabold text-gray-900 text-base">{getDisplayName(c, i)}</h4>

                    <div className="space-y-1.5 text-xs text-gray-600">
                      <div><strong>Experience:</strong> {c.years_of_experience || 0} YOE ({c.seniority_level || 'Mid'})</div>
                      <div><strong>Est. Salary:</strong> {c.estimated_salary_range || 'N/A'}</div>
                      <div><strong>Status:</strong> {c.status || 'under_review'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-800 block">Matched Skills ({c.matched_skills?.length || 0})</span>
                      <div className="flex flex-wrap gap-1">
                        {c.matched_skills?.map((s) => (
                          <span key={s} className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-rose-800 block">Missing Gaps ({c.missing_skills?.length || 0})</span>
                      <div className="flex flex-wrap gap-1">
                        {c.missing_skills?.map((s) => (
                          <span key={s} className="bg-rose-100 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleOpenGapQuestions(c)}
                        className="flex-1 text-[11px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 py-1.5 rounded-xl transition"
                      >
                        Gap Questions
                      </button>
                      <button
                        onClick={() => handleOpenEmailModal(c, 'invitation')}
                        className="flex-1 text-[11px] font-bold bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 rounded-xl transition"
                      >
                        Outreach
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: AI 30-SECOND ELEVATOR PITCH */}
      {pitchCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    30-Second Executive Pitch
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    AI hiring brief for {pitchCandidate.candidate_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPitchCandidate(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingPitch ? (
              <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                <Sparkles className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                <div>Synthesizing executive pitch and talking points...</div>
              </div>
            ) : pitchData ? (
              <div className="space-y-4 text-xs">
                {/* One Line Hook */}
                <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-amber-900 uppercase tracking-wide text-[10px]">
                      EXECUTIVE HOOK
                    </span>
                    <span className="bg-amber-200 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      {pitchData.hiring_verdict || 'Strong Hire'}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm leading-snug">
                    "{pitchData.one_line_hook}"
                  </p>
                </div>

                {/* Top Strengths */}
                <div className="space-y-1.5">
                  <span className="font-bold text-gray-800 block">Key Standout Strengths:</span>
                  <div className="space-y-1">
                    {pitchData.top_strengths?.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ramp-Up Gaps */}
                {pitchData.ramp_up_areas?.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-800 block">Areas Requiring Ramp-Up / Training:</span>
                    <div className="space-y-1">
                      {pitchData.ramp_up_areas?.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-xl text-gray-700">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manager Talking Points */}
                {pitchData.talking_points && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 text-gray-600">
                    <span className="font-bold text-gray-800 block mb-1">Hiring Manager Briefing Note:</span>
                    <p>{pitchData.talking_points}</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL 2: STANDARDIZED INTERVIEW SCORECARD RUBRIC */}
      {scorecardCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    Interview Evaluation Scorecard &amp; Rubric
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Standardized interview rubric for {scorecardCandidate.candidate_name} ({data?.job_title})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={() => setScorecardCandidate(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingScorecard ? (
              <div className="py-14 text-center text-xs text-gray-400 space-y-2">
                <Sparkles className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                <div>Generating structured interview rubrics and competency benchmarks...</div>
              </div>
            ) : scorecardData ? (
              <div className="space-y-5 text-xs">
                {/* Candidate Overview & Real-Time Score Strip */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-gray-900 text-sm">{scorecardData.candidate_name}</div>
                    <div className="text-gray-500">{scorecardData.job_title} • {scorecardData.seniority_level}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-xl border border-emerald-200">
                      Match Fit: {scorecardData.overall_score}%
                    </span>
                    {/* Live Evaluated Score */}
                    {Object.keys(scorecardScores).length > 0 && (
                      <span className="bg-blue-50 text-blue-800 font-black px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                        <span>
                          Interview Rating:{' '}
                          {(
                            Object.values(scorecardScores).reduce((a, b) => a + b, 0) /
                            Object.values(scorecardScores).length
                          ).toFixed(1)}{' '}
                          / 5.0
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Technical Rubrics Table with Interactive 1-5 Scoring */}
                <div className="space-y-2">
                  <h4 className="font-black text-gray-900 uppercase tracking-wide text-[11px] flex items-center justify-between">
                    <span>1. Technical Competencies &amp; Probing Questions</span>
                    <span className="text-gray-400 font-normal">Click 1 - 5 to score each skill</span>
                  </h4>
                  <div className="space-y-3">
                    {scorecardData.technical_rubrics?.map((rubric, idx) => {
                      const currentScore = scorecardScores[idx] || 3
                      return (
                        <div key={idx} className="border border-gray-200 rounded-2xl p-4 bg-white space-y-2.5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="font-extrabold text-gray-900 text-xs bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-md self-start">
                              {rubric.competency}
                            </span>
                            
                            {/* Interactive 1-5 Score Pills */}
                            <div className="flex items-center gap-1.5 self-start sm:self-auto">
                              <span className="text-[11px] font-bold text-gray-500 mr-1">Score:</span>
                              {[1, 2, 3, 4, 5].map((scoreNum) => (
                                <button
                                  key={scoreNum}
                                  type="button"
                                  onClick={() =>
                                    setScorecardScores((prev) => ({ ...prev, [idx]: scoreNum }))
                                  }
                                  className={`w-7 h-7 rounded-lg text-xs font-black transition flex items-center justify-center ${
                                    currentScore === scoreNum
                                      ? scoreNum >= 4
                                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                        : scoreNum === 3
                                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                                        : 'bg-rose-600 text-white shadow-xs scale-105'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {scoreNum}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="font-semibold text-gray-800 text-xs leading-relaxed">
                            <strong className="text-gray-950">Question to Ask:</strong> "{rubric.probing_question}"
                          </div>

                          <div className="grid sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div className={`p-2 rounded-xl border transition ${currentScore <= 2 ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold' : 'bg-rose-50/40 text-rose-900 border-rose-100'}`}>
                              <strong>Score 1-2 (Unacceptable):</strong> {rubric.score_1_unacceptable}
                            </div>
                            <div className={`p-2 rounded-xl border transition ${currentScore === 3 ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                              <strong>Score 3-4 (Competent):</strong> {rubric.score_3_competent}
                            </div>
                            <div className={`p-2 rounded-xl border transition ${currentScore === 5 ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-emerald-50/40 text-emerald-900 border-emerald-100'}`}>
                              <strong>Score 5 (Exceptional):</strong> {rubric.score_5_exceptional}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Behavioral & Problem Solving */}
                <div className="space-y-2">
                  <h4 className="font-black text-gray-900 uppercase tracking-wide text-[11px]">
                    2. Problem Solving &amp; Behavioral Alignment
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {scorecardData.behavioral_rubrics?.map((b, i) => (
                      <div key={i} className="border border-gray-200 rounded-2xl p-3.5 bg-gray-50/40 space-y-1.5">
                        <div className="font-bold text-gray-900">{b.competency}</div>
                        <p className="text-gray-600 italic leading-relaxed">"{b.probing_question}"</p>
                        <div className="text-[11px] text-gray-500 pt-1">
                          <strong className="text-gray-800">What to Look For:</strong> {b.look_for}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Hiring Recommendation (Mutually Exclusive Radio Cards) */}
                <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
                  <h4 className="font-black text-gray-900 uppercase tracking-wide text-[11px]">
                    3. Final Hiring Recommendation
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {scorecardData.decision_scale?.map((d) => {
                      const isSelected = selectedRecommendation === d.label
                      return (
                        <button
                          key={d.label}
                          type="button"
                          onClick={() => setSelectedRecommendation(d.label)}
                          className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? d.label.includes('Hire') && !d.label.includes('No')
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                                : d.label.includes('Hold')
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                                : 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20 shadow-xs'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs">{d.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-gray-500 leading-tight">{d.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Interviewer Notes */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 block text-xs">
                    Interviewer Notes &amp; Observations
                  </label>
                  <textarea
                    value={scorecardNotes}
                    onChange={(e) => setScorecardNotes(e.target.value)}
                    placeholder="Add specific comments on candidate coding style, architecture trade-offs, cultural alignment..."
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Footer Save & Print Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
                  {scorecardSaved ? (
                    <div className="text-emerald-700 font-extrabold text-xs flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Scorecard Evaluation Saved Successfully!</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Saving automatically updates the candidate's star rating &amp; pipeline stage.
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setScorecardCandidate(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveScorecard}
                      disabled={savingScorecard}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>{savingScorecard ? 'Saving Scorecard...' : '💾 Save Evaluation'}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL 3: IN-APP RESUME READER (VISUAL PDF & STRUCTURED TEXT) */}
      {resumeCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-fadeIn flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    Candidate Resume: {resumeCandidate.candidate_name}
                  </h3>
                  <p className="text-[11px] text-gray-400 truncate max-w-sm">
                    {resumeCandidate.resume_filename} • {resumeCandidate.seniority_level}
                  </p>
                </div>
              </div>

              {/* View Mode Toggle & Action Controls */}
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setResumeViewMode('pdf')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      resumeViewMode === 'pdf'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📄 Visual PDF
                  </button>
                  <button
                    onClick={() => setResumeViewMode('text')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      resumeViewMode === 'text'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📝 Extracted Text
                  </button>
                </div>

                {pdfBlobUrl && (
                  <>
                    <a
                      href={pdfBlobUrl}
                      download={resumeCandidate.resume_filename || 'resume.pdf'}
                      className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition text-xs flex items-center gap-1 font-semibold px-2.5"
                      title="Download original PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                    <a
                      href={pdfBlobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition text-xs flex items-center gap-1 font-semibold px-2.5"
                      title="Open PDF in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">New Tab</span>
                    </a>
                  </>
                )}

                <button
                  onClick={() => setResumeCandidate(null)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content Area */}
            <div className="flex-1 min-h-[55vh]">
              {resumeViewMode === 'pdf' ? (
                loadingPdf ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center space-y-3 text-gray-400 text-xs">
                    <Sparkles className="w-8 h-8 text-emerald-500 animate-spin" />
                    <div className="font-bold text-gray-700">Loading Original PDF from Database...</div>
                    <div className="text-[11px]">Preparing high-fidelity document viewer</div>
                  </div>
                ) : pdfBlobUrl ? (
                  <div className="w-full h-[65vh] rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100">
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=1`}
                      className="w-full h-full"
                      title={`Resume PDF of ${resumeCandidate.candidate_name}`}
                    />
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                    <div className="font-bold text-amber-900 text-sm">
                      {pdfError || 'PDF file is not stored for this older candidate batch.'}
                    </div>
                    <p className="text-xs text-amber-800/80 max-w-sm mx-auto">
                      Newly screened candidates automatically store the original PDF in the database. You can still read the full extracted text below.
                    </p>
                    <button
                      onClick={() => setResumeViewMode('text')}
                      className="bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      View Extracted Text Instead →
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Parsed Text Content:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(resumeCandidate.resume_text || '')
                        setCopiedRawText(true)
                        setTimeout(() => setCopiedRawText(false), 2000)
                      }}
                      className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1"
                    >
                      {copiedRawText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRawText ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-xs text-gray-800 font-mono whitespace-pre-line leading-relaxed h-[58vh] overflow-y-auto select-text">
                    {resumeCandidate.resume_text || 'No raw text available for this resume.'}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
              <span>Candidate #{resumeCandidate.id} • HireSense Database</span>
              <button
                onClick={() => setResumeCandidate(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GAP-TARGETED INTERVIEW QUESTIONS */}
      {gapModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                    Gap-Targeted Interview Questions
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Probing missing skills for {gapModalCandidate.candidate_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGapModalCandidate(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingGapQ ? (
              <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                <Sparkles className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                <div>Generating targeted technical probing questions with evaluation benchmarks...</div>
              </div>
            ) : gapQuestions?.questions ? (
              <div className="space-y-4">
                {gapQuestions.questions.map((q, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-100 text-purple-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-md uppercase">
                        Probing Gap: {q.gap_targeted}
                      </span>
                      <span className="text-gray-400 font-semibold">Q#{idx + 1}</span>
                    </div>

                    <div className="font-bold text-gray-900 text-sm leading-snug">
                      "{q.question}"
                    </div>

                    <div className="space-y-1.5 pt-1 text-gray-600">
                      <div>
                        <strong className="text-gray-800">Why Ask:</strong> {q.why_ask_this}
                      </div>
                      <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-100">
                        <strong className="text-emerald-800 block mb-0.5">Expected Good Answer Signal:</strong>
                        {q.expected_good_answer}
                      </div>
                      <div className="bg-rose-50 text-rose-900 p-2.5 rounded-xl border border-rose-100">
                        <strong className="text-rose-800 block mb-0.5">Red Flags / Warning Signs:</strong>
                        {q.red_flags}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL 5: 1-CLICK OUTREACH EMAIL */}
      {emailModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">AI Candidate Outreach</h3>
                  <p className="text-[11px] text-gray-400">Personalized draft for {emailModalCandidate.candidate_name}</p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalCandidate(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Type Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenEmailModal(emailModalCandidate, 'invitation')}
                className={`flex-1 text-xs font-bold py-2 rounded-xl border transition ${
                  emailType === 'invitation'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                🎉 Interview Invitation
              </button>
              <button
                onClick={() => handleOpenEmailModal(emailModalCandidate, 'rejection_feedback')}
                className={`flex-1 text-xs font-bold py-2 rounded-xl border transition ${
                  emailType === 'rejection_feedback'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                💡 Constructive Feedback
              </button>
            </div>

            {loadingEmail ? (
              <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                <Sparkles className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                <div>Drafting personalized email tailored to candidate strengths...</div>
              </div>
            ) : emailDraft ? (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs">
                  <span className="font-bold text-gray-500 block mb-0.5">Subject:</span>
                  <span className="font-bold text-gray-900">{emailDraft.subject}</span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono whitespace-pre-line text-gray-800 leading-relaxed max-h-60 overflow-y-auto">
                  {emailDraft.body}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${emailDraft.subject}\n\n${emailDraft.body}`)
                      setCopiedEmail(true)
                      setTimeout(() => setCopiedEmail(false), 2000)
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmail ? 'Copied!' : 'Copy Draft'}</span>
                  </button>

                  {/* Direct Open in Email Client (Mailto) */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(emailDraft.subject)}&body=${encodeURIComponent(emailDraft.body)}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 border border-gray-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Email App</span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
