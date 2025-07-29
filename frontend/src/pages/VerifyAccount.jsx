import { useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import logo from '../assets/logo.png'
import axiosPublic from '../api/axiosPublic'

function VerifyAccount() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!token || loading) return
    setLoading(true)
    try {
      await axiosPublic.post('/api/users/verify', { token })
      navigate('/verify/success')
    } catch (err) {
      if (err.response?.data?.message === 'Expired link') {
        navigate('/verify/expired')
      } else if (err.response?.data?.message === 'Invalid link') {
        navigate('/verify/invalid')
      } else {
        navigate('/verify/internal-error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/verify/invalid')
    }
  }, [token, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6 text-center">
      <img
        src={logo}
        alt="Noteabl logo"
        className="h-16 w-auto mb-6"
      />
      <ShieldCheck className="w-16 h-16 text-blue-600 mb-4" />
      <h1 className="text-3xl font-bold text-blue-700">Email Verification</h1>
      <p className="mt-2 text-blue-800">
        Click below to verify your account and complete your registration.
      </p>
      <div className="mt-6">
        <button
          onClick={handleVerify}
          disabled={!token || loading}
          className="text-blue-700 underline hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none p-0"
        >
          Click here to verify your account
        </button>
      </div>
    </div>
  )
}

export default VerifyAccount
