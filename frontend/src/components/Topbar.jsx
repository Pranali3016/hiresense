import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, History, Settings, LogOut, ChevronDown, Sparkles } from 'lucide-react'

export default function Topbar({ title, subtitle, action, menuButton }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [photo, setPhoto] = useState(localStorage.getItem('hiresense_candidate_photo') || null)

  const email = localStorage.getItem('hiresense_email') || ''
  const storedName = localStorage.getItem('hiresense_name') || ''
  const initial = (storedName || email || '?').trim()[0]?.toUpperCase() || '?'

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
    <header
      className="flex items-center justify-between gap-2.5 sm:gap-4 px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-gray-100 bg-white relative"
      onClick={() => { setProfileOpen(false); setNotifOpen(false) }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {menuButton}
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-gray-400 truncate hidden xs:block sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        {action}

        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl py-3 px-4 text-xs text-gray-400 z-50">
              No new notifications
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
            className="flex items-center gap-1.5 p-0.5 rounded-xl hover:bg-gray-50 transition"
            aria-label="User menu"
          >
            {photo ? (
              <img src={photo} alt="User Avatar" className="w-8 h-8 rounded-full object-cover border border-emerald-400/80 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {initial}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-50">
                <div className="text-xs font-bold text-gray-900 truncate">{storedName || 'Your account'}</div>
                <div className="text-[11px] text-gray-400 truncate">{email}</div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition text-left"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" /> Dashboard
              </button>
              <button
                onClick={() => navigate('/history')}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition text-left"
              >
                <History className="w-4 h-4 text-blue-600" /> Analysis History
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition text-left"
              >
                <Settings className="w-4 h-4 text-gray-500" /> Profile & Settings
              </button>
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition text-left font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
