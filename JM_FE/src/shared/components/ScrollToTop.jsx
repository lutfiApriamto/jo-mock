import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useLenis } from 'lenis/react'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [pathname, lenis])

  return <Outlet />
}
