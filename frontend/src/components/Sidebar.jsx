import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Upload, History,
  Target, Map, MessageSquare, Settings, LogOut, Sparkles, X, ChevronRight
} from 'lucide-react'

const navGroups = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Resume Hub',
    items: [
      { label: 'Upload & Analyze', to: '/analyze', icon: Upload },
      { label: 'Resume Versions', to: '/profile', icon: FileText },
    ]
  },
  {
    title: 'Career Insights',
    items: [
      { label: 'Analysis History', to: '/history', icon: History },
      { label: 'Skill Gaps', to: '/skill-gaps', icon: Target },
      { label: 'Learning Roadmap', to: '/learning-roadmap', icon: Map },
      { label: 'Interview Prep', to: '/interview-prep', icon: MessageSquare },
    ]
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', to: '/profile', icon: Settings }
    ]
  },
]

export default function Sidebar({ onNavigate, onClose }) {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(localStorage.getItem('hiresense_candidate_photo') || null)

  const email = localStorage.getItem('hiresense_email') || ''
  const storedName = localStorage.getItem('hiresense_name') || ''
  const displayName = storedName || (email ? email.split('@')[0] : 'Candidate')
  const initial = (displayName || '?').trim()[0]?.toUpperCase() || '?'

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setPhoto(localStorage.getItem('hiresense_candidate_photo') || null)
    }
    window.addEventListener('hiresense_avatar_updated', handleAvatarUpdate)
    return () => window.removeEventListener('hiresense_avatar_updated', handleAvatarUpdate)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('hiresense_token')
    localStorage.removeItem('hiresense_email')
    localStorage.removeItem('hiresense_name')
    localStorage.removeItem('hiresense_candidate_photo')
    navigate('/login')
  }

  return (
    <aside className="w-64 lg:w-60 shrink-0 bg-white border-r border-gray-100/80 h-full min-h-screen flex flex-col justify-between py-5 px-4 overflow-y-auto select-none shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => { navigate('/dashboard'); onNavigate?.() }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-lg leading-tight tracking-tight">HireSense</span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase">AI Platform</span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <div className="text-[11px] font-bold text-gray-400/90 uppercase tracking-wider px-3 mb-1.5 mt-4">
                  {group.title}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end
                    onClick={() => onNavigate?.()}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700 font-semibold shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="pt-4 border-t border-gray-100/80">
        <div className="flex items-center justify-between bg-gray-50/80 rounded-xl p-2.5 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {photo ? (
              <img src={photo} alt="User Avatar" className="w-8 h-8 rounded-full object-cover border border-emerald-400/80 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-900 truncate">{displayName}</div>
              <div className="text-[10px] text-gray-400 truncate">Job Seeker</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

