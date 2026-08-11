import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  TrendingUp, Award, MessageSquare, FileText, Sparkles, ArrowRight,
  BookOpen, Target, Zap, ShieldCheck, CheckCircle2, Clock, Play
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const email = localStorage.getItem('hiresense_email') || ''
  const storedName = localStorage.getItem('hiresense_name') || ''
  const displayName = storedName || (email ? email.split('@')[0] : 'there')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/dashboard/stats`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` },
            timeout: 30000
          }
        )
        setStats(res.data)
      } catch (e) {
        setError('Could not load dashboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const defaultStats = {
    total_analyses: 0,
    average_match_score: 0,
    skills_improved: 0,
    interview_sets_touched: 0,
    recent_analyses: [],
    continue_learning: [],
    top_skills: []
  }

  const activeStats = stats || defaultStats

  const scoreBadge = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200'
    if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200'
    return 'text-red-700 bg-red-50 border-red-200'
  }

  const timeAgo = (iso) => {
    if (!iso) return ''
    const diffMs = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const radarData = (activeStats.top_skills || []).map(s => ({ skill: s.skill, value: s.count }))

  return (
    <DashboardLayout
      title={`Welcome back, ${displayName} 👋`}
      subtitle="Your AI-powered career growth & job match command center"
      action={
        <button
          onClick={() => navigate('/analyze')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4" />
          <span>+ New Analysis</span>
        </button>
      }
    >
      {loading && (
        <div className="text-center py-4 text-xs text-emerald-600 font-semibold animate-pulse">Syncing dashboard metrics...</div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <span>{error} Rendering cached metrics.</span>
          <button onClick={() => window.location.reload()} className="underline font-bold text-amber-900">Retry</button>
        </div>
      )}

      <div className="space-y-6 max-w-6xl">

          {/* Hero Welcome & Quick Launchpad Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-emerald-950 to-emerald-900 text-white p-6 sm:p-8 shadow-xl">
            {/* Background Decorative Glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AI Resume & Career Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Accelerate Your Next Career Move
                </h1>
                <p className="text-sm text-emerald-100/80 leading-relaxed">
                  Analyze your resume against top job descriptions, uncover high-priority skill gaps, and practice interactive mock interviews.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={() => navigate('/analyze')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-4 h-4 text-gray-950 fill-gray-950" />
                  <span>Analyze Resume Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Quick Action Pills */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/analyze')}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 text-xs text-emerald-100 font-medium px-3.5 py-2.5 rounded-xl border border-white/10 transition text-left"
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Upload Resume</span>
              </button>

              <button
                onClick={() => navigate('/skill-gaps')}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 text-xs text-emerald-100 font-medium px-3.5 py-2.5 rounded-xl border border-white/10 transition text-left"
              >
                <Target className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">Check Skill Gaps</span>
              </button>

              <button
                onClick={() => navigate('/learning-roadmap')}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 text-xs text-emerald-100 font-medium px-3.5 py-2.5 rounded-xl border border-white/10 transition text-left"
              >
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="truncate">Learning Roadmap</span>
              </button>

              <button
                onClick={() => navigate('/interview-prep')}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 text-xs text-emerald-100 font-medium px-3.5 py-2.5 rounded-xl border border-white/10 transition text-left"
              >
                <MessageSquare className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="truncate">Mock Interview</span>
              </button>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              iconBg="bg-emerald-50 text-emerald-600"
              label="Total Analyses"
              value={activeStats.total_analyses}
              badge="Evaluated"
            />
            <StatCard
              icon={TrendingUp}
              iconBg="bg-blue-50 text-blue-600"
              label="Avg Match Score"
              value={`${activeStats.average_match_score}%`}
              badge="Match Rate"
            />
            <StatCard
              icon={Award}
              iconBg="bg-amber-50 text-amber-600"
              label="Skills Improved"
              value={activeStats.skills_improved}
              badge="Mastered"
            />
            <StatCard
              icon={MessageSquare}
              iconBg="bg-purple-50 text-purple-600"
              label="Interview Sets"
              value={activeStats.interview_sets_touched}
              badge="Practiced"
            />
          </div>

          {/* Main Grid: Recent Analyses & Skill Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Analyses Column */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Recent Job Match Analyses</h2>
                    <p className="text-xs text-gray-400">Your latest resume evaluations against job postings</p>
                  </div>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeStats.recent_analyses.length === 0 && (
                    <div className="text-center py-12 text-sm text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No analyses run yet. Upload your resume to get started.</p>
                    </div>
                  )}
                  {activeStats.recent_analyses.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => navigate('/history')}
                      className="group flex items-center justify-between p-3.5 bg-gray-50/60 hover:bg-emerald-50/40 border border-gray-100 hover:border-emerald-200 rounded-2xl cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-600 font-bold text-xs shadow-sm group-hover:border-emerald-300 transition">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition">
                            {a.job_title || 'Untitled Role'}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{timeAgo(a.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scoreBadge(a.overall_score)}`}>
                          {a.overall_score}% Match
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeStats.recent_analyses.length > 0 && (
                <button
                  onClick={() => navigate('/analyze')}
                  className="w-full py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-2xl text-xs font-semibold border border-gray-100 hover:border-emerald-200 transition text-center"
                >
                  + Analyze against another job description
                </button>
              )}
            </div>

            {/* Top Skills Competency Chart */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base font-bold text-gray-900">Skill Competency</h2>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Top Skills
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">Top matched skills extracted from your resume history</p>

                {radarData.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <Target className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
                    <p>Run an analysis to build your skill competency radar.</p>
                  </div>
                ) : (
                  <div className="space-y-3 py-1">
                    {radarData.map((item, idx) => {
                      const maxVal = Math.max(...radarData.map(d => d.value), 1)
                      const pct = Math.min(Math.round((item.value / maxVal) * 100), 100)
                      return (
                        <div key={item.skill || idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-gray-800 capitalize truncate">{item.skill}</span>
                            <span className="text-emerald-600 font-bold text-[11px]">{item.value} {item.value === 1 ? 'match' : 'matches'}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/skill-gaps')}
                className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-2xl text-xs font-semibold border border-gray-100 hover:border-emerald-200 transition text-center"
              >
                View Skill Gap Matrix →
              </button>
            </div>
          </div>

          {/* Continue Learning Cards Grid */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Active Skill Roadmaps</h2>
                <p className="text-xs text-gray-400">Pick up right where you left off in your skill syllabi</p>
              </div>
              <button
                onClick={() => navigate('/learning-roadmap')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
              >
                Browse all roadmaps
              </button>
            </div>

            {activeStats.continue_learning.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 bg-gray-50/50 rounded-2xl">
                No active learning paths yet. Identify skill gaps to unlock structured syllabi.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeStats.continue_learning.map((s) => (
                  <div
                    key={s.skill}
                    onClick={() => navigate(`/syllabus/${s.skill}`)}
                    className="group bg-gray-50/80 hover:bg-emerald-50/30 border border-gray-100 hover:border-emerald-200 rounded-2xl p-4 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-900 capitalize group-hover:text-emerald-700 transition">
                        {s.skill}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {s.percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-1">
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> In Progress
                      </span>
                      <span className="group-hover:text-emerald-700 flex items-center gap-1 font-semibold transition">
                        Continue <Play className="w-3 h-3 fill-current" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
    </DashboardLayout>
  )
}

function StatCard({ icon: Icon, iconBg, label, value, badge }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
          {badge}
        </span>
      </div>
      <div className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</div>
      <div className="text-xs text-gray-400 font-medium mt-0.5">{label}</div>
    </div>
  )
}

