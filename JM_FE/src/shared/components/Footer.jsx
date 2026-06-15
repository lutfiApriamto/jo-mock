import { Link } from 'react-router-dom'
import { FaGithub, FaInstagram, FaLinkedin   } from "react-icons/fa";
import { useTheme } from '@/context/ThemeContext'

const PRODUCT_LINKS = [
  { label: 'Home',      to: '/'          },
  { label: 'Pricing',   to: '/pricing'   },
  { label: 'Changelog', to: '/changelog' },
]

const RESOURCE_LINKS = [
  { label: 'Documentation',   to: '/docs'    },
  { label: 'Privacy & Terms', to: '/privacy' },
]

const SOCIAL_LINKS = [
  {
    icon:  FaLinkedin,
    href:  'https://www.linkedin.com/in/lutfi-apriamto-3a9383312/',
    label: 'LinkedIn',
  },
  {
    icon:  FaInstagram ,
    href:  'https://www.instagram.com/lutfiamto/',
    label: 'Instagram',
  },
  {
    icon:  FaGithub,
    href:  'https://github.com/lutfiApriamto',
    label: 'GitHub',
  },
]

export default function Footer() {
  const { theme } = useTheme()
  const logoSrc = theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16">

        {/* Top: brand + nav columns */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-10 sm:gap-16 mb-10">

          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
              <img src={logoSrc} alt="JO-MOCK" className="w-7 h-7 rounded-[7px]" />
              <span className="font-heading font-bold text-sm tracking-tight text-foreground">
                JO-MOCK
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              API mocking for teams who ship fast.
            </p>
            <div className="flex items-center gap-2 mt-5">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                    border border-border text-muted-foreground
                    hover:text-foreground hover:bg-accent/60
                    transition-colors duration-150"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase
              text-foreground mb-4">
              Product
            </p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground
                      transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase
              text-foreground mb-4">
              Resources
            </p>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground
                      transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row
          items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JO-MOCK · Muhammad Lutfi Apriamto
          </p>
          <p className="text-xs text-muted-foreground">
            Built for developer teams.
          </p>
        </div>
      </div>
    </footer>
  )
}
