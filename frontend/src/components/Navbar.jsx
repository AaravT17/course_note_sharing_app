import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import {
  NotebookText,
  Search,
  Upload,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react'

function Navbar({ isLoggedIn = false }) {
  return (
    <nav className="flex font-heading justify-between items-center p-4 mb-2 shadow-md">
      {/* Logo */}
      <div className="text-3xl font-bold mr-4">
        <Link to="/">
          <img
            src={logo}
            alt="Noteable logo"
            className="h-12 min-w-40 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <ul className="flex gap-4 text-base min-w-max">
        {isLoggedIn ? (
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
              >
                <Search className="w-5 h-5" />
                Browse
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
              >
                <Upload className="w-5 h-5" />
                Upload
              </NavLink>
            </li>
            <li>
              <button className="flex items-center gap-2 text-red-600 hover:bg-red-600 hover:text-white px-3 py-3 rounded-md transition leading-none cursor-pointer">
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
