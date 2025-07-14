import { Mail, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, use } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { reset, login } from '../features/user/userSlice.js'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.user
  )

  useEffect(() => {
    if (user) {
      navigate('/')
      dispatch(reset())
      return
    }

    if (isError) {
      toast.error(message)
      dispatch(reset())
      return
    }
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const handleChange = (e) => {
    setFormData((prevState) => {
      return {
        ...prevState,
        [e.target.name]:
          e.target.name === 'email'
            ? e.target.value.toLowerCase()
            : e.target.value,
      }
    })
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const { email, password } = formData
    if (email.trim() === '' || password.trim() === '') {
      toast.error('Please fill in all fields')
    } else {
      const userData = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }
      dispatch(login(userData))
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-heading font-bold text-gray-800 text-center mb-6">
          Login to Noteable
        </h2>

        <form
          className="space-y-5 font-body"
          onSubmit={handleLogin}
        >
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <Mail className="text-gray-400 w-5 h-5 mr-2" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <Lock className="text-gray-400 w-5 h-5 mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4 font-body">
          Don’t have an account?{' '}
          <Link
            to="/register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
