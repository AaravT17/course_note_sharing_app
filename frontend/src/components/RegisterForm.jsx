import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { register } from '../features/user/userSlice.js'
import { isValidEmail, isStrongPassword } from '../utils/userUtils.js'
import { MIN_PASSWORD_LENGTH } from '../config/constants.js'

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { name, email, password, confirmPassword } = formData

  const dispatch = useDispatch()

  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.user
  )

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

  const handleRegister = (e) => {
    e.preventDefault()
    const { name, email, password, confirmPassword } = formData
    if (
      name.trim() === '' ||
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      toast.error('Please fill in all fields')
    } else if (!isValidEmail(email.trim())) {
      toast.error('Please enter a valid email address')
    } else if (password.trim() !== confirmPassword.trim()) {
      toast.error('Passwords do not match')
    } else if (!isStrongPassword(password.trim())) {
      toast.error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character`
      )
    } else {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
      }
      dispatch(register(userData))
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-heading font-bold text-gray-800 text-center mb-6">
          Create an Account
        </h2>

        <form
          className="space-y-5 font-body"
          onSubmit={handleRegister}
        >
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <User className="text-gray-400 w-5 h-5 mr-2" />
              <input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={name}
                disabled={isLoading}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              />
            </div>
          </div>
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
                disabled={isLoading}
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
            <div className="relative flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <Lock className="text-gray-400 w-5 h-5 mr-2" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                disabled={isLoading}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-600">
              <Lock className="text-gray-400 w-5 h-5 mr-2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                disabled={isLoading}
                onChange={handleChange}
                required
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4 font-body">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
