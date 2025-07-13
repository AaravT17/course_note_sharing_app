import { Mail, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

function LoginForm() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-heading font-bold text-gray-800 text-center mb-6">
          Login to Noteable
        </h2>

        <form className="space-y-5 font-body">
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
                type="email"
                placeholder="you@example.com"
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
                type="password"
                placeholder="••••••••"
                required
                className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
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
