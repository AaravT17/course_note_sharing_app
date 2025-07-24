import axios from 'axios'
import store from '../app/store.js'
import { resetUser, setError } from '../features/user/userSlice.js'
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './tokenManager.js'

const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_URL || '',
})

axiosPrivate.defaults.withCredentials = true

axiosPrivate.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}
    if (!config.headers['Authorization']) {
      const accessToken = getAccessToken()
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }
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
      !error.config._isRetry
    ) {
      let message = ''
      if (
        error.response.data &&
        typeof error.response.data.message === 'string'
      ) {
        message = error.response.data.message.trim()
      } else if (
        error.response.data instanceof Blob &&
        error.response.data.type === 'application/json'
      ) {
        try {
          const text = await error.response.data.text()
          const parsedData = JSON.parse(text)
          message = parsedData.message?.trim() || ''
        } catch (_) {}
      }
      if (message.startsWith('Unauthorized')) {
        error.config._isRetry = true
        try {
          const refreshResponse = await axios.post(
            '/api/users/auth/refresh',
            {},
            { withCredentials: true }
          )
          setAccessToken(refreshResponse.data.accessToken)
          error.config.headers['Authorization'] = `Bearer ${getAccessToken()}`
          return axiosPrivate(error.config)
        } catch (refreshError) {
          if (error.config.skipFailedRefreshHandling) {
            return Promise.reject(refreshError)
          }
          try {
            await axios.post(
              '/api/users/auth/logout',
              {},
              { withCredentials: true }
            )
          } catch (logoutError) {}
          store.dispatch(resetUser())
          clearAccessToken()
          store.dispatch(setError(true))
          return Promise.reject(refreshError)
        }
      } else {
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosPrivate
