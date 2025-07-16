import axiosPrivate from '../../api/axiosPrivate.js'
import axiosPublic from '../../api/axiosPublic.js'
import { store } from '../../app/store.js'

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

const updateRecentNotes = async (note) => {
  const recentNotes = store.getState().user.user.recentNotes || []
  const updatedNotes = [
    note,
    ...recentNotes.filter(
      (recentNote) => recentNote._id.toString() !== note._id.toString()
    ),
  ].slice(0, 10)

  const response = await axiosPrivate.put('/api/users/me', {
    recentlyViewedNotes: updatedNotes.map((note) => note._id),
  })

  return response.data
}

const userService = {
  register,
  login,
  logout,
  updateRecentNotes,
}

export default userService
