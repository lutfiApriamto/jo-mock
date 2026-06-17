import { useLocation, NavLink } from 'react-router-dom'
import { FaAngleRight } from 'react-icons/fa'

export default function AdminBreadcrumb() {
  const { pathname } = useLocation()
  const segs = pathname.split('/').filter(Boolean)

  let crumbs = []

  if (segs.length <= 1) {
    crumbs = [{ label: 'Dashboard' }]
  } else if (segs[1] === 'users') {
    crumbs = [{ label: 'Dashboard', to: '/admin' }, { label: 'Users' }]
  } else if (segs[1] === 'projects') {
    crumbs = [{ label: 'Dashboard', to: '/admin' }, { label: 'Projects' }]
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
