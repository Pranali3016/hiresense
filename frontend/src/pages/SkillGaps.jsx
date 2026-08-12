import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  TrendingDown, ArrowRight, BookOpen, Sparkles, AlertCircle, RotateCcw
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { extractErrorMessage } from '../utils/apiError'

export default function SkillGaps() {
  const navigate = useNavigate()
  const [gaps, setGaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const isMountedRef = useRef(true)

  const fetchGaps = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/dashboard/skill-gaps`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 20000 }
      )
      if (isMountedRef.current) {
        setGaps(res.data.gaps || [])
      }
    } catch (e) {
      if (isMountedRef.current) {
        setError(extractErrorMessage(e, 'Could not load your prioritized skill gaps.'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchGaps()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const filteredGaps = gaps.filter(g => (g.skill || '').toLowerCase().includes(filterQuery.toLowerCase()))

  return (
    <DashboardLayout
      title="Skill Gap Matrix"
      subtitle="Prioritized list of missing skills detected across your resume evaluations"
      action={
        <button
          onClick={() => navigate('/analyze')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ Analyze Job</span>
        </button>
      }
    >
      <div className="max-w-4xl space-y-5 sm:space-y-6">

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchGaps}
              disabled={loading}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 self-end sm:self-auto text-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {loading && !gaps.length && (
          <div className="text-xs sm:text-sm text-gray-400 py-16 text-center animate-pulse">
            Analyzing your aggregated skill gap data...
          </div>
        )}

        {!loading && gaps.length === 0 && !error && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-14 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No skill gaps identified yet</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-6">
              Upload your resume against target job postings to automatically detect and prioritize missing technical skills.
            </p>
            <button onClick={() => navigate('/analyze')} className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-2xl hover:bg-emerald-700 transition shadow-sm">
              Analyze a Job Description →
            </button>
          </div>
        )}

        {gaps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                placeholder="Filter skill gaps..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs sm:text-sm w-full sm:w-64 focus:outline-none focus:border-emerald-400 shadow-xs"
              />
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                {filteredGaps.length} of {gaps.length} skill{gaps.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {filteredGaps.map((g, idx) => (
                <div
                  key={g.skill || idx}
                  className="bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 capitalize">{g.skill}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Missing in {g.frequency} target job application{g.frequency === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                      Priority Gap
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/syllabus/${g.skill}`)}
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Learn Skill</span>
                    </button>
                    <button
                      onClick={() => navigate(`/interview/${g.skill}`)}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <span>Prep Questions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
