import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  FaEye, FaEyeSlash,
  FaArrowRight, FaCircleNotch,
  FaSun, FaMoon,
} from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { login as apiLogin } from '@/features/auth/services/authService'
import useAuthStore from '@/stores/authStore'

const schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12.5px] font-medium text-foreground/65">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11.5px] text-status-danger leading-snug">{error}</p>
      )}
    </div>
  )
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-3 top-1/2 -translate-y-1/2
        text-muted-foreground/35 hover:text-muted-foreground/70
        transition-colors duration-150"
    >
      {show ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
    </button>
  )
}

const inputCls = (err) =>
  [
    'w-full px-3.5 py-[10px] rounded-xl text-sm text-foreground',
    'bg-background border placeholder:text-muted-foreground/30',
    'transition-all duration-150 focus:outline-none focus:ring-2',
    err
      ? 'border-status-danger/40 focus:ring-status-danger/10 focus:border-status-danger/40'
      : 'border-border/60 focus:ring-brand-primary/15 focus:border-brand-primary/50',
  ].join(' ')

export default function LoginPage() {
  const [showPw, setShowPw]  = useState(false)
  const navigate              = useNavigate()
  const [searchParams]        = useSearchParams()
  const { theme, toggleTheme } = useTheme()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })

  const isDark = theme === 'dark'
  const logo   = isDark ? '/jomock-dark.svg' : '/jomock-light.svg'

  const onSubmit = async (data) => {
    const tid = toast.loading('Signing in…')
    try {
      const res = await apiLogin({ email: data.email, password: data.password })
      const { accessToken, user } = res.data.data.data
      setAuth(user, accessToken)
      toast.success('Welcome back!', { id: tid })
      const redirectTo = searchParams.get('redirect')
      const dest = redirectTo?.startsWith('/') ? redirectTo : (user.role === 'superadmin' ? '/admin' : '/dashboard')
      navigate(dest)
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.'
      toast.error(msg, { id: tid })
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: isDark ? '#100E18' : '#F7F7FB',
        backgroundImage: isDark
          ? 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.30), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.18), transparent 60%)'
          : 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.14), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.08), transparent 60%)',
      }}
    >

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 sm:px-8 lg:px-12 py-5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
          />
          <span className="font-heading font-bold text-[17px] sm:text-lg tracking-tight text-foreground
            group-hover:text-brand-primary transition-colors duration-150">
            JO-MOCK
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full
            bg-bg-surface border border-border
            text-muted-foreground hover:text-foreground
            hover:border-brand-primary/40
            transition-all duration-200"
        >
          {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
        </button>
      </header>

      {/* ── Form card ── */}
      <main className="flex-1 flex items-center justify-center px-5 py-8 sm:py-12">
        <div
          className="w-full max-w-[420px] rounded-2xl border border-border/40
            px-7 sm:px-9 pt-8 pb-7"
          style={{
            backgroundColor: isDark ? '#1B1828' : '#F4F3FB',
            boxShadow: isDark
              ? '0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(108,92,231,0.10)'
              : '0 16px 48px rgba(0,0,0,0.09), 0 0 0 1px rgba(108,92,231,0.07)',
          }}
        >
          {/* Logo inside card */}
          <div className="flex items-center gap-2 mb-6">
            <img src={logo} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
            <span className="font-heading font-semibold text-[13px] tracking-tight text-foreground/60">
              JO-MOCK
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-bold text-[22px] sm:text-[24px]
            text-foreground tracking-tight leading-snug">
            Welcome back
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1 mb-7">
            Log in to continue to your dashboard.
          </p>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-[14px]">

            <Field label="Email address" error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputCls(!!errors.email)}
              />
            </Field>

            {/* Password — label row has inline "Forgot password?" link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-medium text-foreground/65">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-[12px] text-brand-primary hover:opacity-75 transition-opacity duration-150"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  className={inputCls(!!errors.password) + ' pr-10'}
                />
                <EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
              </div>
              {errors.password && (
                <p className="text-[11.5px] text-status-danger leading-snug">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2
                  py-[11px] rounded-xl
                  bg-brand-primary text-white text-sm font-semibold
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-opacity duration-150"
              >
                {isSubmitting ? (
                  <>
                    <FaCircleNotch size={13} className="animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Log in
                    <FaArrowRight size={12} />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Divider + Sign up */}
          <div className="mt-6 pt-5 border-t border-border/40">
            <p className="text-[13px] text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-brand-primary font-semibold
                  hover:opacity-75 transition-opacity duration-150"
              >
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}
