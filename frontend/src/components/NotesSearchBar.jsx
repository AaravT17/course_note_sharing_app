import { Search, BookOpenText, GraduationCap, Landmark } from 'lucide-react'
import axiosPrivate from '../api/axiosPrivate.js'
import { useState } from 'react'
import { useSelector } from 'react-redux'

function NotesSearchBar({
  searchBarTitle,
  apiRoute,
  setNotes,
  setError,
  loading = false,
  setLoading,
}) {
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    courseCode: '',
    university: '',
  })

  const { title, courseCode, university } = searchQuery
  const { isLoading } = useSelector((state) => state.user)

  const handleChange = (e) => {
    setSearchQuery((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (loading || isLoading) return
    setLoading(true)
    try {
      const response = await axiosPrivate.get(apiRoute, {
        params: {
          ...(title.trim() !== '' && { title: title.trim() }),
          ...(courseCode.trim() !== '' && { courseCode: courseCode.trim() }),
          ...(university.trim() !== '' && { university: university.trim() }),
        },
      })
      setNotes(response.data)
      setError(false)
    } catch (error) {
      setNotes([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = async (e) => {
    e.preventDefault()
    if (loading || isLoading) return
    setSearchQuery({
      title: '',
      courseCode: '',
      university: '',
    })
    setLoading(true)
    try {
      const response = await axiosPrivate.get(apiRoute)
      setNotes(response.data)
      setError(false)
    } catch (error) {
      setNotes([])
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-blue-800 mb-6 rounded-lg px-4 py-10 sm:py-12">
      <form
        className="max-w-5xl mx-auto space-y-6"
        onSubmit={handleSearch}
      >
        <h2 className="text-white text-3xl font-heading font-bold text-center">
          {searchBarTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 font-body">
          {/* Title */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <BookOpenText className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChange}
              disabled={loading || isLoading}
              placeholder="Search by title"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* Course Code */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={courseCode}
              onChange={handleChange}
              disabled={loading || isLoading}
              placeholder="Search by course code"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* University */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <Landmark className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="university"
              name="university"
              value={university}
              onChange={handleChange}
              disabled={loading || isLoading}
              placeholder="Search by university"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center bg-white text-blue-800 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 transition shadow-sm"
            disabled={
              loading ||
              isLoading ||
              (!title.trim() && !courseCode.trim() && !university.trim())
            }
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-white/80 hover:text-white underline font-medium transition"
            disabled={loading || isLoading}
          >
            Clear filters
          </button>
        </div>
      </form>
    </div>
  )
}

export default NotesSearchBar
