import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import logo from '../assets/logo.png'

function VerifyInternalError() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/register')
    }, 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <img
        src={logo}
        alt="Noteabl logo"
        className="h-16 w-auto mb-6"
      />
      <AlertTriangle className="w-16 h-16 text-gray-600 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800">Something Went Wrong</h1>
      <p className="mt-2 text-gray-700">
        Something went wrong while registering your account. Please try
        registering again.
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Redirecting to registration...
      </p>
      <Link
        to="/register"
        className="mt-4 underline text-gray-700 hover:text-gray-900"
      >
        Click here if you are not redirected
      </Link>
    </div>
  )
}

export default VerifyInternalError
