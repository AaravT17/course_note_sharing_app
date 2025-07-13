import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { NotebookText, Search, Upload, LogOut } from 'lucide-react'

function Navbar() {
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
        <li>
          <Link
            to="/browse"
            className="flex items-center gap-2 text-black hover:bg-blue-700 hover:text-white px-3 py-3 rounded-md transition leading-none"
          >
            <Search className="w-5 h-5" />
            Browse
          </Link>
        </li>
        <li>
          <Link
            to="/my-notes"
            className="flex items-center gap-2 text-black hover:bg-blue-700 hover:text-white px-3 py-3 rounded-md transition leading-none"
          >
            <NotebookText className="w-5 h-5" />
            My Notes
          </Link>
        </li>
        <li>
          <Link
            to="/upload"
            className="flex items-center gap-2 text-black hover:bg-blue-700 hover:text-white px-3 py-3 rounded-md transition leading-none"
          >
            <Upload className="w-5 h-5" />
            Upload
          </Link>
        </li>
        <li>
          <button className="flex items-center gap-2 text-red-600 hover:bg-red-600 hover:text-white px-3 py-3 rounded-md transition leading-none cursor-pointer">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
