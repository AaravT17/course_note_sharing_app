import axiosPrivate from '../api/axiosPrivate.js'

const getBrowseNotes = async () => {
  try {
    const response = await axiosPrivate.get('/api/notes')
    return {
      notes: response.data.notes,
      hasMore: response.data.hasMore,
      error: false,
    }
  } catch (error) {
    return { notes: [], hasMore: false, error: true }
  }
}

const getMyNotes = async () => {
  try {
    const response = await axiosPrivate.get('/api/users/me/notes')
    return {
      notes: response.data.notes,
      hasMore: response.data.hasMore,
      error: false,
    }
  } catch (error) {
    return { notes: [], hasMore: false, error: true }
  }
}

const getLikedNotes = async () => {
  try {
    const response = await axiosPrivate.get('/api/users/me/notes/liked')
    return {
      notes: response.data.notes,
      hasMore: response.data.hasMore,
      error: false,
    }
  } catch (error) {
    return { notes: [], hasMore: false, error: true }
  }
}

export { getBrowseNotes, getMyNotes, getLikedNotes }
