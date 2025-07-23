import { Search, BookOpenText, GraduationCap, Landmark } from 'lucide-react'
import axiosPrivate from '../api/axiosPrivate.js'
import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

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
  const { title, courseCode, university } = searchQuery
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
          ...(title.trim() !== '' && { title: title.trim() }),
          ...(courseCode.trim() !== '' && { courseCode: courseCode.trim() }),
          ...(university.trim() !== '' && { university: university.trim() }),
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
      university: '',
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

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto] gap-4 font-body">
          {/* Title */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <BookOpenText className="w-5 h-5 text-gray-400 mr-2" />
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
            <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
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
          {/* University */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-300">
            <Landmark className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              id="university"
              name="university"
              value={university}
              onChange={handleChangeSearchQuery}
              disabled={loading || isLoading}
              placeholder="Search by university"
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
            />
          </div>
          {/* Search Button */}
          <button
            type="submit"
            className="flex items-center justify-center bg-white text-blue-800 px-4 py-2 rounded-md font-semibold hover:bg-blue-100 transition shadow-sm"
            disabled={loading || isLoading}
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </button>
          {/* Sort By Dropdown */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm">
            <label
              htmlFor="sort"
              className="text-sm text-gray-600 mr-2 whitespace-nowrap"
            >
              Sort by:
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
              }}
              disabled={loading || isLoading}
              className="text-sm bg-transparent outline-none text-gray-800"
            >
              <option value="createdAt">Most Recent</option>
              <option value="likes">Most Liked</option>
            </select>
          </div>
          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center text-sm text-white/80 hover:text-white underline font-medium transition whitespace-nowrap"
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
