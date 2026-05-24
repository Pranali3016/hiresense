import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Analyze() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!file) return setError('Please upload your resume PDF')
    if (jd.trim().length < 50) return setError('Please paste the job description')

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('job_description', jd)

      const response = await axios.post(
        'http://localhost:8000/api/v1/analyze/resume',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      // Save result and go to results page
      localStorage.setItem('hiresense_result', JSON.stringify(response.data))
      navigate('/results')

    } catch (err) {
      setError('Something went wrong. Make sure your backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-semibold text-gray-900 text-lg">HireSense</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyze your resume</h1>
        <p className="text-gray-500 mb-10">Upload your resume and paste the job description below</p>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your resume (PDF only)
          </label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 transition"
            onClick={() => document.getElementById('fileInput').click()}
          >
            {file ? (
              <div>
                <div className="text-emerald-600 font-medium">✓ {file.name}</div>
                <div className="text-sm text-gray-400 mt-1">Click to change file</div>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">📄</div>
                <div className="text-gray-600 font-medium">Click to upload your resume</div>
                <div className="text-sm text-gray-400 mt-1">PDF files only, max 5MB</div>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {/* JD Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job description
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 resize-none focus:outline-none focus:border-emerald-400 transition"
            rows={8}
            placeholder="Paste the job description here — copy it from LinkedIn, Naukri, or any job site..."
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing your resume...' : 'Analyze now →'}
        </button>

        {loading && (
          <div className="text-center text-sm text-gray-400 mt-4">
            This takes 10-20 seconds. AI is reading your resume...
          </div>
        )}
      </div>
    </div>
  )
}