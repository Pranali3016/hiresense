import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, History, Settings, LogOut, ChevronDown } from 'lucide-react'

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
      className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 border-b border-gray-100 bg-white relative flex-wrap"
      onClick={() => { setProfileOpen(false); setNotifOpen(false) }}
    >
      <div className="flex items-center min-w-0">
        {menuButton}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-400 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4" onClick={(e) => e.stopPropagation()}>
        {action}

        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }} className="text-gray-400 hover:text-gray-600 transition">
            <Bell className="w-5 h-5" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-xl shadow-lg py-3 px-4 text-sm text-gray-400 z-20">
              No new notifications
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }} className="flex items-center gap-1.5">
            {photo ? (
              <img src={photo} alt="User Avatar" className="w-8 h-8 rounded-full object-cover border border-emerald-400/80" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold uppercase">
                {initial}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-20">
              <div className="px-4 py-2 border-b border-gray-50">
                <div className="text-sm font-medium text-gray-900 truncate">{storedName || 'Your account'}</div>
                <div className="text-xs text-gray-400 truncate">{email}</div>
              </div>
              <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => navigate('/history')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                <History className="w-4 h-4" /> Analysis History
              </button>
              <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
                <Settings className="w-4 h-4" /> Profile
              </button>
              <div className="border-t border-gray-50 mt-1 pt-1">
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition">
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
