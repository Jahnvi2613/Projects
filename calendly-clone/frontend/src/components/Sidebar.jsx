import { NavLink } from 'react-router-dom'
import { LayoutGrid, Clock, Users, Calendar } from 'lucide-react'

const NAV = [
  { to: '/dashboard',    icon: LayoutGrid, label: 'Event Types' },
  { to: '/availability', icon: Clock,      label: 'Availability' },
  { to: '/meetings',     icon: Users,      label: 'Meetings' },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Calendar size={16} className="text-white" />
        </div>
        <span className="text-base font-bold text-gray-900 tracking-tight">Schedulr</span>
      </div>

      {/* User pill */}
      <div className="mx-3 mt-4 mb-2 flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          A
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-gray-800 truncate">Admin User</p>
          <p className="text-xs text-gray-400">admin</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-3 mt-2 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
        <p>Calendly Clone</p>
        <p>SDE Intern Assignment</p>
      </div>
    </aside>
  )
}
