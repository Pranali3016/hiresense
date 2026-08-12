import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Target, TrendingUp, BookOpen, MessageSquare, ArrowRight,
  CheckCircle2, Shield, Zap, Award, Layers, Users, ChevronRight, FileText, Star
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    const token = localStorage.getItem('hiresense_token')
    navigate(token ? '/analyze' : '/signup')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-emerald-100/60 via-teal-50/30 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-24 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Header Navbar */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100 px-3.5 sm:px-8 py-3 sm:py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-lg sm:text-xl tracking-tight leading-none">HireSense</span>
              <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold tracking-wider uppercase mt-0.5">AI Platform</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold text-gray-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Platform Capabilities</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#recruiter-suite" className="hover:text-emerald-600 transition-colors">Recruiter Suite</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 px-2.5 sm:px-3.5 py-2 rounded-xl transition"
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap"
            >
              <span className="hidden sm:inline">Launch Free Scan</span>
              <span className="sm:hidden">Free Scan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-20 pb-10 sm:pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full mb-4 sm:mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>AI-POWERED RESUME INTELLIGENCE</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-6 max-w-4xl mx-auto">
          Know Exactly Why You <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
            Didn't Get The Callback.
          </span>
        </h1>

        <p className="text-gray-500 text-xs sm:text-base md:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-medium">
          Upload your resume, paste any job description, and receive an instant AI match score, skill gap roadmap, and interview prep kit in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-10 sm:mb-14">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-6 sm:px-8 py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Check My Resume Free</span>
          </button>
          <button
            onClick={() => navigate('/recruiter/signup')}
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs sm:text-sm font-bold px-6 sm:px-8 py-3.5 rounded-2xl transition hover:border-emerald-300 flex items-center justify-center gap-2 shadow-xs"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Recruiter Portal →</span>
          </button>
        </div>

        {/* Floating Metrics Counter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto bg-white border border-gray-100 rounded-3xl p-3.5 sm:p-6 shadow-md shadow-gray-200/40">
          <div className="text-center p-2 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <div className="text-xl sm:text-3xl font-black text-emerald-600">98.4%</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Match Accuracy</div>
          </div>
          <div className="text-center p-2 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <div className="text-xl sm:text-3xl font-black text-teal-600">50,000+</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Resumes Scanned</div>
          </div>
          <div className="text-center p-2 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <div className="text-xl sm:text-3xl font-black text-blue-600">3.8x</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Higher Callbacks</div>
          </div>
          <div className="text-center p-2 bg-gray-50/50 sm:bg-transparent rounded-2xl sm:rounded-none">
            <div className="text-xl sm:text-3xl font-black text-emerald-600">&lt; 30s</div>
            <div className="text-[10px] sm:text-xs text-gray-500 font-semibold mt-0.5">Audit Speed</div>
          </div>
        </div>
      </section>

      {/* Interactive AI Preview Demo Card Showcase */}
      <section className="py-6 sm:py-8 px-3.5 sm:px-8 max-w-6xl mx-auto">
        <div className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-10 shadow-md shadow-gray-200/50 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-gray-100 pb-4 sm:pb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">Live Intelligence Preview</span>
              <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900">Senior Web Developer Position Benchmark</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Alex Rivera</span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                🏆 Winner Match (88%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Skills</span>
                <span>8 Verified</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'REST APIs', 'Git', 'FastAPI', 'Docker'].map(s => (
                  <span key={s} className="text-[11px] sm:text-xs bg-emerald-100/70 text-emerald-800 px-2.5 py-1 rounded-lg font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-rose-500" /> Skill Gaps</span>
                <span>2 Actionable</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['GraphQL', 'Kubernetes'].map(s => (
                  <span key={s} className="text-[11px] sm:text-xs bg-rose-100/70 text-rose-800 px-2.5 py-1 rounded-lg font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-emerald-600" /> AI Fix Roadmap</span>
                <span>Generated</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Structured syllabus created to master GraphQL & Kubernetes with practice interview questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-10 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2">Engineered For Excellence</span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Everything You Need To Win Your Next Role</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-100 hover:border-emerald-200 rounded-3xl p-6 sm:p-8 transition-all duration-200 shadow-sm hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 sm:mb-6">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">AI Match Engine</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Deep semantic parsing analyzes experience, skill keywords, and core domain requirements to give an instant candidate match score.
            </p>
          </div>

          <div className="bg-white border border-gray-100 hover:border-emerald-200 rounded-3xl p-6 sm:p-8 transition-all duration-200 shadow-sm hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold mb-4 sm:mb-6">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Skill Gap Roadmaps</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Automatically turns identified missing skills into structured module syllabi with checkpoint tracking.
            </p>
          </div>

          <div className="bg-white border border-gray-100 hover:border-emerald-200 rounded-3xl p-6 sm:p-8 transition-all duration-200 shadow-sm hover:-translate-y-0.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 sm:mb-6">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">AI Interview Prep</h3>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Practice role-specific technical and behavioral interview questions with real-time feedback before speaking to hiring managers.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Step Walkthrough */}
      <section id="how-it-works" className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto border-t border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2">Simple Workflow</span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900">Three Steps To Candidate Success</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm shadow-emerald-600/20">
              1
            </div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Upload Master Resume</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Drop your PDF resume into your secure Candidate Profile vault.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-600 text-white font-black text-sm flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm shadow-teal-600/20">
              2
            </div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Paste Job Description</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Copy the job posting from LinkedIn, Naukri, or any company page.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm">
              3
            </div>
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5">Unlock Fix Action Plan</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Get your match score, verified gaps, and instant learning roadmap.</p>
          </div>
        </div>
      </section>

      {/* Recruiter Suite Highlight */}
      <section id="recruiter-suite" className="py-10 sm:py-14 px-3.5 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-400 uppercase tracking-widest block">Recruiter Suite</span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Bulk Resume Screening & Winner Ranking</h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed font-medium">
              Recruiters can upload multiple candidate resumes at once to automatically rank top applicants, view match scores, winner tags (🏆 Winner), and detailed skill gap breakdowns.
            </p>
            <button
              onClick={() => navigate('/recruiter/signup')}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-extrabold px-6 py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 mx-auto md:mx-0"
            >
              <span>Access Recruiter Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-white border-b border-white/10 pb-2">
              <span>Top Candidate Spotlight</span>
              <span className="text-emerald-300">🏆 Winner</span>
            </div>
            <div className="flex items-center justify-between bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
              <div>
                <div className="text-xs font-bold text-white">Priya Sharma</div>
                <div className="text-[10px] text-emerald-200">Senior Full Stack Engineer</div>
              </div>
              <span className="text-xs font-black text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded-md">94%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Section */}
      <footer className="border-t border-gray-200/80 py-10 sm:py-12 px-4 sm:px-8 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900">Ready To Transform Your Job Search?</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
            Join thousands of software engineers and tech professionals using HireSense AI to optimize their resumes.
          </p>
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition transform hover:scale-105"
          >
            Launch Free Resume Audit →
          </button>
          <div className="text-[10px] sm:text-[11px] text-gray-400 pt-4">
            © {new Date().getFullYear()} HireSense AI Inc. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
