import axiosPublic from '../../api/axiosPublic.js'
import { setAccessToken, clearAccessToken } from '../../api/tokenManager.js'

const register = async (userData) => {
  const response = await axiosPublic.post('/api/users/', userData)
  return response.data
}

const login = async (userData) => {
  const response = await axiosPublic.post('/api/users/login', userData, {
    withCredentials: true,
  })
  setAccessToken(response.data.accessToken)
  return response.data.user
}

const logout = async () => {
  try {
    const response = await axiosPublic.post(
      '/api/users/logout',
      {},
      {
        withCredentials: true,
      }
    )
    return response.data
  } catch (error) {
    throw error
  } finally {
    clearAccessToken()
  }
}

const userService = {
  register,
  login,
  logout,
}

export default userService
