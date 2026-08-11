import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

export default function RecruiterResults() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    const cached = localStorage.getItem('hiresense_recruiter_result')
    if (cached) {
      const parsed = JSON.parse(cached)
      if (String(parsed.job_posting_id) === String(jobId)) {
        setData(parsed)
        setLoading(false)
        return
      }
    }

    const fetchResults = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/recruiter/job/${jobId}`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 30000 }
        )
        setData(res.data)
      } catch (e) {
        setError('Could not load results. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [jobId])

  const getScoreBadgeStyle = (score) => {
    if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-600 border-red-200'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-gray-900 text-lg">HireSense</span>
          <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full ml-1">Recruiter</span>
        </div>
        <button onClick={() => navigate('/recruiter/analyze')} className="text-sm text-emerald-600 font-medium hover:underline">
          + New ranking
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {loading && (
          <div className="text-center py-20 text-sm text-gray-400">Loading results...</div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">{error}</div>
        )}

        {data && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Top Candidates</h1>
              <p className="text-sm text-gray-500 mt-1">{data.job_title || 'Job posting'} · {data.candidates.length} candidates ranked</p>
            </div>

            {data.errors && data.errors.length > 0 && (
              <div className="bg-amber-50 text-amber-700 text-sm rounded-xl p-4 mb-6">
                {data.errors.length} file{data.errors.length !== 1 ? 's' : ''} couldn't be processed: {data.errors.map(e => e.filename).join(', ')}
              </div>
            )}

            <div className="space-y-3">
              {data.candidates.map((c, i) => (
                <div key={c.id} className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
                  {/* Collapsed view: shows ONLY Name, Winner Tag (for top candidate), and Score */}
                  <div
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/80 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                        {c.candidate_name}
                      </span>
                      {i === 0 && (
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-300/40 shadow-sm flex-shrink-0">
                          🏆 Winner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className={`px-3.5 py-1.5 rounded-full font-bold text-sm sm:text-base border ${getScoreBadgeStyle(c.overall_score)}`}>
                        {c.overall_score}%
                      </div>
                      {expandedId === c.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded view: shows Why Score Match, Matched Skills, and Gaps */}
                  {expandedId === c.id && (
                    <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50/50 pt-5 space-y-5 transition-all">
                      {c.resume_filename && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Resume file: {c.resume_filename}</span>
                        </div>
                      )}

                      {/* Why Score Match */}
                      <div className="bg-white border border-emerald-100/80 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 tracking-wide uppercase mb-2">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          Why Score Match ({c.overall_score}%)
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {c.explanation || 'No detailed explanation available.'}
                        </p>
                      </div>

                      {/* Matched Skills and Gaps Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Matched Skills */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 tracking-wide uppercase mb-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Matched Skills ({c.matched_skills?.length || 0})
                          </div>
                          {c.matched_skills && c.matched_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {c.matched_skills.map((s) => (
                                <span key={s} className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200/50">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">No matched skills recorded.</p>
                          )}
                        </div>

                        {/* Skill Gaps */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold text-red-500 tracking-wide uppercase mb-3">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Gaps ({c.missing_skills?.length || 0})
                          </div>
                          {c.missing_skills && c.missing_skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {c.missing_skills.map((s) => (
                                <span key={s} className="text-xs bg-red-50 text-red-600 font-medium px-2.5 py-1 rounded-full border border-red-200/50">
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
      </div>
    </div>
  )
}

