import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import logo from '../assets/logo.png'

function VerifyInvalid() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/register'), 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 text-center">
      <img
        src={logo}
        alt="Noteabl logo"
        className="h-16 w-auto mb-6"
      />
      <XCircle className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-3xl font-bold text-red-700">Invalid Link</h1>
      <p className="mt-2 text-red-800">This verification link is invalid.</p>
      <p className="text-sm text-red-600 mt-1">
        Please re-register to create your account.
      </p>
      <p className="text-sm text-red-600">Redirecting to registration...</p>
      <Link
        to="/register"
        className="mt-4 underline text-red-700 hover:text-red-900"
      >
        Click here if you are not redirected
      </Link>
    </div>
  )
}

export default VerifyInvalid
