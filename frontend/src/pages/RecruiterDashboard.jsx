import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Briefcase, Users, Award, TrendingUp, Sparkles, PlusCircle,
  Search, ArrowRight, Trash2, Calendar, FileText, ChevronRight,
  AlertCircle, RotateCcw, LogOut, CheckCircle2, ShieldCheck,
  Star, Clock, ThumbsDown, Zap, BarChart2, Layers, CheckCircle,
  Wand2, ArrowUpRight
} from 'lucide-react'
import { extractErrorMessage } from '../utils/apiError'

const STAGE_CONFIG = {
  under_review: { label: 'Under Review', color: 'bg-gray-100 text-gray-700', bar: 'bg-gray-400' },
  shortlisted: { label: 'Shortlisted', color: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
  interview_scheduled: { label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-800', bar: 'bg-indigo-500' },
  rejected: { label: 'Rejected', color: 'bg-rose-100 text-rose-800', bar: 'bg-rose-400' }
}

export default function RecruiterDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const isMountedRef = useRef(true)

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem('hiresense_token')}`
  }

  const fetchDashboardStats = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/dashboard-stats`,
        { headers: authHeaders, timeout: 25000 }
      )
      if (isMountedRef.current) {
        setStats(res.data)
      }
    } catch (e) {
      if (isMountedRef.current) {
        setError(extractErrorMessage(e, 'Could not load recruiter dashboard. Please try again.'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchDashboardStats()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleDeleteCampaign = async (e, jobId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this job campaign and all its scored candidates?')) {
      return
    }
    setDeletingId(jobId)
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/recruiter/job/${jobId}`,
        { headers: authHeaders, timeout: 20000 }
      )
      if (isMountedRef.current) {
        fetchDashboardStats()
      }
    } catch (err) {
      alert(extractErrorMessage(err, 'Failed to delete campaign.'))
    } finally {
      if (isMountedRef.current) {
        setDeletingId(null)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_email')
    localStorage.removeItem('hiresense_name')
    navigate('/recruiter/login')
  }

  const filteredCampaigns = (stats?.campaigns || []).filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      (c.title || '').toLowerCase().includes(q) ||
      (c.job_description_snippet || '').toLowerCase().includes(q)
    )
  })

  const totalCandidates = stats?.total_candidates || 0
  const funnel = stats?.funnel || { under_review: 0, shortlisted: 0, interview_scheduled: 0, rejected: 0 }
  const scoreTiers = stats?.score_tiers || { elite: 0, strong: 0, moderate: 0, needs_rampup: 0 }
  const spotlightCandidates = stats?.spotlight_candidates || []

  const recruiterName = stats?.recruiter_name || localStorage.getItem('hiresense_name') || 'Hiring Lead'

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">HireSense</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
              Recruiter Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recruiter/analyze')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Screening Batch</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 font-semibold p-2 rounded-xl hover:bg-red-50 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-950/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise Talent Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Welcome back, {recruiterName.split(' ')[0]} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
              Monitor your active recruitment campaigns, evaluate candidates by verified skills, and fast-track top applicants.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/recruiter/analyze')}
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl transition shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Screening Batch</span>
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-gray-600">Aggregating Talent Pool Intelligence...</div>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md mx-auto text-center space-y-3 shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Dashboard Unavailable</h3>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={fetchDashboardStats}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <>
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2 hover:border-emerald-200 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Active Campaigns</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">{stats?.total_campaigns || 0}</div>
                <div className="text-[11px] text-gray-400 font-medium">Job openings evaluated</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2 hover:border-emerald-200 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Resumes Screened</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900">{totalCandidates}</div>
                <div className="text-[11px] text-gray-400 font-medium">Processed through AI parser</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2 hover:border-emerald-200 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Avg Match Score</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-700">{stats?.avg_match_score || 0}%</div>
                <div className="text-[11px] text-gray-400 font-medium">Mean qualification benchmark</div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2 hover:border-emerald-200 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Top Match Score</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700">{stats?.top_benchmark_score || 0}%</div>
                <div className="text-[11px] text-gray-400 font-medium">Highest scoring candidate</div>
              </div>
            </div>

            {/* Visual Analytics Row: Pipeline Funnel & Talent Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Card 1: Pipeline Funnel Breakdown */}
              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-gray-900 text-sm">Hiring Pipeline Funnel</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">{totalCandidates} Total</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
                    const count = funnel[key] || 0
                    const pct = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-gray-700 font-semibold">
                          <span>{cfg.label}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cfg.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Card 2: Candidate Score Distribution Tiers */}
              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-extrabold text-gray-900 text-sm">Talent Quality Tiers</h3>
                  </div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-full">
                    Score Distribution
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
                    <div className="text-lg font-black text-emerald-700">{scoreTiers.elite}</div>
                    <div className="text-[11px] font-bold text-emerald-900">Elite Match (80%+)</div>
                  </div>
                  <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3 text-center">
                    <div className="text-lg font-black text-teal-700">{scoreTiers.strong}</div>
                    <div className="text-[11px] font-bold text-teal-900">Strong (65-79%)</div>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-3 text-center">
                    <div className="text-lg font-black text-amber-700">{scoreTiers.moderate}</div>
                    <div className="text-[11px] font-bold text-amber-900">Moderate (50-64%)</div>
                  </div>
                  <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3 text-center">
                    <div className="text-lg font-black text-rose-700">{scoreTiers.needs_rampup}</div>
                    <div className="text-[11px] font-bold text-rose-900">Ramp-Up (&lt;50%)</div>
                  </div>
                </div>
              </div>

              {/* Card 3: In-Demand Candidate Pool Skills */}
              <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h3 className="font-extrabold text-gray-900 text-sm">Top Pool Skills</h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Frequency</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(stats?.top_pool_skills || []).length === 0 ? (
                    <div className="text-xs text-gray-400 italic">No skills indexed yet.</div>
                  ) : (
                    stats.top_pool_skills.map((item) => (
                      <span
                        key={item.skill}
                        className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-100 transition cursor-default"
                      >
                        <span>{item.skill}</span>
                        <span className="w-4 h-4 rounded-full bg-gray-200/80 text-[10px] text-gray-700 flex items-center justify-center font-black">
                          {item.count}
                        </span>
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Spotlight Top Candidates Card Section */}
            {spotlightCandidates.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <h2 className="font-extrabold text-gray-900 text-base">⭐ Spotlight Top Candidates</h2>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">Highest scorers across your active campaigns</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {spotlightCandidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/recruiter/results/${c.job_id}`)}
                      className="bg-white border border-gray-100 hover:border-emerald-300 rounded-3xl p-4 shadow-xs hover:shadow-md transition cursor-pointer space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase truncate max-w-[130px]">
                          {c.job_title}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 font-black text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {c.overall_score}% Match
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-gray-900 text-sm group-hover:text-emerald-700 transition">
                          {c.candidate_name}
                        </h4>
                        <p className="text-[11px] text-gray-400">{c.seniority_level}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {c.matched_skills?.slice(0, 3).map((s) => (
                          <span key={s} className="bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-100">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-emerald-700 font-bold group-hover:underline">
                        <span>View Profile & Scorecard</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign History Records Table */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Active Screening Campaigns</h2>
                  <p className="text-xs text-gray-400">View past batches, candidate scores, and access leaderboards</p>
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search campaigns by role..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {filteredCampaigns.length === 0 ? (
                <div className="py-14 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="font-extrabold text-gray-900 text-base">No Screening Campaigns Found</div>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Launch your first candidate screening batch by uploading resumes and entering a Job Description.
                  </p>
                  <button
                    onClick={() => navigate('/recruiter/analyze')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition inline-flex items-center gap-2 shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Launch Screening Batch</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 pl-2">Job Campaign Title</th>
                        <th className="pb-3">Candidates</th>
                        <th className="pb-3">Top Match</th>
                        <th className="pb-3">Batch Avg</th>
                        <th className="pb-3">Created</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredCampaigns.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => navigate(`/recruiter/results/${c.id}`)}
                          className="hover:bg-gray-50/80 transition cursor-pointer group"
                        >
                          <td className="py-3.5 pl-2">
                            <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition">
                              {c.title}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate max-w-xs">
                              {c.job_description_snippet}
                            </div>
                          </td>

                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-md">
                              <Users className="w-3 h-3" />
                              <span>{c.candidate_count}</span>
                            </span>
                          </td>

                          <td className="py-3.5">
                            <span className="bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-md border border-emerald-200">
                              {c.top_score}%
                            </span>
                          </td>

                          <td className="py-3.5">
                            <span className="font-bold text-gray-600">{c.avg_score}%</span>
                          </td>

                          <td className="py-3.5 text-gray-400">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent'}
                          </td>

                          <td className="py-3.5 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => navigate(`/recruiter/results/${c.id}`)}
                                className="text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
                              >
                                View Results →
                              </button>
                              <button
                                onClick={(e) => handleDeleteCampaign(e, c.id)}
                                disabled={deletingId === c.id}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition"
                                title="Delete campaign"
                              >
                                <Trash2 className={`w-4 h-4 ${deletingId === c.id ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
