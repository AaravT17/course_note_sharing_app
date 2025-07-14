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
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset, logout } from '../features/user/userSlice.js'
import { useState, useEffect } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.user
  )

  const handleLogout = (e) => {
    e.preventDefault()
    dispatch(logout())
  }

  useEffect(() => {
    if (isError) {
      toast.error(message)
      dispatch(reset())
      return
    }

    if (isSuccess && !user) {
      toast.success('Logout successful!')
      dispatch(reset())
      navigate('/login')
      return
    }
  }, [user, isError, isSuccess, message, navigate, dispatch])

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
              <button
                className="flex items-center gap-2 text-red-600 hover:bg-red-600 hover:text-white px-3 py-3 rounded-md transition leading-none cursor-pointer"
                onClick={handleLogout}
                disabled={isLoading}
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
