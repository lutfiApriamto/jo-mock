import { useState, useEffect } from 'react'
import { useLenis } from 'lenis/react'

export default function TableOfContents({ items = [] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const lenis = useLenis()

  useEffect(() => {
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-10% 0% -75% 0%', threshold: 0 }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  // Reset active when page changes (items array changes)
  useEffect(() => {
    setActiveId(items[0]?.id ?? '')
  }, [items])

  const handleClick = (id) => {
    lenis?.scrollTo(`#${id}`, { offset: -80 })
  }

  if (!items.length) return <div className="hidden xl:block w-52 shrink-0" />

  return (
    <aside className="hidden xl:block sticky top-14 w-52 shrink-0
      h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pl-6 pr-4">
      <p className="text-[10px] font-bold tracking-widest uppercase
        text-muted-foreground/50 mb-4">
        On this page
      </p>

      <ul className="space-y-2.5">
        {items.map(({ id, label, level = 2 }) => (
          <li key={id}>
            <button
              onClick={() => handleClick(id)}
              className={`text-left text-xs leading-relaxed w-full
                transition-colors duration-150
                ${level === 3 ? 'pl-3' : ''}
                ${activeId === id
                  ? 'text-brand-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
