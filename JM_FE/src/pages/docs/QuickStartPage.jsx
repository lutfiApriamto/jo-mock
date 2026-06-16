import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const H3 = 'font-heading font-semibold text-base text-foreground mt-6 mb-2 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'
const PRE = 'bg-bg-surface border border-border rounded-xl p-4 overflow-x-auto mb-6'
const CODE = 'text-[13px] font-mono text-foreground/90 leading-relaxed'

const Step = ({ n, id, title, children }) => (
  <div className="relative pl-10 mb-8">
    <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-brand-primary/10
      text-brand-primary text-xs font-bold flex items-center justify-center">
      {n}
    </div>
    <h3 id={id} className="font-heading font-semibold text-base text-foreground mb-3 scroll-mt-24">
      {title}
    </h3>
    {children}
  </div>
)

export default function QuickStartPage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Quick Start
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        Get your first mock endpoint up and running in under 5 minutes.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      {/* Prerequisites */}
      <h2 id="prerequisites" className={H2}>Prerequisites</h2>
      <p className={P}>No software installation required — JO-MOCK is entirely web-based. You only need:</p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>A modern browser (Chrome, Firefox, Edge, Safari)</li>
        <li className={LI}>An email address to register</li>
        <li className={LI}>An HTTP client to test the mock URL (curl, Postman, or Axios in your app)</li>
      </ul>

      {/* Step 1 */}
      <h2 className={H2}>Steps</h2>

      <Step n={1} id="create-account" title="Create an Account">
        <p className={P}>
          Head to the registration page and create your account with your email and a password.
          You'll receive a confirmation email if email verification is enabled on your platform.
        </p>
        <p className={P}>
          Once logged in, you'll land on your <strong className="font-semibold text-foreground">Dashboard</strong> — this
          is where all your projects live.
        </p>
      </Step>

      {/* Step 2 */}
      <Step n={2} id="create-project" title="Create a Project">
        <p className={P}>
          Click <strong className="font-semibold text-foreground">New Project</strong> on the dashboard.
          Give it a name — the platform automatically generates a unique slug from the name.
        </p>
        <p className={P}>
          The slug is important: it appears in every mock URL for this project. For example,
          a project named "Ecommerce API" might get the slug <code className={IC}>ecommerce-api</code>,
          and all mock URLs will start with <code className={IC}>/mock/ecommerce-api/...</code>.
        </p>
        <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-foreground">
            <strong className="font-semibold">Tip:</strong> You can invite team members to your project
            immediately after creating it. They'll receive an email invitation to join.
          </p>
        </div>
      </Step>

      {/* Step 3 */}
      <Step n={3} id="add-endpoint" title="Add an Endpoint">
        <p className={P}>
          Inside your project, click <strong className="font-semibold text-foreground">Add Endpoint</strong>.
          Fill in the following:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 mb-4">
          <li className={LI}><strong className="font-semibold text-foreground">Method</strong> — GET, POST, PUT, DELETE, or PATCH</li>
          <li className={LI}><strong className="font-semibold text-foreground">Path</strong> — e.g. <code className={IC}>/users</code> or <code className={IC}>/users/:id</code></li>
          <li className={LI}><strong className="font-semibold text-foreground">Response</strong> — Add at least one response scenario with a status code and JSON body</li>
        </ul>
        <p className={P}>
          Here's an example response body for a <code className={IC}>GET /users/:id</code> endpoint:
        </p>
        <pre className={PRE}>
          <code className={CODE}>{`{
  "id": "usr_01",
  "name": "Lutfi Apriamto",
  "email": "lutfi@example.com",
  "role": "admin",
  "createdAt": "2026-06-01T00:00:00.000Z"
}`}</code>
        </pre>
      </Step>

      {/* Step 4 */}
      <Step n={4} id="consume-url" title="Consume the Mock URL">
        <p className={P}>
          Once an endpoint is defined, it's immediately live. The URL format is:
        </p>
        <pre className={PRE}>
          <code className={CODE}>{`GET https://api.jomock.app/mock/{project-slug}/{endpoint-path}
Authorization: Bearer YOUR_API_KEY`}</code>
        </pre>
        <p className={P}>
          Your API key is available in your <strong className="font-semibold text-foreground">Profile → API Key</strong> page.
          All requests to the mock server must include this key in the Authorization header.
        </p>
        <p className={P}>
          That's it — your frontend app can now make real HTTP requests to this URL and receive the
          JSON response you defined. Just set this as your base URL in development.
        </p>
      </Step>

      {/* Next Steps */}
      <h2 id="next-steps" className={H2}>Next Steps</h2>
      <p className={P}>You've got a working mock endpoint. Here's what to explore next:</p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>Add more endpoints and organize them with folders</li>
        <li className={LI}>Define multiple response scenarios per endpoint to simulate error states</li>
        <li className={LI}>Invite your team and assign roles</li>
        <li className={LI}>Use the Code Generator to produce ready-to-use Axios code</li>
      </ul>

      <DocsPager />
    </article>
  )
}
