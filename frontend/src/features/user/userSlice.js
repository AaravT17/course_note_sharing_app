import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userService from './userService.js'

const initialState = {
  user: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  message: '',
}

export const register = createAsyncThunk(
  'user/register',
  async (userData, thunkAPI) => {
    try {
      return await userService.register(userData)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const login = createAsyncThunk(
  'user/login',
  async (userData, thunkAPI) => {
    try {
      return await userService.login(userData)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const logout = createAsyncThunk('user/logout', async (_, thunkAPI) => {
  try {
    return await userService.logout()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false
      state.isSuccess = false
      state.isLoading = false
      state.message = ''
    },
    setUser: (state, action) => {
      state.user = action.payload
    },
    resetUser: (state) => {
      state.user = null
    },
    setError: (state, action) => {
      state.isError = action.payload
    },
    setRecentlyViewedNotes: (state, action) => {
      state.user = {
        ...state.user,
        recentlyViewedNotes: action.payload,
      }
    },
    setLikedAndDislikedNotes: (state, action) => {
      state.user = {
        ...state.user,
        likedNotesDisplay: action.payload.likedNotesDisplay,
        likedNotes: action.payload.likedNotes,
        dislikedNotes: action.payload.dislikedNotes,
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
      })
  },
})

export const {
  reset,
  setUser,
  resetUser,
  setError,
  setRecentlyViewedNotes,
  setLikedAndDislikedNotes,
} = userSlice.actions
export default userSlice.reducer
