import axiosPublic from '../../api/axiosPublic.js'

const register = async (userData) => {
  const response = await axiosPublic.post('/api/users/', userData)
  return response.data
}

const login = async (userData) => {
  const response = await axiosPublic.post('/api/users/login', userData, {
    withCredentials: true,
  })
  return response.data
}

const logout = async () => {
  const response = await axiosPublic.post(
    '/api/users/logout',
    {},
    {
      withCredentials: true,
    }
  )
  return response.data
}

const userService = {
  register,
  login,
  logout,
}

export default userService
