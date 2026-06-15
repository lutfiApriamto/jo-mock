import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'

export default function PrivacyPolicyPage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Privacy Policy
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
        Last updated: June 2026
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      <h2 id="intro" className={H2}>Introduction</h2>
      <p className={P}>
        JO-MOCK ("we", "our", or "us") is committed to protecting the privacy of our users.
        This Privacy Policy explains what data we collect, how we use it, and what rights you have
        over your data.
      </p>
      <p className={P}>
        By using JO-MOCK, you agree to the collection and use of information as described in this policy.
        If you do not agree, please discontinue use of the service.
      </p>

      <h2 id="we-collect" className={H2}>Information We Collect</h2>
      <p className={P}>We collect the following categories of data:</p>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li className={LI}>
          <strong className="font-semibold text-foreground">Account information</strong> — your name, email address,
          and hashed password provided during registration.
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Project data</strong> — all projects, folders, endpoints,
          and response definitions you create within the platform.
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Usage data</strong> — API hit counts for your mock
          server requests, used to track quota usage. We do not log request payloads or response bodies.
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Session data</strong> — authentication tokens
          (stored in httpOnly cookies) to maintain login sessions.
        </li>
      </ul>
      <p className={P}>
        We do not collect payment information, location data, or device fingerprints. We do not
        use third-party analytics or advertising trackers.
      </p>

      <h2 id="how-we-use" className={H2}>How We Use Your Data</h2>
      <p className={P}>Data collected is used exclusively to:</p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Provide and operate the JO-MOCK platform and mock server</li>
        <li className={LI}>Send transactional emails (invitation links, password resets, Change Request notifications)</li>
        <li className={LI}>Track and enforce API quota limits per account</li>
        <li className={LI}>Maintain audit trails within your own projects (version history, CR history)</li>
      </ul>
      <p className={P}>
        We do not sell, rent, or share your data with third parties for marketing or advertising purposes.
      </p>

      <h2 id="retention" className={H2}>Data Retention</h2>
      <p className={P}>
        Your account and all associated project data are retained for as long as your account is active.
        If you delete your account, all personal data is permanently removed from our systems within 30 days.
      </p>
      <p className={P}>
        Backup snapshots may retain data for up to 90 days after deletion. These are not accessible
        to other users and are automatically purged on a rolling schedule.
      </p>

      <h2 id="your-rights" className={H2}>Your Rights</h2>
      <p className={P}>You have the right to:</p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Access a copy of the personal data we hold about you</li>
        <li className={LI}>Request correction of inaccurate information</li>
        <li className={LI}>Request deletion of your account and all associated data</li>
        <li className={LI}>Regenerate or revoke your API key at any time from your Profile page</li>
      </ul>
      <p className={P}>
        To exercise any of these rights, contact us at the email address below.
      </p>

      <h2 id="contact" className={H2}>Contact</h2>
      <p className={P}>
        For any privacy-related questions or requests, contact us at:
      </p>
      <p className="text-sm sm:text-base text-foreground font-medium mb-6">
        lutfiapriamto12@gmail.com
      </p>

      <DocsPager />
    </article>
  )
}
