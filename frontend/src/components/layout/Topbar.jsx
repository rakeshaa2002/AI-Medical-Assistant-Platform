import { useNavigate } from 'react-router-dom'
import { FiMenu, FiMoon, FiSun, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.full_name || user?.email || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
      <button onClick={onMenuClick} className="rounded p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden">
        <FiMenu size={20} />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{user?.full_name || user?.email}</p>
            <p className="text-xs capitalize text-slate-400">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
          aria-label="Log out"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  )
}
