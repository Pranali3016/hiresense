import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Syllabus() {
  const { skill } = useParams()
  const navigate = useNavigate()
  const [syllabus, setSyllabus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completedIds, setCompletedIds] = useState([])

  const authHeaders = {
    'Authorization': `Bearer ${localStorage.getItem('hiresense_token')}`
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      setSyllabus(null)
      try {
        const [syllabusRes, progressRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/syllabus/${skill}`, { timeout: 90000 }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/progress/skill/${skill}`, { headers: authHeaders })
        ])
        setSyllabus(syllabusRes.data.syllabus)
        setCompletedIds(progressRes.data.completed_subtopic_ids || [])
      } catch (e) {
        setError('Could not load syllabus. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [skill])

  const toggleSubtopic = async (subtopicId) => {
    const isCurrentlyDone = completedIds.includes(subtopicId)
    const updated = isCurrentlyDone
      ? completedIds.filter(id => id !== subtopicId)
      : [...completedIds, subtopicId]
    setCompletedIds(updated)

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/progress/subtopic`,
        {
          skill_name: skill,
          subtopic_id: subtopicId,
          completed: !isCurrentlyDone,
          job_role: null
        },
        { headers: authHeaders }
      )
    } catch (e) {
      setCompletedIds(completedIds)
    }
  }

  const getWeekProgress = (week) => {
    const allIds = []
    week.modules.forEach((mod) => {
      mod.subtopics.forEach((sub) => allIds.push(sub.id))
    })
    if (allIds.length === 0) return 0
    const done = allIds.filter(id => completedIds.includes(id)).length
    return Math.round((done / allIds.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-gray-900 text-lg">HireSense</span>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm text-emerald-600 font-medium hover:underline">
          ← Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <h1 className="text-2xl font-bold text-gray-900 capitalize mb-1">{skill} — Full Syllabus</h1>

        {loading && (
          <div className="text-center py-20">
            <div className="text-sm text-gray-400">
              Building your syllabus... this can take up to a minute for a new skill.
            </div>
          </div>
        )}

        {error && !syllabus && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mt-4">{error}</div>
        )}

        {syllabus && (
          <>
            <p className="text-sm text-gray-500 mt-2 mb-6">{syllabus.why_it_matters}</p>

            {syllabus.prerequisite_summary && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                <div className="text-xs font-medium text-amber-600 mb-1">PREREQUISITE</div>
                <p className="text-sm text-gray-700">{syllabus.prerequisite_summary}</p>
              </div>
            )}

            <div className="space-y-4">
              {syllabus.weeks.map((week) => {
                const progress = getWeekProgress(week)
                return (
                  <div key={week.week_number} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">
                          Week {week.week_number} <span className="text-xs text-gray-400 font-normal">({week.daily_hours} hr/day)</span>
                        </div>
                        <span className="text-xs text-gray-400">{progress}% done</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div className="h-1.5 bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="px-5 py-4 space-y-5">
                      {week.modules.map((mod, mi) => (
                        <div key={mi}>
                          <div className="font-medium text-gray-900 text-sm mb-2">{mod.title}</div>
                          <div className="space-y-2 ml-1">
                            {mod.subtopics.map((sub) => {
                              const isDone = completedIds.includes(sub.id)
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => toggleSubtopic(sub.id)}
                                  className="flex items-center gap-3 cursor-pointer group"
                                >
                                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {isDone && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-sm ${isDone ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                                    {sub.text}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          {mod.video_link && (
                            <a
                            
                              href={mod.video_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-red-500 mt-2 ml-1 hover:underline"
                            >
                              🎥 Recommended video
                            </a>
                          )}
                        </div>
                      ))}

                      {week.projects && week.projects.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="text-xs font-medium text-violet-600 mb-2">END OF WEEK PROJECTS</div>
                          <div className="space-y-2">
                            {week.projects.map((p, pi) => (
                              <div key={pi} className="bg-violet-50 rounded-xl p-3">
                                <div className="text-sm font-medium text-gray-900">{p.title}</div>
                                <div className="text-xs text-gray-600 mt-0.5">{p.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {syllabus.capstone_projects && syllabus.capstone_projects.length > 0 && (
              <div className="mt-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-medium text-violet-600 mb-1">CAPSTONE PROJECTS</div>
                <p className="text-xs text-gray-400 mb-4">Major portfolio-worthy projects combining everything from this syllabus</p>
                <div className="space-y-3">
                  {syllabus.capstone_projects.map((cp, i) => (
                    <div key={i} className="bg-violet-50 rounded-xl p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{cp.title}</div>
                      <div className="text-sm text-gray-600">{cp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={() => navigate(`/interview/${skill}`)}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
              >
                Continue to Interview Questions →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
