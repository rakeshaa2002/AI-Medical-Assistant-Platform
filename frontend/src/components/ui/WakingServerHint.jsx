import { useEffect, useState } from 'react'

// Free-tier backends sleep when idle and take about a minute to wake. After a
// few seconds of waiting, say so instead of only spinning.
export default function WakingServerHint({ active, delay = 4000 }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(false)
    if (!active) return undefined
    const timer = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timer)
  }, [active, delay])

  if (!show) return null
  return (
    <p role="status" className="text-center text-xs text-slate-500 dark:text-slate-400">
      Waking up the server… free hosting can take up to a minute.
    </p>
  )
}
