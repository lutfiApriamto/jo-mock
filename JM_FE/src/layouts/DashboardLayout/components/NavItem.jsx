import { NavLink } from 'react-router-dom'

export default function NavItem({ to, icon, label, badge, collapsed }) {
  return (
    <NavLink to={to} end={to === '/dashboard'} className="block">
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

          {badge > 0 && (
            <span
              className="ml-auto bg-brand-primary text-white text-[10px] font-semibold
                rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0
                transition-opacity duration-200"
              style={{ opacity: collapsed ? 0 : 1 }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  )
}
