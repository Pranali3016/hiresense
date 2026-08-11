import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Map, ArrowRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

export default function LearningRoadmapHub() {
  const navigate = useNavigate()
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/dashboard/roadmaps`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }, timeout: 20000 }
        )
        setRoadmaps(res.data.roadmaps)
      } catch (e) {
        setError('Could not load your roadmaps.')
      } finally {
        setLoading(false)
      }
    }
    fetchRoadmaps()
  }, [])

  return (
    <DashboardLayout title="Learning Roadmap" subtitle="Every skill you've started, in one place">
      {loading && <div className="text-sm text-gray-400 py-10 text-center">Loading...</div>}
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4">{error}</div>}

      {!loading && roadmaps.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 sm:p-12 text-center shadow-sm max-w-lg">
          <Map className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 mb-4">You haven't started any skill roadmaps yet.</p>
          <button onClick={() => navigate('/skill-gaps')} className="bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition">
            See your skill gaps →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {roadmaps.map((r) => (
          <button
            key={r.skill}
            onClick={() => navigate(`/syllabus/${r.skill}`)}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-sm font-semibold text-gray-900 capitalize truncate">{r.skill}</span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${r.percent >= 100 ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                  style={{ width: `${r.percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{r.completed}/{r.total}</span>
            </div>
            {r.percent >= 100 && (
              <div className="text-[11px] text-emerald-600 font-medium mt-2">✓ Complete</div>
            )}
          </button>
        ))}
      </div>
    </DashboardLayout>
  )
}
