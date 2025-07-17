import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import logo from '../assets/logo.png'

function VerifyAlreadyVerified() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login')
    }, 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6 text-center">
      {/* Logo */}
      <img
        src={logo}
        alt="Noteable logo"
        className="h-16 w-auto mb-6"
      />

      {/* Icon */}
      <CheckCircle className="w-16 h-16 text-blue-600 mb-4" />

      <h1 className="text-3xl font-bold text-blue-700">Already Verified</h1>
      <p className="mt-2 text-blue-800">
        Your email has already been verified. Please log in to continue.
      </p>
      <p className="text-sm text-blue-600 mt-1">Redirecting to login page...</p>
      <Link
        to="/login"
        className="mt-4 underline text-blue-700 hover:text-blue-900"
      >
        Click here if you are not redirected
      </Link>
    </div>
  )
}

export default VerifyAlreadyVerified
