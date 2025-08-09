import { Search, BookOpenText, FileText, Calendar } from 'lucide-react'
import { ChalkboardTeacher } from 'phosphor-react'
import axiosPrivate from '../api/axiosPrivate.js'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { getAcademicYears } from '../utils/noteUtils.js'

function NotesSearchBar({
  searchBarTitle,
  apiRoute,
  setNotes,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  setError,
  loading = false,
  setLoading,
  setHasMore = () => {},
}) {
  const { title, courseCode, academicYear, instructor } = searchQuery
  const { isLoading } = useSelector((state) => state.user)

  const handleChangeSearchQuery = (e) => {
    setSearchQuery((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSearch = async (e = null) => {
    if (e) e.preventDefault()
    if (loading || isLoading) return
    setLoading(true)
    try {
      const response = await axiosPrivate.get(apiRoute, {
        params: {
          ...(title.trim() && { title: title.trim() }),
          ...(courseCode.trim() && { courseCode: courseCode.trim() }),
          ...(academicYear.trim() && {
            academicYear: academicYear.trim(),
          }),
          ...(instructor.trim() && { instructor: instructor.trim() }),
          sortBy,
        },
      })
      setNotes(response.data.notes)
      setHasMore(response.data.hasMore)
      setError(false)
    } catch (error) {
      setNotes([])
      setHasMore(false)
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
      academicYear: '',
      instructor: '',
    })
    if (sortBy !== 'createdAt') {
      // Changing sortBy by triggers a re-fetch through the useEffect
      setSortBy('createdAt')
    } else {
      // If sortBy isn't changed, we need to manually re-fetch
      setLoading(true)
      try {
        const response = await axiosPrivate.get(apiRoute)
        setNotes(response.data.notes)
        setHasMore(response.data.hasMore)
        setError(false)
      } catch (error) {
        setNotes([])
        setHasMore(false)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
  }

  const didMountRef = useRef(false)

  useEffect(() => {
    if (didMountRef.current) {
      handleSearch()
    } else {
      didMountRef.current = true
    }
  }, [sortBy])

  return (
    <div className="bg-blue-800 mb-6 rounded-lg px-4 py-10 sm:py-12">
      <form
        className="max-w-5xl mx-auto space-y-6"
        onSubmit={handleSearch}
      >
        <h2 className="text-white text-3xl font-heading font-bold text-center">
          {searchBarTitle}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-body">
          {/* Title */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <FileText className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleChangeSearchQuery}
              disabled={loading || isLoading}
              placeholder="Search by title"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>
          {/* Course Code */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <BookOpenText className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="courseCode"
              name="courseCode"
              value={courseCode}
              onChange={handleChangeSearchQuery}
              disabled={loading || isLoading}
              placeholder="Search by course code"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>
          {/* Academic Year */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <Calendar className="w-5 h-5 text-gray-400 mr-1 shrink-0" />
            <select
              id="academicYear"
              name="academicYear"
              value={academicYear}
              onChange={handleChangeSearchQuery}
              disabled={loading || isLoading}
              className={`flex-1 bg-transparent outline-none text-sm ${
                !academicYear?.trim() ? 'text-gray-400' : 'text-gray-800'
              } w-full border-none`}
            >
              <option value="">Search by academic year</option>
              {getAcademicYears().map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <ChalkboardTeacher
              size={20} // same visual size as w-5 h-5
              weight="regular" // not bold, to match Lucide's 2px stroke
              className="text-gray-400 mr-2 shrink-0"
            />
            <input
              type="text"
              id="instructor"
              name="instructor"
              value={instructor}
              onChange={handleChangeSearchQuery}
              disabled={loading || isLoading}
              placeholder="Search by instructor"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>
        </div>

        <div className="mt-4 font-body flex flex-wrap justify-center gap-4">
          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center bg-white text-blue-800 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 transition shadow-sm"
            disabled={loading || isLoading}
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
            <label
              htmlFor="sortBy"
              className="text-sm text-gray-600 mr-2 whitespace-nowrap"
            >
              Sort by:
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disabled={loading || isLoading}
              className="text-sm bg-transparent outline-none text-gray-800"
            >
              <option value="createdAt">Most Recent</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-white/80 hover:text-white underline font-medium transition whitespace-nowrap"
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
