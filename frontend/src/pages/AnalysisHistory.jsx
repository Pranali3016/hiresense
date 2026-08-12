import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FileText, ChevronDown, Calendar, Search, CheckCircle2, AlertCircle, Sparkles, ArrowRight, RotateCcw } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { extractErrorMessage } from '../utils/apiError'

export default function AnalysisHistory() {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('all')
  const isMountedRef = useRef(true)

  const fetchHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/dashboard/history`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 20000 }
      )
      if (isMountedRef.current) {
        setAnalyses(res.data.analyses || [])
      }
    } catch (e) {
      if (isMountedRef.current) {
        setError(extractErrorMessage(e, 'Could not load your analysis history.'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchHistory()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const scoreBadgeStyle = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-red-700 bg-red-50 border-red-200'
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredAnalyses = analyses.filter(a => {
    const matchesQuery = (a.job_title || '').toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesQuery) return false
    if (filterTab === 'high') return a.overall_score >= 70
    if (filterTab === 'gaps') return a.overall_score < 70
    return true
  })

  return (
    <DashboardLayout
      title="Analysis History"
      subtitle={`${analyses.length} total career evaluation${analyses.length === 1 ? '' : 's'} recorded`}
      action={
        <button onClick={() => navigate('/analyze')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="w-4 h-4" />
          <span>+ New Analysis</span>
        </button>
      }
    >
      <div className="max-w-4xl space-y-5 sm:space-y-6">
        {/* Search & Filter Header */}
        {analyses.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100/70 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All ({analyses.length})
              </button>
              <button
                onClick={() => setFilterTab('high')}
                className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'high' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Strong (70%+)
              </button>
              <button
                onClick={() => setFilterTab('gaps')}
                className={`flex-1 sm:flex-none text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'gaps' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Needs Focus
              </button>
            </div>
          </div>
        )}

        {loading && !analyses.length && (
          <div className="text-xs sm:text-sm text-gray-400 py-16 text-center animate-pulse">
            Loading your analysis history...
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto text-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {!loading && analyses.length === 0 && !error && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-14 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No analyses yet</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-6">
              Upload your resume and a target job description to get instant AI match scoring & gap suggestions.
            </p>
            <button onClick={() => navigate('/analyze')} className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-emerald-700 transition shadow-sm">
              Run your first analysis →
            </button>
          </div>
        )}

        {!loading && filteredAnalyses.length === 0 && analyses.length > 0 && (
          <div className="text-center py-12 text-xs sm:text-sm text-gray-400 bg-white border border-gray-100 rounded-3xl">
            No analyses match your current search or filter criteria.
          </div>
        )}

        <div className="space-y-3">
          {filteredAnalyses.map((a) => (
            <div key={a.id} className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left hover:bg-gray-50/70 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold text-xs sm:text-sm border ${scoreBadgeStyle(a.overall_score)}`}>
                    {a.overall_score}%
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-bold text-gray-900 truncate">{a.job_title || 'Untitled Role'}</div>
                    <div className="text-[11px] sm:text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(a.created_at)}</span>
                      <span className="mx-1">•</span>
                      <span>{a.matched_skills?.length || 0} matched</span>
                      <span className="mx-1">•</span>
                      <span className="text-red-500">{a.missing_skills?.length || 0} gaps</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 hidden sm:inline-block">View details</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded === a.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded === a.id && (
                <div className="px-4 sm:px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Matched Skills */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Matched Skills ({a.matched_skills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!a.matched_skills || a.matched_skills.length === 0) && (
                          <span className="text-xs text-gray-400">No matched skills recorded</span>
                        )}
                        {a.matched_skills?.map((s) => (
                          <span key={s} className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200/50 capitalize">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills / Gaps */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-2.5">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>Skill Gaps ({a.missing_skills?.length || 0})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!a.missing_skills || a.missing_skills.length === 0) && (
                          <span className="text-xs text-emerald-600 font-medium">No skill gaps identified!</span>
                        )}
                        {a.missing_skills?.map((s) => (
                          <button
                            key={s}
                            onClick={() => navigate(`/syllabus/${s}`)}
                            className="group flex items-center gap-1 text-xs bg-red-50 text-red-600 font-medium px-2.5 py-1 rounded-full border border-red-200/50 capitalize hover:bg-red-100 transition"
                            title={`Learn ${s}`}
                          >
                            <span>{s}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
