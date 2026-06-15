import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  FaArrowRight, FaCircleNotch,
  FaSun, FaMoon, FaEnvelope, FaArrowLeft,
} from 'react-icons/fa'
import { useTheme } from '@/context/ThemeContext'
import { forgotPassword as apiForgotPassword } from '@/features/auth/services/authService'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
})

const inputCls = (err) =>
  [
    'w-full px-3.5 py-[10px] rounded-xl text-sm text-foreground',
    'bg-background border placeholder:text-muted-foreground/30',
    'transition-all duration-150 focus:outline-none focus:ring-2',
    err
      ? 'border-status-danger/40 focus:ring-status-danger/10 focus:border-status-danger/40'
      : 'border-border/60 focus:ring-brand-primary/15 focus:border-brand-primary/50',
  ].join(' ')

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const { theme, toggleTheme } = useTheme()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched' })

  const isDark = theme === 'dark'
  const logo   = isDark ? '/jomock-dark.svg' : '/jomock-light.svg'

  const onSubmit = async (data) => {
    const tid = toast.loading('Sending reset link…')
    try {
      // authService.forgotPassword(email) → POST { email } — wraps string ke object sendiri
      await apiForgotPassword(data.email)
      setSentEmail(data.email)
      setSubmitted(true)
      toast.success('Reset link sent!', { id: tid })
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.'
      toast.error(msg, { id: tid })
    }
  }

  const gradientStyle = {
    backgroundColor: isDark ? '#100E18' : '#F7F7FB',
    backgroundImage: isDark
      ? 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.30), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.18), transparent 60%)'
      : 'radial-gradient(circle 650px at 8% 0%, rgba(108,92,231,0.14), transparent 60%), radial-gradient(circle 550px at 92% 100%, rgba(108,92,231,0.08), transparent 60%)',
  }

  const cardStyle = {
    backgroundColor: isDark ? '#1B1828' : '#F4F3FB',
    boxShadow: isDark
      ? '0 24px 64px rgba(0,0,0,0.50), 0 0 0 1px rgba(108,92,231,0.10)'
      : '0 16px 48px rgba(0,0,0,0.09), 0 0 0 1px rgba(108,92,231,0.07)',
  }

  return (
    <div className="min-h-screen flex flex-col" style={gradientStyle}>

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

      {/* ── Card ── */}
      <main className="flex-1 flex items-center justify-center px-5 py-8 sm:py-12">
        <div
          className="w-full max-w-[420px] rounded-2xl border border-border/40
            px-7 sm:px-9 pt-8 pb-7"
          style={cardStyle}
        >
          {/* Logo inside card */}
          <div className="flex items-center gap-2 mb-6">
            <img src={logo} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />
            <span className="font-heading font-semibold text-[13px] tracking-tight text-foreground/60">
              JO-MOCK
            </span>
          </div>

          {submitted ? (
            /* ── Success state ── */
            <div>
              {/* Email icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  backgroundColor: isDark ? 'rgba(108,92,231,0.15)' : 'rgba(108,92,231,0.10)',
                }}
              >
                <FaEnvelope size={20} style={{ color: 'var(--color-brand-primary)' }} />
              </div>

              <h1 className="font-heading font-bold text-[22px] sm:text-[24px]
                text-foreground tracking-tight leading-snug mb-1">
                Check your inbox
              </h1>
              <p className="text-[13px] text-muted-foreground mb-2">
                We sent a reset link to
              </p>
              <p className="text-[13.5px] font-semibold text-foreground mb-5 break-all">
                {sentEmail}
              </p>
              <p className="text-[12.5px] text-muted-foreground/75 leading-relaxed mb-7">
                The link expires in <span className="text-foreground/80 font-medium">1 hour</span>.
                If you don't see it, check your spam folder.
              </p>

              {/* Resend */}
              <button
                onClick={() => setSubmitted(false)}
                className="w-full py-[11px] rounded-xl
                  border border-border/60 bg-transparent
                  text-sm text-foreground/75 font-medium
                  hover:border-brand-primary/40 hover:text-foreground
                  transition-all duration-150 mb-4"
              >
                Didn't receive it? Try again
              </button>

              {/* Back to login */}
              <div className="pt-4 border-t border-border/40">
                <p className="text-[13px] text-muted-foreground text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-brand-primary font-semibold
                      hover:opacity-75 transition-opacity duration-150"
                  >
                    <FaArrowLeft size={11} />
                    Back to log in
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* ── Form state ── */
            <div>
              <h1 className="font-heading font-bold text-[22px] sm:text-[24px]
                text-foreground tracking-tight leading-snug">
                Forgot password?
              </h1>
              <p className="text-[13px] text-muted-foreground mt-1 mb-7">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-[14px]">

                <div className="space-y-1.5">
                  <label className="block text-[12.5px] font-medium text-foreground/65">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputCls(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="text-[11.5px] text-status-danger leading-snug">
                      {errors.email.message}
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
                        Sending…
                      </>
                    ) : (
                      <>
                        Send reset link
                        <FaArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Back to login */}
              <div className="mt-6 pt-5 border-t border-border/40">
                <p className="text-[13px] text-muted-foreground text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-brand-primary font-semibold
                      hover:opacity-75 transition-opacity duration-150"
                  >
                    <FaArrowLeft size={11} />
                    Back to log in
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
