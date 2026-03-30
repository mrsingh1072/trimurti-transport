import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for API data fetching
 * Handles loading, error, and data states automatically
 * 
 * Usage:
 * const { data, loading, error } = useApi(getDashboardStats)
 */
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await apiFunction()
      setData(result)
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message || 'Failed to fetch data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Hook for multiple API calls with combined loading/error states
 * 
 * Usage:
 * const { data, loading, error } = useMultipleApi([
 *   { fn: getDashboardStats, key: 'stats' },
 *   { fn: getBookings, key: 'bookings' }
 * ])
 */
export const useMultipleApi = (calls, dependencies = []) => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const results = {}
        
        for (const call of calls) {
          try {
            results[call.key] = await call.fn()
          } catch (err) {
            console.error(`Error fetching ${call.key}:`, err)
            results[call.key] = null
          }
        }
        
        setData(results)
      } catch (err) {
        console.error('Multiple API Error:', err)
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, dependencies)

  return { data, loading, error }
}

/**
 * Hook for paginated API calls
 * 
 * Usage:
 * const { data, loading, page, next, prev } = usePaginatedApi(getBookings, 10)
 */
export const usePaginatedApi = (apiFunction, pageSize = 10) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await apiFunction()
        setData(Array.isArray(result) ? result : [])
      } catch (err) {
        console.error('Pagination API Error:', err)
        setError(err.message || 'Failed to fetch data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiFunction])

  const totalPages = Math.ceil(data.length / pageSize)
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize)

  return {
    data: paginatedData,
    loading,
    error,
    page,
    totalPages,
    next: () => setPage(p => Math.min(p + 1, totalPages)),
    prev: () => setPage(p => Math.max(p - 1, 1)),
    goToPage: (p) => setPage(Math.max(1, Math.min(p, totalPages)))
  }
}
