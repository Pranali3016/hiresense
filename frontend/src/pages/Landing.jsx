import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-gray-900 text-lg">HireSense</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-900">For candidates</span>
          <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-900">For companies</span>
          <button
            onClick={() => navigate('/analyze')}
            className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-block bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          AI-powered · Free for candidates
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Know exactly why you<br />
          <span className="text-emerald-600">didn't get the callback</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Upload your resume. Paste the job description.
          Get a match score, skill gaps, and a fix plan — in 30 seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/analyze')}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-700 transition text-lg"
          >
            Check my resume →
          </button>
          <button className="border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition text-lg">
            I'm a recruiter
          </button>
        </div>
      </div>

      {/* 3 Steps */}
      <div className="max-w-4xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold flex items-center justify-center mx-auto mb-4">1</div>
            <div className="font-medium text-gray-900 mb-1">Upload resume</div>
            <div className="text-sm text-gray-500">PDF file from your laptop</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold flex items-center justify-center mx-auto mb-4">2</div>
            <div className="font-medium text-gray-900 mb-1">Paste job description</div>
            <div className="text-sm text-gray-500">Copy from LinkedIn or Naukri</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold flex items-center justify-center mx-auto mb-4">3</div>
            <div className="font-medium text-gray-900 mb-1">Get your report</div>
            <div className="text-sm text-gray-500">Score + gaps + action plan</div>
          </div>
        </div>
      </div>

    </div>
  )
}