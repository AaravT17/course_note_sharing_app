import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TimerOff } from 'lucide-react'
import logo from '../assets/logo.png'

function VerifyExpired() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/register'), 5000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 p-6 text-center">
      <img
        src={logo}
        alt="Noteable logo"
        className="h-16 w-auto mb-6"
      />
      <TimerOff className="w-16 h-16 text-yellow-600 mb-4" />
      <h1 className="text-3xl font-bold text-yellow-700">Link Expired</h1>
      <p className="mt-2 text-yellow-800">
        Your verification link has expired.
      </p>
      <p className="text-sm text-yellow-600 mt-1">
        Please re-register to activate your account.
      </p>
      <p className="text-sm text-yellow-600">Redirecting to registration...</p>
      <Link
        to="/register"
        className="mt-4 underline text-yellow-700 hover:text-yellow-900"
      >
        Click here if you are not redirected
      </Link>
    </div>
  )
}

export default VerifyExpired
