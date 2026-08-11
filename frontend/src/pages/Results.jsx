import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award, Sparkles, CheckCircle2, AlertCircle, BookOpen, MessageSquare,
  ArrowRight, RefreshCw, FileText, Briefcase, Calendar, ChevronRight, Layers, Zap
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

export default function Results() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [selectedSkill, setSelectedSkill] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('hiresense_result')
    if (!saved) return navigate('/analyze')
    try {
      setData(JSON.parse(saved))
    } catch (e) {
      navigate('/analyze')
    }
  }, [navigate])

  if (!data) return null
  const { resume = {}, job = {}, analysis = {}, roadmap = [] } = data

  const overallScore = analysis.overall_score || 0
  const skillsScore = analysis.skills_score || 0
  const expScore = analysis.experience_score || 0
  const semanticScore = analysis.semantic_score || 0

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getScoreBadge = (score) => {
    if (score >= 75) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    if (score >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  }

  const getVerdictLabel = (score) => {
    if (score >= 75) return '🏆 High Match — Strong Callback Probability'
    if (score >= 50) return '⚡ Moderate Match — Skill Gap Fix Recommended'
    return '🎯 Low Match — Critical Skill Gaps Identified'
  }

  return (
    <DashboardLayout
      title="AI Job Match Report"
      subtitle="Detailed resume-vs-job match score, skill breakdown, and tailored action plan"
      action={
        <button
          onClick={() => navigate('/analyze')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Analyze Another Job</span>
        </button>
      }
    >
      <div className="max-w-5xl space-y-6">

        {/* Executive Match Hero Card */}
        <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified AI Match Evaluation</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {job.title || 'Target Job Position'}
              </h1>

              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold border border-white/10 bg-white/10 text-emerald-200">
                {getVerdictLabel(overallScore)}
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
                Analysis complete. Evaluated against {job.required_skills?.length || 0} core job requirements.
              </p>
            </div>

            {/* Overall Score Circle Gauge */}
            <div className="bg-slate-950/60 border border-emerald-500/30 backdrop-blur-xl rounded-3xl p-6 flex flex-col items-center justify-center shrink-0 w-36 h-36 mx-auto md:mx-0 shadow-2xl">
              <div className={`text-4xl font-black ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Match Score</span>
            </div>
          </div>
        </div>

        {/* 3-Metric Breakdown Bar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500 uppercase tracking-wider">Skills Overlap</span>
              <span className="text-emerald-600">{skillsScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2.5 bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${skillsScore}%` }} />
            </div>
            <p className="text-[11px] text-gray-400">{analysis.matched_skills?.length || 0} skills matched</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500 uppercase tracking-wider">Experience Alignment</span>
              <span className="text-blue-600">{expScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2.5 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${expScore}%` }} />
            </div>
            <p className="text-[11px] text-gray-400">{resume.experience_years || 0} years vs required</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-500 uppercase tracking-wider">Semantic Vector Score</span>
              <span className="text-purple-600">{semanticScore}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-2.5 bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${semanticScore}%` }} />
            </div>
            <p className="text-[11px] text-gray-400">{analysis.semantic_interpretation || 'Deep embedding similarity'}</p>
          </div>
        </div>

        {/* AI Executive Feedback Summary */}
        {analysis.explanation && (
          <div className="bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 rounded-3xl p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Executive Synthesis</span>
            </div>
            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed font-medium">
              {analysis.explanation}
            </p>
          </div>
        )}

        {/* Matched Skills vs Skill Gaps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Matched Skills */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Matched Skills</h2>
                  <p className="text-xs text-gray-400">Verified strengths present in your resume</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                {analysis.matched_skills?.length || 0} Skills
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {(!analysis.matched_skills || analysis.matched_skills.length === 0) && (
                <div className="text-xs text-gray-400 py-4">No matching skills detected in resume.</div>
              )}
              {analysis.matched_skills?.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200/60 capitalize flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Skill Gaps / Missing Requirements */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Skill Gaps Identified</h2>
                  <p className="text-xs text-gray-400">Missing requirements needed for full match</p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200">
                {analysis.missing_skills?.length || 0} Gaps
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {(!analysis.missing_skills || analysis.missing_skills.length === 0) && (
                <div className="text-xs text-emerald-600 font-bold py-4">Awesome! Zero skill gaps found for this role.</div>
              )}
              {analysis.missing_skills?.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSkill(s)}
                  className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-1.5 rounded-xl border border-rose-200/60 capitalize flex items-center gap-1.5 transition"
                  title="Click to view learning syllabus"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{s}</span>
                  <span className="text-[10px] bg-white text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                    Fix →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive AI Skill Learning Roadmap */}
        {roadmap && roadmap.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Tailored Skill Growth Roadmap</h2>
                <p className="text-xs text-gray-400">Click any skill module to access structured syllabi and practice questions</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                AI Roadmap Ready
              </span>
            </div>

            <div className="space-y-3">
              {roadmap.map((item) => (
                <div
                  key={item.skill}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/70 hover:bg-emerald-50/40 border border-gray-100 hover:border-emerald-200 rounded-2xl transition-all duration-200 gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 capitalize group-hover:text-emerald-700 transition">
                        {item.skill}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {item.why_important || 'Essential competency for target job posting requirements'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/syllabus/${item.skill.toLowerCase().trim()}`)}
                      className="text-xs bg-white hover:bg-emerald-600 hover:text-white text-gray-700 font-semibold px-3 py-2 rounded-xl border border-gray-200/80 shadow-xs transition flex items-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Syllabus</span>
                    </button>
                    <button
                      onClick={() => navigate(`/interview/${item.skill.toLowerCase().trim()}`)}
                      className="text-xs bg-white hover:bg-purple-600 hover:text-white text-gray-700 font-semibold px-3 py-2 rounded-xl border border-gray-200/80 shadow-xs transition flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Interview Prep</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidate & Job Audit Metadata Card */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate & Audit Metadata</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block mb-0.5">Candidate Email</span>
              <span className="font-bold text-gray-800 truncate block">{resume.email || 'From Profile'}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block mb-0.5">Experience</span>
              <span className="font-bold text-gray-800">{resume.experience_years || 0} Years</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block mb-0.5">Resume Skills</span>
              <span className="font-bold text-gray-800">{resume.skills_found?.length || 0} Found</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-gray-400 block mb-0.5">Job Requirements</span>
              <span className="font-bold text-gray-800">{job.required_skills?.length || 0} Required</span>
            </div>
          </div>
        </div>

        {/* Action Footer Button */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/analyze')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition transform hover:scale-105 inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Analyze Another Job Posting →</span>
          </button>
        </div>

      </div>

      {/* Skill Modal Drawer */}
      {selectedSkill && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="bg-white border border-gray-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="font-bold text-gray-900 text-base capitalize">{selectedSkill}</div>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
                ×
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Launch your tailored learning path or practice technical interview questions for <strong className="capitalize">{selectedSkill}</strong>.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => navigate(`/syllabus/${selectedSkill.toLowerCase().trim()}`)}
                className="w-full flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold transition"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>View Structured Syllabus</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                onClick={() => navigate(`/interview/${selectedSkill.toLowerCase().trim()}`)}
                className="w-full flex items-center justify-between p-3.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-2xl text-xs font-bold transition"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Practice Interview Questions</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
