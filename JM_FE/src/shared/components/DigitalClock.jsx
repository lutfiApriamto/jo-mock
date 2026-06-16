import { useState, useEffect } from 'react'

export default function DigitalClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="font-mono text-[12px] text-muted-foreground tabular-nums select-none hidden sm:inline">
      {now.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  )
}
