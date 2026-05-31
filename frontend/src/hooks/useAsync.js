import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Run an async function and track {data, loading, error}, with built-in
 * protection against race conditions (stale responses from an earlier call
 * are ignored) and against setting state after unmount.
 *
 * @param {Function} asyncFn  async function returning the data
 * @param {Array}    deps     re-run when these change (like useEffect)
 * @param {Object}   options  { immediate = true, onSuccess, onError }
 * @returns {{ data, loading, error, refetch, setData }}
 */
export default function useAsync(asyncFn, deps = [], options = {}) {
  const { immediate = true, onSuccess, onError } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const mounted = useRef(true)
  const callId = useRef(0)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const run = useCallback(async (...args) => {
    const id = ++callId.current
    setLoading(true)
    setError(null)
    try {
      const result = await asyncFn(...args)
      // Ignore if a newer call started or the component unmounted.
      if (id === callId.current && mounted.current) {
        setData(result)
        onSuccess?.(result)
      }
      return result
    } catch (err) {
      if (id === callId.current && mounted.current) {
        setError(err)
        onError?.(err)
      }
      throw err
    } finally {
      if (id === callId.current && mounted.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (immediate) run().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: run, setData }
}
