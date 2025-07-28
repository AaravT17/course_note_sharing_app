import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import {
  NotebookText,
  Search,
  Heart,
  Upload,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'

import { logout } from '../features/user/userSlice.js'

function Navbar({ loading = false }) {
  const dispatch = useDispatch()

  const { user, isLoading } = useSelector((state) => state.user)

  const handleLogout = (e) => {
    dispatch(logout())
  }

  const blockNavOnLoading = (e) => {
    if (loading || isLoading) {
      e.preventDefault()
    }
  }

  return (
    <nav className="flex font-heading justify-between items-center p-4 mb-2 shadow-md">
      {/* Logo */}
      <div className="text-3xl font-bold mr-1 sm:mr-4">
        <Link to="/">
          <img
            src={logo}
            alt="Noteabl logo"
            className="h-12 min-w-48 w-auto"
            onClick={blockNavOnLoading}
          />
        </Link>
      </div>

      {/* Navigation */}
      <ul className="flex gap-1 text-sm sm:gap-4 sm:text-base min-w-max">
        {user ? (
          <>
            <li>
              <NavLink
                to="/browse"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md transition leading-none ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-blue-700 hover:text-white'
                  }`
                }
                onClick={blockNavOnLoading}
              >
                <Search className="w-5 h-5" />
                Browse
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/liked-notes"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md transition leading-none ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-blue-700 hover:text-white'
                  }`
                }
                onClick={blockNavOnLoading}
              >
                <Heart className="w-5 h-5" />
                Liked
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/my-notes"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md transition leading-none ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-blue-700 hover:text-white'
                  }`
                }
                onClick={blockNavOnLoading}
              >
                <NotebookText className="w-5 h-5" />
                My Notes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md transition leading-none ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-blue-700 hover:text-white'
                  }`
                }
                onClick={blockNavOnLoading}
              >
                <Upload className="w-5 h-5" />
                Upload
              </NavLink>
            </li>
            <li>
              <button
                className="flex items-center gap-2 text-red-600 hover:bg-red-600 hover:text-white px-3 py-3 rounded-md transition leading-none cursor-pointer"
                onClick={handleLogout}
                disabled={loading || isLoading}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md transition leading-none ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-blue-700 hover:text-white'
                  }`
                }
                onClick={blockNavOnLoading}
              >
                <LogIn className="w-5 h-5" />
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-3 rounded-md transition leading-none ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-black hover:bg-blue-700 hover:text-white'
                  }`
                }
                onClick={blockNavOnLoading}
              >
                <UserPlus className="w-5 h-5" />
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Navbar
