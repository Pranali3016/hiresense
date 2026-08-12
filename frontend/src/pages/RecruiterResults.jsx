import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react'
import { extractErrorMessage } from '../utils/apiError'

export default function RecruiterResults() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const isMountedRef = useRef(true)

  const fetchResults = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/job/${jobId}`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 30000 }
      )
      if (isMountedRef.current) {
        setData(res.data)
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
    const cached = localStorage.getItem('hiresense_recruiter_result')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (String(parsed.job_posting_id) === String(jobId)) {
          setData(parsed)
          setLoading(false)
          return
        }
      } catch (_) {
        // Fallback to network fetch
      }
    }

    fetchResults()
    return () => {
      isMountedRef.current = false
    }
  }, [jobId])

  const getScoreBadgeStyle = (score) => {
    if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-600 border-red-200'
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 bg-white">
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
        <button
          onClick={() => navigate('/recruiter/analyze')}
          className="text-xs sm:text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1"
        >
          <span>+ New Ranking</span>
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">
        {loading && (
          <div className="text-center py-20 text-xs text-gray-400 font-semibold animate-pulse">
            Loading candidate ranking matrix...
          </div>
        )}

        {error && !data && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={fetchResults}
              disabled={loading}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto text-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {data && (
          <>
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">Hiring Benchmark</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{data.job_title || 'Ranked Candidates'}</h1>
                <p className="text-xs text-gray-400 mt-0.5">{data.candidates?.length || 0} candidates evaluated and scored</p>
              </div>
              <button
                onClick={() => navigate('/recruiter/analyze')}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
              >
                + Rank More Resumes
              </button>
            </div>

            {data.errors && data.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl p-4">
                <strong>{data.errors.length} file{data.errors.length !== 1 ? 's' : ''} skipped:</strong> {data.errors.map(e => e.filename).join(', ')}
              </div>
            )}

            <div className="space-y-3">
              {data.candidates?.map((c, i) => (
                <div key={c.id} className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                  {/* Collapsed Header */}
                  <div
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-gray-50/80 transition-all duration-200 gap-3"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                        #{i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {c.candidate_name}
                          </span>
                          {i === 0 && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                              🏆 Winner
                            </span>
                          )}
                        </div>
                        {c.resume_filename && (
                          <div className="text-[11px] text-gray-400 truncate max-w-xs sm:max-w-md mt-0.5">
                            {c.resume_filename}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <div className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-extrabold text-xs sm:text-sm border ${getScoreBadgeStyle(c.overall_score)}`}>
                        {c.overall_score}% Match
                      </div>
                      {expandedId === c.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === c.id && (
                    <div className="px-4 sm:px-6 pb-5 border-t border-gray-100 bg-gray-50/50 pt-4 space-y-4">
                      {/* Why Score Match */}
                      <div className="bg-white border border-emerald-100/80 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span>AI Candidate Evaluation ({c.overall_score}%)</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                          {c.explanation || 'No detailed explanation available.'}
                        </p>
                      </div>

                      {/* Matched Skills and Gaps Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                        {/* Matched Skills */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Matched Skills ({c.matched_skills?.length || 0})</span>
                          </div>
                          {c.matched_skills && c.matched_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {c.matched_skills.map((s) => (
                                <span key={s} className="text-[11px] sm:text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-lg border border-emerald-200/50 capitalize">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">No matched skills recorded.</p>
                          )}
                        </div>

                        {/* Skill Gaps */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wide mb-2.5">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span>Skill Gaps ({c.missing_skills?.length || 0})</span>
                          </div>
                          {c.missing_skills && c.missing_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {c.missing_skills.map((s) => (
                                <span key={s} className="text-[11px] sm:text-xs bg-red-50 text-red-600 font-medium px-2.5 py-1 rounded-lg border border-red-200/50 capitalize">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-emerald-600 font-medium">No missing skill gaps!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
