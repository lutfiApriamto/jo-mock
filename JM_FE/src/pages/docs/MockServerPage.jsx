import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'
const PRE = 'bg-bg-surface border border-border rounded-xl p-4 overflow-x-auto mb-6'
const CODE = 'text-[13px] font-mono text-foreground/90 leading-relaxed'

export default function MockServerPage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Mock Server
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        The mock server is the engine that makes your defined endpoints available as real, consumable HTTP endpoints.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      <h2 id="overview" className={H2}>Overview</h2>
      <p className={P}>
        Every endpoint you define in JO-MOCK is instantly available on the mock server — no deployment
        or restart needed. The server is <strong className="font-semibold text-foreground">fully stateless</strong>:
        it reads your endpoint definition and returns the configured response. Requests that mutate state
        (POST, PUT, PATCH, DELETE) do not actually persist any data.
      </p>
      <p className={P}>
        CORS is managed on the platform side, so your frontend app can make requests directly to the
        mock server from any origin without additional headers or proxy configuration.
      </p>

      <h2 id="url-format" className={H2}>URL Format</h2>
      <p className={P}>All mock requests follow this structure:</p>
      <pre className={PRE}>
        <code className={CODE}>{`https://api.jomock.app/mock/{project-slug}/{endpoint-path}`}</code>
      </pre>
      <p className={P}>For example, if your project slug is <code className={IC}>ecommerce-api</code> and your endpoint path is <code className={IC}>/products</code>:</p>
      <pre className={PRE}>
        <code className={CODE}>{`GET https://api.jomock.app/mock/ecommerce-api/products`}</code>
      </pre>
      <p className={P}>
        You can find your project slug on the project dashboard page. It's displayed in the URL and
        in the project settings.
      </p>

      <h2 id="authentication" className={H2}>Authentication</h2>
      <p className={P}>
        All requests to the mock server require authentication via your personal API key. Pass it
        in the <code className={IC}>Authorization</code> header as a Bearer token:
      </p>
      <pre className={PRE}>
        <code className={CODE}>{`GET https://api.jomock.app/mock/my-project/users
Authorization: Bearer jm_your_api_key_here`}</code>
      </pre>
      <p className={P}>
        Your API key is available on your <strong className="font-semibold text-foreground">Profile</strong> page.
        You can regenerate it at any time — regenerating immediately invalidates the old key.
      </p>
      <p className={P}>
        In your frontend app, store this key in an environment variable and never commit it to your repository:
      </p>
      <pre className={PRE}>
        <code className={CODE}>{`// .env
VITE_JOMOCK_KEY=jm_your_api_key_here

// axios.js
const api = axios.create({
  baseURL: 'https://api.jomock.app/mock/my-project',
  headers: {
    Authorization: \`Bearer \${import.meta.env.VITE_JOMOCK_KEY}\`,
  },
})`}</code>
      </pre>

      <div className="bg-status-warning/5 border border-status-warning/20 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-semibold">Quota:</strong> Each account has a lifetime quota of
          10,000 API hits. This resets or is adjusted by the platform administrator. You can view
          your remaining quota on the Profile page.
        </p>
      </div>

      <h2 id="dynamic-params" className={H2}>Dynamic Path Parameters</h2>
      <p className={P}>
        Endpoints with dynamic segments like <code className={IC}>/users/:id</code> match any value
        in that position. The <code className={IC}>:id</code> segment is purely structural —
        the mock server ignores the actual value and returns your configured response regardless.
      </p>
      <pre className={PRE}>
        <code className={CODE}>{`# All of these match /users/:id and return the same response
GET /mock/my-project/users/1
GET /mock/my-project/users/usr_abc123
GET /mock/my-project/users/00000000-0000-0000-0000-000000000001`}</code>
      </pre>
      <p className={P}>
        When both a static and dynamic path exist at the same level, the static path always takes priority:
      </p>
      <pre className={PRE}>
        <code className={CODE}>{`# Static path takes precedence
GET /users/me    → matches /users/me  (not /users/:id)
GET /users/123   → matches /users/:id`}</code>
      </pre>

      <h2 id="validation" className={H2}>Request Validation</h2>
      <p className={P}>
        If you've defined a Request Schema for an endpoint, the mock server validates incoming
        request bodies against it. An invalid body returns a <code className={IC}>400 Bad Request</code> automatically:
      </p>
      <pre className={PRE}>
        <code className={CODE}>{`// 400 response example
{
  "success": false,
  "message": "Request body validation failed",
  "errors": [
    "\"email\" is required",
    "\"name\" must be a string"
  ]
}`}</code>
      </pre>
      <p className={P}>
        This validation happens before the mock response is returned, helping frontend devs
        catch integration mismatches early.
      </p>

      <h2 id="toggle" className={H2}>Per-user Response Toggle</h2>
      <p className={P}>
        Each user can independently choose which response scenario is active for any given endpoint.
        This toggle is <strong className="font-semibold text-foreground">per-user</strong> — switching
        your active scenario has no effect on your teammates.
      </p>
      <p className={P}>
        For example, a frontend developer testing the error state of a form can toggle the
        endpoint to return a <code className={IC}>400</code> response, while another developer
        on the same project continues receiving the <code className={IC}>200</code> success response.
      </p>

      <DocsPager />
    </article>
  )
}
