import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import logo from '../assets/logo.png'

function NotFoundPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-6 text-center">
      <img
        src={logo}
        alt="Noteabl logo"
        className="h-16 w-auto mb-6"
      />
      <AlertTriangle className="w-16 h-16 text-yellow-600 mb-4" />
      <h1 className="text-3xl font-bold text-yellow-700">
        404: Page Not Found
      </h1>
      <p className="mt-2 text-yellow-800">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <p className="text-sm text-yellow-600 mt-1">Redirecting to homepage...</p>
      <Link
        to="/"
        className="mt-4 underline text-yellow-700 hover:text-yellow-900"
      >
        Click here if you are not redirected
      </Link>
    </div>
  )
}

export default NotFoundPage
