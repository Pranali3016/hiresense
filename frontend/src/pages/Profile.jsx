import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  User, Target, MapPin, UploadCloud, FileCheck2, LogOut, Sparkles,
  Briefcase, CheckCircle2, Shield, Globe, Link2, Code2, Save, Camera, Trash2
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const ROLE_SUGGESTIONS = [
  'Fresher', 'AI/ML Engineer', 'Data Scientist', 'Data Analyst',
  'Backend Developer', 'Frontend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Product Manager', 'Software Engineer'
]

const DEFAULT_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL',
  'Git', 'FastAPI', 'Tailwind CSS', 'Docker', 'REST APIs', 'AWS'
]

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [location, setLocation] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 yrs)')
  const [jobStatus, setJobStatus] = useState('Actively Looking')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [newSkill, setNewSkill] = useState('')
  const [photo, setPhoto] = useState(localStorage.getItem('hiresense_candidate_photo') || null)

  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('career')

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('hiresense_token')}` }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/me`,
          { headers: authHeaders, timeout: 20000 }
        )
        setProfile(res.data)
        setTargetRole(res.data.target_role || '')
        setLocation(res.data.location || '')
      } catch (e) {
        setError('Could not load your profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_email')
    localStorage.removeItem('hiresense_name')
    navigate('/login')
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Photo = reader.result
      setPhoto(base64Photo)
      localStorage.setItem('hiresense_candidate_photo', base64Photo)
      window.dispatchEvent(new Event('hiresense_avatar_updated'))
      setSuccess('Profile photo updated successfully!')
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    localStorage.removeItem('hiresense_candidate_photo')
    window.dispatchEvent(new Event('hiresense_avatar_updated'))
    setSuccess('Profile photo removed.')
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('target_role', targetRole.trim())
      formData.append('location', location.trim())
      if (resume) formData.append('resume', resume)

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/onboarding/complete`,
        formData,
        { headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
      )
      setSuccess('Profile successfully updated!')
      setResume(null)
      setProfile((p) => ({ ...p, target_role: targetRole.trim(), location: location.trim(), has_resume: p.has_resume || !!resume }))
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (e) => {
    e.preventDefault()
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  const calculateStrength = () => {
    let score = 20
    if (targetRole) score += 20
    if (location) score += 20
    if (photo) score += 20
    if (profile?.has_resume || resume) score += 20
    return Math.min(score, 100)
  }

  const strength = profile ? calculateStrength() : 0

  return (
    <DashboardLayout
      title="Candidate Profile"
      subtitle="Manage your professional presence, photo, skills, and resume portfolio"
      action={
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      }
    >
      <div className="max-w-4xl space-y-6">
        {loading && <div className="text-center py-20 text-sm text-gray-400">Loading profile...</div>}
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-2xl p-4">{error}</div>}
        {success && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-2xl p-4 font-semibold">{success}</div>}

        {profile && (
          <>
            {/* Candidate Header Hero Card */}
            <div className="bg-gradient-to-r from-gray-900 via-emerald-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Candidate Profile"
                        className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-emerald-400 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-200 text-gray-950 flex items-center justify-center text-2xl font-black shadow-lg">
                        {(profile.name || profile.email || '?')[0].toUpperCase()}
                      </div>
                    )}

                    {/* Camera Change Button */}
                    <label
                      htmlFor="hero-photo-input"
                      className="absolute -bottom-1 -right-1 bg-emerald-500 hover:bg-emerald-400 text-gray-950 p-1.5 rounded-xl border-2 border-gray-900 shadow-lg cursor-pointer transition transform group-hover:scale-105"
                      title="Upload or Take Candidate Photo"
                    >
                      <Camera className="w-4 h-4 fill-current" />
                    </label>
                    <input
                      id="hero-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-white">{profile.name || 'Candidate'}</h1>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {jobStatus}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
                      {targetRole || 'Software Professional'} • {location || 'India'}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label
                        htmlFor="hero-photo-input-btn"
                        className="text-[11px] bg-white/10 hover:bg-white/20 text-emerald-200 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer transition flex items-center gap-1"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{photo ? 'Change Photo' : 'Add Candidate Photo'}</span>
                      </label>
                      <input
                        id="hero-photo-input-btn"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      {photo && (
                        <button
                          onClick={handleRemovePhoto}
                          className="text-[11px] text-red-300 hover:text-red-200 hover:bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/20 transition flex items-center gap-1"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{profile.email}</p>
                  </div>
                </div>

                {/* Profile Strength Progress Meter */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 shrink-0 md:w-64">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-300">Profile Strength</span>
                    <span className="text-white">{strength}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-emerald-100/70">
                    {strength < 100 ? 'Upload resume & add location for 100% strength' : 'Complete profile! Match ready.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm overflow-x-auto">
              <button
                onClick={() => setActiveTab('career')}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'career' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Career Setup</span>
              </button>

              <button
                onClick={() => setActiveTab('resume')}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'resume' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Resume Vault</span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'skills' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Skills & Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab('social')}
                className={`flex-1 min-w-[120px] text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                  activeTab === 'social' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Social Links</span>
              </button>
            </div>

            {/* TAB 1: Career & Role Setup */}
            {activeTab === 'career' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Career Preferences</h2>
                  <p className="text-xs text-gray-400">Specify your target role and location for AI job matching</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profile.name || ''}
                        disabled
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Email Address</label>
                    <input
                      type="text"
                      value={profile.email || ''}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Target Job Title</label>
                    <div className="relative">
                      <Target className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        list="role-suggestions"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Full Stack Developer, Data Scientist"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                    <datalist id="role-suggestions">
                      {ROLE_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Preferred Location (City)</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Pune, Mumbai, Remote"
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="Fresher (0-1 yrs)">Fresher (0-1 yrs)</option>
                      <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                      <option value="Mid-Level (3-5 yrs)">Mid-Level (3-5 yrs)</option>
                      <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1.5 block">Job Search Status</label>
                    <select
                      value={jobStatus}
                      onChange={(e) => setJobStatus(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition"
                    >
                      <option value="Actively Looking">Actively Looking for Jobs</option>
                      <option value="Open to Offers">Open to Offers</option>
                      <option value="Preparing Skills">Preparing Skills / Studying</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Resume Vault */}
            {activeTab === 'resume' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Resume Vault</h2>
                  <p className="text-xs text-gray-400">Upload your master PDF resume to evaluate against job descriptions</p>
                </div>

                <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/20 rounded-2xl p-6 text-center">
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      {resume ? (
                        <div className="text-sm font-bold text-emerald-800">{resume.name}</div>
                      ) : profile.has_resume ? (
                        <div className="text-sm font-bold text-gray-900">
                          Resume on File (PDF) • Click to Replace
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-900">
                          Click to upload your Master Resume (PDF)
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">PDF format required, up to 5MB</p>
                    </div>
                  </label>
                  <input
                    id="resume-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>

                {profile.has_resume && (
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <FileCheck2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-gray-900">Active Resume Synced</div>
                        <div className="text-[11px] text-gray-400">Used automatically for AI job matching</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/analyze')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-xl transition"
                    >
                      Run Analysis →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Skills & Competencies */}
            {activeTab === 'skills' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Skills Matrix</h2>
                  <p className="text-xs text-gray-400">Technologies and core skills linked to your candidate profile</p>
                </div>

                <form onSubmit={addSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill (e.g. React, GraphQL, PostgreSQL)"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    + Add Skill
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-xl border border-emerald-200/60"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-emerald-500 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Social Links & Portfolio */}
            {activeTab === 'social' && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Portfolio & External Profiles</h2>
                  <p className="text-xs text-gray-400">Share your GitHub, LinkedIn, and personal portfolio links</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-blue-600" /> LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.in/in/username"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-gray-900" /> GitHub Profile
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 mb-1 block flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-teal-600" /> Personal Portfolio / Website
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Logout Footer Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Session & Security</div>
                  <div className="text-xs text-gray-400">Signed in as {profile.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl border border-red-200/50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
