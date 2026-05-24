import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Results() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [syllabus, setSyllabus] = useState(null)
  const [loadingSyllabus, setLoadingSyllabus] = useState(false)
  const [checkedTopics, setCheckedTopics] = useState({})

  useEffect(() => {
    const saved = localStorage.getItem('hiresense_result')
    if (!saved) return navigate('/analyze')
    setData(JSON.parse(saved))
    const savedChecks = localStorage.getItem('hiresense_checks')
    if (savedChecks) setCheckedTopics(JSON.parse(savedChecks))
  }, [])

  const openSyllabus = async (skill) => {
    const skillLower = skill.toLowerCase().trim()
    setSelectedSkill(skill)
    setSyllabus(null)
    setLoadingSyllabus(true)
    try {
      const res = await axios.get(`http://localhost:8000/api/v1/syllabus/${skillLower}`)
      console.log('Syllabus response:', res.data)
      setSyllabus(res.data.syllabus)
    } catch (e) {
      console.log('Syllabus error:', e)
      setSyllabus(null)
    } finally {
      setLoadingSyllabus(false)
    }
  }

  const toggleTopic = (key) => {
    const updated = { ...checkedTopics, [key]: !checkedTopics[key] }
    setCheckedTopics(updated)
    localStorage.setItem('hiresense_checks', JSON.stringify(updated))
  }

  const getProgress = (sectionTitle) => {
    if (!syllabus) return 0
    const section = syllabus.sections?.find(s => s.title === sectionTitle)
    if (!section) return 0
    const total = section.topics.length
    const done = section.topics.filter((_, i) =>
      checkedTopics[`${selectedSkill}-${sectionTitle}-${i}`]
    ).length
    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  if (!data) return null
  const { resume, job, analysis, roadmap } = data

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-600'
    if (score >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getScoreBg = (score) => {
    if (score >= 70) return 'border-emerald-500'
    if (score >= 50) return 'border-amber-400'
    return 'border-red-400'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-gray-900 text-lg">HireSense</span>
        </div>
        <button onClick={() => navigate('/analyze')} className="text-sm text-emerald-600 font-medium hover:underline">
          Analyze another resume
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your analysis report</h1>
          <p className="text-sm text-gray-400 mt-1">{job.title?.slice(0, 60)} · just now</p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-8 shadow-sm">
          <div className={`w-24 h-24 rounded-full border-4 ${getScoreBg(analysis.overall_score)} flex flex-col items-center justify-center flex-shrink-0`}>
            <span className={`text-3xl font-bold ${getScoreColor(analysis.overall_score)}`}>{analysis.overall_score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-4">{analysis.verdict}</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28">Skills match</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-emerald-500 rounded-full" style={{width: `${analysis.skills_score}%`}}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 w-10">{analysis.skills_score}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28">Experience</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-violet-500 rounded-full" style={{width: `${analysis.experience_score}%`}}></div>
                </div>
                <span className="text-xs font-medium text-gray-700 w-10">{analysis.experience_score}%</span>
              </div>
            </div>
          </div>
        </div>

        {analysis.explanation && (
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 mb-6">
            <div className="text-xs font-medium text-violet-600 mb-2">AI ANALYSIS</div>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.explanation}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-medium text-emerald-600 mb-3">MATCHED ({analysis.matched_skills.length})</div>
            <div className="flex flex-wrap gap-2">
              {analysis.matched_skills.map(s => (
                <span key={s} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-medium text-red-500 mb-3">MISSING ({analysis.missing_skills.length})</div>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_skills.map(s => (
                <span key={s} className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {roadmap && roadmap.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <div className="text-xs font-medium text-gray-400 mb-1">YOUR LEARNING ROADMAP</div>
            <p className="text-xs text-gray-400 mb-4">Click any skill to see full syllabus with checklist and interview questions</p>
            <div className="space-y-3">
              {roadmap.map((item) => (
                <div
                  key={item.skill}
                  onClick={() => openSyllabus(item.skill)}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition"
                >
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{item.skill}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.why_important}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">{item.weeks_needed} weeks</span>
                    <span className="text-xs text-emerald-600 font-medium">View syllabus</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="text-xs font-medium text-gray-400 mb-3">CANDIDATE INFO</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">Email: </span><span className="text-gray-700">{resume.email || 'Not found'}</span></div>
            <div><span className="text-gray-400">Experience: </span><span className="text-gray-700">{resume.experience_years} years</span></div>
            <div><span className="text-gray-400">Skills found: </span><span className="text-gray-700">{resume.skills_found?.length}</span></div>
            <div><span className="text-gray-400">Required: </span><span className="text-gray-700">{job.required_skills?.length} skills</span></div>
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => navigate('/analyze')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition">
            Analyze another job
          </button>
        </div>
      </div>

      {selectedSkill && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <div className="font-semibold text-gray-900 text-lg capitalize">{selectedSkill} — Full Syllabus</div>
                {syllabus && (
                  <div className="text-xs text-gray-400">{syllabus.total_duration} · {syllabus.daily_time}</div>
                )}
              </div>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">x</button>
            </div>

            {loadingSyllabus && (
              <div className="flex items-center justify-center py-20">
                <div className="text-sm text-gray-400">Loading syllabus...</div>
              </div>
            )}

            {syllabus && (
              <div className="px-6 py-4">

                <div className="bg-emerald-50 rounded-xl px-4 py-3 mb-5">
                  <div className="text-xs font-medium text-emerald-600 mb-1">WHY LEARN THIS</div>
                  <p className="text-sm text-gray-700">{syllabus.why}</p>
                </div>

                <div className="mb-5">
                  <div className="text-xs font-medium text-gray-400 mb-3">FREE RESOURCES — FOLLOW THESE IN ORDER</div>
                  <div className="space-y-2">
                    {syllabus.free_resources?.map((r, i) => (
                      <div
                        key={i}
                        onClick={() => window.open(r.url, '_blank')}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition cursor-pointer group"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-800 group-hover:text-emerald-700">{r.title}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{r.duration} · {r.covers}</div>
                        </div>
                        <span className="text-xs text-emerald-600 flex-shrink-0 ml-3">Open</span>
                      </div>
                    ))}
                  </div>
                </div>

                {syllabus.top_interview_topics && (
                  <div className="mb-5 bg-amber-50 rounded-xl px-4 py-3">
                    <div className="text-xs font-medium text-amber-600 mb-2">TOP INTERVIEW TOPICS — FOCUS ON THESE FIRST</div>
                    <div className="flex flex-wrap gap-2">
                      {syllabus.top_interview_topics.map((t, i) => (
                        <span key={i} className="text-xs bg-white text-amber-700 border border-amber-200 px-2 py-1 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs font-medium text-gray-400 mb-3">
                  COMPLETE SYLLABUS — TICK TOPICS AS YOU FINISH
                </div>

                <div className="space-y-4">
                  {syllabus.sections?.map((section, si) => {
                    const progress = getProgress(section.title)
                    return (
                      <div key={si} className="border border-gray-100 rounded-xl overflow-hidden">

                        <div className="bg-gray-50 px-4 py-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900 text-sm">{section.title}</div>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{section.duration}</span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">{section.description}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                              <div
                                className="h-1.5 bg-emerald-500 rounded-full transition-all"
                                style={{width: `${progress}%`}}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">{progress}% done</span>
                          </div>
                        </div>

                        <div className="px-4 py-3">
                          <div className="text-xs font-medium text-gray-400 mb-2">TOPICS</div>
                          <div className="space-y-2">
                            {section.topics.map((topic, ti) => {
                              const key = `${selectedSkill}-${section.title}-${ti}`
                              const topicName = typeof topic === 'object' ? topic.name : topic
                              const stars = typeof topic === 'object' ? topic.stars : null
                              const interviewNote = typeof topic === 'object' ? topic.interview_note : null
                              return (
                                <div
                                  key={ti}
                                  onClick={() => toggleTopic(key)}
                                  className="flex items-start gap-3 cursor-pointer group py-1"
                                >
                                  <div className={`w-4 h-4 rounded border flex-shrink-0 mt-1 flex items-center justify-center transition ${checkedTopics[key] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400'}`}>
                                    {checkedTopics[key] && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm transition ${checkedTopics[key] ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                                        {topicName}
                                      </span>
                                      {stars && (
                                        <span className="text-xs text-amber-400">{'⭐'.repeat(stars)}</span>
                                      )}
                                    </div>
                                    {interviewNote && !checkedTopics[key] && (
                                      <div className="text-xs text-violet-500 mt-0.5">💼 {interviewNote}</div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {section.practice && section.practice.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="text-xs font-medium text-violet-600 mb-2">PRACTICE TASKS</div>
                              {section.practice.map((p, pi) => (
                                <div key={pi} className="flex items-start gap-2 mb-1.5">
                                  <span className="text-violet-400 flex-shrink-0 mt-0.5 text-xs">-</span>
                                  <span className="text-xs text-gray-600 font-mono">{p}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {section.interview_questions && section.interview_questions.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <div className="text-xs font-medium text-amber-600 mb-2">INTERVIEW QUESTIONS FOR THIS SECTION</div>
                              {section.interview_questions.map((q, qi) => (
                                <div key={qi} className="flex items-start gap-2 mb-1.5">
                                  <span className="text-amber-500 flex-shrink-0 text-xs font-bold">Q.</span>
                                  <span className="text-xs text-gray-600">{q}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {syllabus.projects && (
                  <div className="mt-5">
                    <div className="text-xs font-medium text-gray-400 mb-3">PROJECTS TO BUILD</div>
                    <div className="space-y-2">
                      {syllabus.projects.map((p, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.level === 'Beginner' ? 'bg-emerald-50 text-emerald-700' : p.level === 'Intermediate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                              {p.level}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{p.name}</span>
                          </div>
                          <p className="text-xs text-gray-500">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {syllabus.final_learning_order && (
                  <div className="mt-5 bg-violet-50 rounded-xl px-4 py-3">
                    <div className="text-xs font-medium text-violet-600 mb-2">FINAL LEARNING ORDER — FOLLOW THIS SEQUENCE</div>
                    <div className="space-y-1">
                      {syllabus.final_learning_order.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs text-violet-400 font-bold w-5">{i+1}.</span>
                          <span className="text-xs text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <button
                    onClick={() => setSelectedSkill(null)}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
                  >
                    Got it — start learning
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}