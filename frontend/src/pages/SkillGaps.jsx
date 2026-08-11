import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertTriangle, BookOpen, Target, Sparkles, TrendingUp, ShieldAlert } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

export default function SkillGaps() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchGaps = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/dashboard/skill-gaps`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 20000 }
        )
        setData(res.data)
      } catch (e) {
        setError('Could not load your skill gaps.')
      } finally {
        setLoading(false)
      }
    }
    fetchGaps()
  }, [])

  const getPriorityBadge = (percent) => {
    if (percent >= 66) {
      return {
        label: 'High Priority',
        style: 'bg-red-50 text-red-600 border-red-200',
        bar: 'bg-gradient-to-r from-rose-500 to-red-600'
      }
    }
    if (percent >= 33) {
      return {
        label: 'Medium Priority',
        style: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-gradient-to-r from-amber-400 to-amber-500'
      }
    }
    return {
      label: 'Low Priority',
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-500'
    }
  }

  const topGap = data?.gaps?.[0]?.skill

  return (
    <DashboardLayout
      title="Skill Gaps Intelligence"
      subtitle="Recurring missing skills identified across your resume analyses"
      action={
        <button onClick={() => navigate('/analyze')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="w-4 h-4" />
          <span>+ New Analysis</span>
        </button>
      }
    >
      <div className="max-w-4xl space-y-6">
        {loading && <div className="text-sm text-gray-400 py-16 text-center">Analyzing your skill matrix...</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {data && (
          <>
            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Identified Gaps</span>
                  <Target className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{data.gaps.length}</div>
                <p className="text-xs text-gray-400 mt-1">Across {data.total_analyses} job analyses</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Missing Skill</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-lg font-bold text-gray-900 capitalize truncate">
                  {topGap || 'None'}
                </div>
                <p className="text-xs text-gray-400 mt-1">Highest frequency gap</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skill Growth</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-lg font-bold text-emerald-600">AI Roadmap Ready</div>
                <p className="text-xs text-gray-400 mt-1">Structured learning paths available</p>
              </div>
            </div>

            {data.gaps.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 sm:p-14 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  {data.total_analyses === 0 ? 'No skill analyses yet' : 'No recurring skill gaps found!'}
                </h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
                  {data.total_analyses === 0
                    ? 'Run a job analysis to start uncovering your skill match metrics.'
                    : 'Great job! Your resume aligns well across your target role requirements.'}
                </p>
                <button onClick={() => navigate('/analyze')} className="bg-emerald-600 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition shadow-sm">
                  Run a job analysis →
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Skill Gap Breakdown</h2>
                  <p className="text-xs text-gray-400">Click any skill to launch your tailored learning syllabus</p>
                </div>

                <div className="space-y-5">
                  {data.gaps.map((g) => {
                    const meta = getPriorityBadge(g.percent_of_analyses)
                    return (
                      <div key={g.skill} className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 hover:border-emerald-200 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-900 capitalize">{g.skill}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${meta.style}`}>
                              {meta.label}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            Missing in <strong className="text-gray-900">{g.count}</strong> of {data.total_analyses} roles ({g.percent_of_analyses}%)
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-700 ${meta.bar}`}
                              style={{ width: `${g.percent_of_analyses}%` }}
                            />
                          </div>
                          <button
                            onClick={() => navigate(`/syllabus/${g.skill}`)}
                            className="flex items-center justify-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap self-start sm:self-auto"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Start Syllabus →</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

