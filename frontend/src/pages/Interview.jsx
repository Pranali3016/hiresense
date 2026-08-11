import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

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
    if (d === 'basic') return 'bg-emerald-50 text-emerald-700'
    if (d === 'intermediate') return 'bg-amber-50 text-amber-700'
    return 'bg-red-50 text-red-700'
  }

  const questions = data ? (tab === 'theory' ? data.theory_questions : data.coding_questions) : []
  const completedCount = questions.filter(q => completedIds.includes(q.id)).length

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
        <h1 className="text-2xl font-bold text-gray-900 capitalize mb-1">{skill} — Interview Questions</h1>

        {loading && (
          <div className="text-center py-20">
            <div className="text-sm text-gray-400">
              Preparing interview questions... this can take up to two minutes for a new skill.
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl p-4 mt-4">{error}</div>
        )}

        {data && (
          <>
            <div className="flex items-center gap-2 mb-6 mt-4">
              <button
                onClick={() => setTab('theory')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'theory' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                Theory ({data.theory_count})
              </button>
              <button
                onClick={() => setTab('coding')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'coding' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                Coding ({data.coding_count})
              </button>
              <span className="text-xs text-gray-400 ml-auto">{completedCount} / {questions.length} done</span>
            </div>

            <div className="space-y-3">
              {questions.map((q) => {
                const isDone = completedIds.includes(q.id)
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleReveal(q.id)}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </span>
                          {q.frequently_asked && (
                            <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
                              ⭐ Frequently asked
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{q.question}</div>

                        {revealed[q.id] && (
                          <div className={`mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 leading-relaxed ${tab === 'coding' ? 'whitespace-pre-wrap font-mono text-xs bg-gray-50 rounded-lg p-3' : ''}`}>
                            {q.answer}
                          </div>
                        )}

                        {!revealed[q.id] && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleReveal(q.id) }}
                            className="text-xs text-emerald-600 font-medium mt-3 hover:underline"
                          >
                            Show answer →
                          </button>
                        )}
                      </div>

                      <div
                        onClick={(e) => toggleCompleted(q.id, e)}
                        className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center transition ${isDone ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}
                      >
                        {isDone && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
