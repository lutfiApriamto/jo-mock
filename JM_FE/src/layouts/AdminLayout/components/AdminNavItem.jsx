import { NavLink } from 'react-router-dom'

export default function AdminNavItem({ to, icon, label, collapsed }) {
  return (
    <NavLink to={to} end={to === '/admin'} className="block">
      {({ isActive }) => (
        <div
          title={collapsed ? label : undefined}
          className={[
            'flex items-center gap-3 px-2.5 py-[9px] rounded-lg',
            'cursor-pointer overflow-hidden whitespace-nowrap',
            'transition-all duration-150',
            isActive
              ? 'bg-brand-primary/10 text-brand-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-bg-surface',
          ].join(' ')}
        >
          <span className="text-[15px] shrink-0">{icon}</span>
          <span
            className="text-[13px] font-medium flex-1 transition-opacity duration-200"
            style={{ opacity: collapsed ? 0 : 1 }}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  )
}
