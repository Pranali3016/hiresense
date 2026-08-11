import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MessageSquare, ArrowRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

export default function InterviewPrepHub() {
  const navigate = useNavigate()
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/dashboard/interview-sets`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 20000 }
        )
        setSets(res.data.sets)
      } catch (e) {
        setError('Could not load your interview prep progress.')
      } finally {
        setLoading(false)
      }
    }
    fetchSets()
  }, [])

  return (
    <DashboardLayout title="Interview Prep" subtitle="Question sets you've started, by skill">
      {loading && <div className="text-sm text-gray-400 py-10 text-center">Loading...</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">{error}</div>}

      {!loading && sets.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 sm:p-12 text-center shadow-sm max-w-lg">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-4">You haven't started interview prep for any skill yet.</p>
          <button onClick={() => navigate('/skill-gaps')} className="bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition">
            Pick a skill to prep →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {sets.map((s) => (
          <button
            key={s.skill}
            onClick={() => navigate(`/interview/${s.skill}`)}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-sm font-semibold text-gray-900 capitalize truncate">{s.skill}</span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${s.percent >= 100 ? 'bg-violet-500' : 'bg-violet-400'}`}
                  style={{ width: `${s.percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{s.completed}/{s.total}</span>
            </div>
            {s.percent >= 100 && (
              <div className="text-[11px] text-violet-600 font-medium mt-2">✓ Complete</div>
            )}
          </button>
        ))}
      </div>
    </DashboardLayout>
  )
}
