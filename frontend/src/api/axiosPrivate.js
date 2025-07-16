import axios from 'axios'
import { store } from '../app/store.js'
import { resetUser, setAccessToken } from '../features/user/userSlice.js'

const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '',
})

axiosPrivate.defaults.withCredentials = true

axiosPrivate.interceptors.request.use(
  (config) => {
    const accessToken =
      store.getState().user.user && store.getState().user.user.accessToken
    if (accessToken) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data &&
      error.response.data.message &&
      error.response.data.message.trim().startsWith('Unauthorized') &&
      !error.config._isRetry
    ) {
      error.config._isRetry = true

      try {
        const refreshResponse = await axios.post(
          '/api/users/auth/refresh',
          {},
          { withCredentials: true }
        )
        store.dispatch(setAccessToken(refreshResponse.data.accessToken))
        return axiosPrivate(error.config)
      } catch (refreshError) {
        try {
          await axios.post(
            '/api/users/auth/logout',
            {},
            { withCredentials: true }
          )
        } catch (logoutError) {}
        store.dispatch(resetUser())
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosPrivate
