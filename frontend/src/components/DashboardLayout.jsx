import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ title, subtitle, action, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          action={action}
          menuButton={
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 mr-1">
              <Menu className="w-5 h-5" />
            </button>
          }
        />
        <main className="px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  )
}
