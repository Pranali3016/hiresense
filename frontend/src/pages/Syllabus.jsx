import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BookOpen, CheckCircle2, ArrowLeft, ArrowRight, Sparkles, Video, Layers } from 'lucide-react'

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
    week.modules?.forEach((mod) => {
      mod.subtopics?.forEach((sub) => allIds.push(sub.id))
    })
    if (allIds.length === 0) return 0
    const done = allIds.filter(id => completedIds.includes(id)).length
    return Math.round((done / allIds.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <nav className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">HireSense</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs sm:text-sm text-emerald-600 font-bold hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 mb-2 capitalize">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>{skill} Roadmap</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 capitalize tracking-tight">
              {skill} — Full Learning Syllabus
            </h1>
          </div>
          <button
            onClick={() => navigate(`/interview/${skill}`)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>Practice Interview Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-xs text-emerald-600 font-semibold animate-pulse">
            Generating structured syllabus... this can take up to a minute for new skills.
          </div>
        )}

        {error && !syllabus && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        {syllabus && (
          <>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
              {syllabus.why_it_matters}
            </p>

            {syllabus.prerequisite_summary && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">PREREQUISITE</div>
                <p className="text-xs sm:text-sm">{syllabus.prerequisite_summary}</p>
              </div>
            )}

            <div className="space-y-4">
              {syllabus.weeks?.map((week) => {
                const progress = getWeekProgress(week)
                return (
                  <div key={week.week_number} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50/80 px-4 sm:px-5 py-3.5 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-gray-900 text-sm">
                          Week {week.week_number} <span className="text-xs text-gray-400 font-normal">({week.daily_hours} hr/day)</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">{progress}% done</span>
                      </div>
                      <div className="h-2 bg-gray-200/80 rounded-full overflow-hidden">
                        <div className="h-2 bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-4 space-y-5">
                      {week.modules?.map((mod, mi) => (
                        <div key={mi} className="space-y-2">
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">{mod.title}</div>
                          <div className="space-y-2">
                            {mod.subtopics?.map((sub) => {
                              const isDone = completedIds.includes(sub.id)
                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => toggleSubtopic(sub.id)}
                                  className="flex items-start gap-3 cursor-pointer group p-1.5 -m-1.5 rounded-xl hover:bg-gray-50 transition"
                                >
                                  <div className={`w-5 h-5 rounded-lg border shrink-0 flex items-center justify-center transition mt-0.5 ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 group-hover:border-emerald-400 bg-white'}`}>
                                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  </div>
                                  <span className={`text-xs sm:text-sm break-words flex-1 min-w-0 ${isDone ? 'line-through text-gray-300' : 'text-gray-700'}`}>
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
                              className="inline-flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:underline mt-1 break-all"
                            >
                              <Video className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              <span>Recommended Video Tutorial</span>
                            </a>
                          )}
                        </div>
                      ))}

                      {week.projects && week.projects.length > 0 && (
                        <div className="pt-3 border-t border-gray-100 space-y-2">
                          <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">END OF WEEK PROJECTS</div>
                          <div className="space-y-2">
                            {week.projects.map((p, pi) => (
                              <div key={pi} className="bg-violet-50/70 border border-violet-100 rounded-xl p-3">
                                <div className="text-xs sm:text-sm font-bold text-gray-900">{p.title}</div>
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
              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
                <div className="text-xs font-bold text-violet-600 uppercase tracking-wider">CAPSTONE PORTFOLIO PROJECTS</div>
                <p className="text-xs text-gray-400">Major portfolio-worthy projects combining everything from this syllabus</p>
                <div className="space-y-3">
                  {syllabus.capstone_projects.map((cp, i) => (
                    <div key={i} className="bg-violet-50/70 border border-violet-100 rounded-2xl p-4">
                      <div className="text-sm font-bold text-gray-900 mb-1">{cp.title}</div>
                      <div className="text-xs text-gray-600 leading-relaxed">{cp.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate(`/interview/${skill}`)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>Continue to {skill} Interview Questions →</span>
            </button>
          </>
        )}
      </main>
    </div>
  )
}
