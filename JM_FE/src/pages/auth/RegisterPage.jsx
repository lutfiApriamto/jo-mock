import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  FaEye, FaEyeSlash, FaCheck,
  FaArrowRight, FaCircleNotch,
  FaSun, FaMoon,
} from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { register as apiRegister } from '@/features/auth/services/authService'

const schema = z.object({
  name: z
    .string()
    .min(2, 'At least 2 characters')
    .max(50, 'Max 50 characters'),
  email: z.string().email('Enter a valid email').max(100, 'Max 100 characters'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .max(72, 'Max 72 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/\d/, 'Needs a number')
    .regex(/[^A-Za-z0-9]/, 'Needs a special character'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords don't match",
})

const RULES = [
  { label: '8+ characters',     test: p => p.length >= 8 },
  { label: 'Uppercase (A–Z)',   test: p => /[A-Z]/.test(p) },
  { label: 'Lowercase (a–z)',   test: p => /[a-z]/.test(p) },
  { label: 'Number (0–9)',      test: p => /\d/.test(p) },
  { label: 'Special character', test: p => /[^A-Za-z0-9]/.test(p) },
]

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

export default function RegisterPage() {
  const [showPw, setShowPw]           = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate                      = useNavigate()
  const { theme, toggleTheme }        = useTheme()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })

  const password = watch('password') ?? ''
  const logo     = theme === 'dark' ? '/jomock-dark.svg' : '/jomock-light.svg'
  const isDark   = theme === 'dark'

  const onSubmit = async (data) => {
    const tid = toast.loading('Creating your account…')
    try {
      await apiRegister({ name: data.name, email: data.email, password: data.password })
      toast.success('Account created! Please log in.', { id: tid })
      navigate('/login')
    } catch (err) {
      // Format error backend: { errorStatus, errorType, errors: [{ message, code }] }
      const msg = err.response?.data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.'
      toast.error(msg, { id: tid })
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: isDark ? '#100E18' : '#F7F7FB',
        backgroundImage: isDark
          ? 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.30), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.18), transparent 60%)'
          : 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.14), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.08), transparent 60%)',
      }}
    >

      {/* ── Top bar (normal flow, NOT sticky) ── */}
      <header className="flex items-center justify-between
        px-5 sm:px-8 lg:px-12 py-5">
        {/* Logo + wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
        >
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

        {/* Theme toggle */}
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
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 object-contain"
            />
            <span className="font-heading font-semibold text-[13px] tracking-tight text-foreground/60">
              JO-MOCK
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-bold text-[22px] sm:text-[24px]
            text-foreground tracking-tight leading-snug">
            Create your account
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1 mb-7">
            Free during beta · no credit card required.
          </p>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-[14px]">

            <Field label="Full name" error={errors.name?.message}>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                placeholder="e.g. Muhammad Lutfi"
                className={inputCls(!!errors.name)}
              />
            </Field>

            <Field label="Email address" error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputCls(!!errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={inputCls(!!errors.password) + ' pr-10'}
                />
                <EyeToggle show={showPw} onToggle={() => setShowPw(v => !v)} />
              </div>

              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  {RULES.map(({ label, test }) => {
                    const ok = test(password)
                    return (
                      <div
                        key={label}
                        className="flex items-center gap-1.5 text-[11px] leading-none
                          transition-colors duration-200"
                        style={{ color: ok ? 'var(--color-status-success)' : undefined }}
                      >
                        <span
                          className="w-[13px] h-[13px] rounded-full border shrink-0
                            flex items-center justify-center transition-all duration-200"
                          style={ok
                            ? { background: 'var(--color-status-success)', borderColor: 'var(--color-status-success)' }
                            : { borderColor: 'rgba(162,155,200,0.25)', color: 'rgba(162,155,200,0.4)' }
                          }
                        >
                          {ok && <FaCheck size={6} color="#fff" />}
                        </span>
                        <span style={!ok ? { color: 'rgba(162,155,200,0.4)' } : undefined}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Field>

            <Field label="Confirm password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={inputCls(!!errors.confirmPassword) + ' pr-10'}
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              </div>
            </Field>

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
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <FaArrowRight size={12} />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Divider + Log in */}
          <div className="mt-6 pt-5 border-t border-border/40 space-y-3">
            <p className="text-[13px] text-muted-foreground text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-brand-primary font-semibold
                  hover:opacity-75 transition-opacity duration-150"
              >
                Log in
              </Link>
            </p>
            <p className="text-[11px] text-muted-foreground/35 text-center leading-relaxed">
              By signing up you agree to our{' '}
              <Link to="/docs/terms"
                className="underline underline-offset-2
                  hover:text-muted-foreground/55 transition-colors">
                Terms
              </Link>
              {' '}and{' '}
              <Link to="/docs/privacy-policy"
                className="underline underline-offset-2
                  hover:text-muted-foreground/55 transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}
