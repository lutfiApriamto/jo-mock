import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { DOCS_FLAT } from '@/shared/constants/docsConfig'

export default function DocsPager() {
  const { pathname } = useLocation()
  const idx = DOCS_FLAT.findIndex(item => item.to === pathname)
  const prev = idx > 0 ? DOCS_FLAT[idx - 1] : null
  const next = idx < DOCS_FLAT.length - 1 ? DOCS_FLAT[idx + 1] : null

  return (
    <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
      {prev ? (
        <Link
          to={prev.to}
          className="flex items-center gap-2 text-sm font-medium
            text-muted-foreground hover:text-brand-primary transition-colors group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">
              Previous
            </span>
            {prev.label}
          </div>
        </Link>
      ) : <div />}

      {next ? (
        <Link
          to={next.to}
          className="flex items-center gap-2 text-sm font-medium text-right
            text-muted-foreground hover:text-brand-primary transition-colors group"
        >
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">
              Next
            </span>
            {next.label}
          </div>
          <FaArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ) : <div />}
    </div>
  )
}
