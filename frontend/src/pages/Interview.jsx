import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { MessageSquare, Sparkles, CheckCircle2, ArrowLeft, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'

export default function Interview() {
  const { skill } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState({})
  const [completedIds, setCompletedIds] = useState([])
  const [tab, setTab] = useState('theory')

  const authHeaders = {
    'Authorization': `Bearer ${localStorage.getItem('hiresense_token')}`
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError('')
      try {
        const [questionsRes, progressRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/interview/${skill}`, { timeout: 120000 }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/v1/progress/questions/${skill}`, { headers: authHeaders })
        ])
        setData(questionsRes.data)
        setCompletedIds(progressRes.data.completed_question_ids || [])
      } catch (e) {
        setError('Could not load interview questions. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [skill])

  const toggleReveal = (id) => {
    setRevealed({ ...revealed, [id]: !revealed[id] })
  }

  const toggleCompleted = async (id, e) => {
    e.stopPropagation()
    const isCurrentlyDone = completedIds.includes(id)
    const updated = isCurrentlyDone
      ? completedIds.filter(cid => cid !== id)
      : [...completedIds, id]
    setCompletedIds(updated)

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/progress/question`,
        { question_id: id, completed: !isCurrentlyDone },
        { headers: authHeaders }
      )
    } catch (err) {
      setCompletedIds(completedIds)
    }
  }

  const difficultyColor = (d) => {
    if (d === 'basic') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (d === 'intermediate') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  const questions = data ? (tab === 'theory' ? data.theory_questions : data.coding_questions) : []
  const completedCount = (questions || []).filter(q => completedIds.includes(q.id)).length

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
            <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200 mb-2 capitalize">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>{skill} Practice Kit</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 capitalize tracking-tight">
              {skill} — Interview Questions
            </h1>
          </div>
          <button
            onClick={() => navigate(`/syllabus/${skill}`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Syllabus</span>
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-xs text-purple-600 font-semibold animate-pulse">
            Generating expert interview questions... this can take up to a minute for new skills.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTab('theory')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${tab === 'theory' ? 'bg-purple-600 text-white shadow-xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  Theory ({data.theory_count || 0})
                </button>
                <button
                  onClick={() => setTab('coding')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${tab === 'coding' ? 'bg-purple-600 text-white shadow-xs' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                >
                  Coding ({data.coding_count || 0})
                </button>
              </div>
              <span className="text-xs font-bold text-gray-500 text-right">
                {completedCount} / {(questions || []).length} completed
              </span>
            </div>

            <div className="space-y-3">
              {(questions || []).map((q) => {
                const isDone = completedIds.includes(q.id)
                const isExpanded = revealed[q.id]
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleReveal(q.id)}
                    className="bg-white border border-gray-100 hover:border-purple-200 rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold capitalize border ${difficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          {q.frequently_asked && (
                            <span className="text-[10px] sm:text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                              ⭐ Frequently Asked
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm font-bold text-gray-900 leading-snug break-words">
                          {q.question}
                        </div>

                        {isExpanded && (
                          <div className={`mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed ${tab === 'coding' ? 'whitespace-pre-wrap font-mono text-xs bg-gray-900 text-emerald-300 rounded-xl p-3.5 overflow-x-auto max-w-full' : ''}`}>
                            {q.answer}
                          </div>
                        )}

                        {!isExpanded && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleReveal(q.id) }}
                            className="text-xs text-purple-600 font-bold hover:underline inline-flex items-center gap-1 pt-1"
                          >
                            <span>Show answer</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div
                        onClick={(e) => toggleCompleted(q.id, e)}
                        title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                        className={`w-6 h-6 rounded-lg border shrink-0 flex items-center justify-center transition mt-0.5 ${isDone ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' : 'border-gray-300 hover:border-emerald-500 bg-white'}`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
