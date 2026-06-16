import { useLocation, NavLink } from 'react-router-dom'
import { FaAngleRight } from 'react-icons/fa'

export default function Breadcrumb() {
  const { pathname } = useLocation()
  const segs   = pathname.split('/').filter(Boolean)
  const second = segs[1]

  let crumbs = []

  if (!second || second === 'dashboard') {
    crumbs = [{ label: 'Projects' }]
  } else if (second === 'invitations') {
    crumbs = [{ label: 'Invitations' }]
  } else if (second === 'profile') {
    crumbs = [{ label: 'Profile' }]
  } else if (second === 'projects') {
    crumbs = [{ label: 'Projects', to: '/dashboard' }]
    if (segs[2]) crumbs.push({ label: 'Project' })
    if (segs[4]) crumbs.push({ label: 'Endpoint' })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <FaAngleRight size={9} className="text-muted-foreground/30 shrink-0" />
            )}
            {c.to ? (
              <NavLink
                to={c.to}
                className="text-[13px] text-muted-foreground hover:text-foreground
                  transition-colors duration-150 shrink-0"
              >
                {c.label}
              </NavLink>
            ) : (
              <span
                className={[
                  'text-[13px] truncate',
                  isLast ? 'font-medium text-foreground' : 'text-muted-foreground',
                ].join(' ')}
              >
                {c.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
