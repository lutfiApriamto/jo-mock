import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'

export default function TermsPage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Terms & Conditions
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
        Last updated: June 2026
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      <h2 id="acceptance" className={H2}>Acceptance of Terms</h2>
      <p className={P}>
        By accessing or using JO-MOCK (the "Service"), you agree to be bound by these Terms & Conditions.
        If you are using the Service on behalf of an organization, you agree to these terms on the
        organization's behalf.
      </p>
      <p className={P}>
        We reserve the right to update these terms at any time. Continued use of the Service after
        changes are posted constitutes acceptance of the updated terms.
      </p>

      <h2 id="beta" className={H2}>Beta Service</h2>
      <p className={P}>
        JO-MOCK is currently in <strong className="font-semibold text-foreground">open beta</strong>. This means:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>The Service is provided free of charge during the beta period</li>
        <li className={LI}>Features may change, be added, or be removed without prior notice</li>
        <li className={LI}>The Service may experience downtime or data loss — do not use it as the sole source of truth for critical production systems</li>
        <li className={LI}>When the beta period ends, a paid pricing model may be introduced</li>
      </ul>
      <p className={P}>
        Users who join during the beta period may receive special consideration when paid plans are introduced,
        but this is not guaranteed.
      </p>

      <h2 id="account" className={H2}>Account Responsibilities</h2>
      <p className={P}>
        You are responsible for:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Maintaining the security of your account credentials and API key</li>
        <li className={LI}>All activity that occurs under your account</li>
        <li className={LI}>Promptly notifying us of any unauthorized access to your account</li>
        <li className={LI}>Ensuring the data you store on the platform complies with applicable laws</li>
      </ul>
      <p className={P}>
        You must not share your account credentials with others. Each person on your team should
        have their own account and be invited to projects individually.
      </p>

      <h2 id="prohibited" className={H2}>Prohibited Uses</h2>
      <p className={P}>You agree not to use JO-MOCK to:</p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Store, transmit, or expose personally identifiable information of others without consent</li>
        <li className={LI}>Attempt to reverse-engineer, abuse, or circumvent any platform rate limits or quotas</li>
        <li className={LI}>Use the mock server to serve as a persistent backend for production systems</li>
        <li className={LI}>Engage in any activity that damages, disrupts, or overloads the platform</li>
        <li className={LI}>Violate any applicable local, national, or international laws</li>
      </ul>
      <p className={P}>
        Accounts found in violation of these terms may be suspended or permanently terminated
        without prior notice.
      </p>

      <h2 id="liability" className={H2}>Limitation of Liability</h2>
      <p className={P}>
        JO-MOCK is provided "as is" without warranties of any kind, express or implied.
        We do not guarantee that the Service will be uninterrupted, error-free, or free of
        data loss.
      </p>
      <p className={P}>
        To the maximum extent permitted by law, JO-MOCK and its developers shall not be liable
        for any indirect, incidental, special, consequential, or punitive damages arising from
        your use of — or inability to use — the Service.
      </p>

      <h2 id="contact" className={H2}>Contact</h2>
      <p className={P}>
        Questions about these terms? Reach out at:
      </p>
      <p className="text-sm sm:text-base text-foreground font-medium mb-6">
        lutfiapriamto12@gmail.com
      </p>

      <DocsPager />
    </article>
  )
}
