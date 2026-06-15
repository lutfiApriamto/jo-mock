import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'
const PRE = 'bg-bg-surface border border-border rounded-xl p-4 overflow-x-auto mb-6'
const CODE = 'text-[13px] font-mono text-foreground/90 leading-relaxed'

const MethodBadge = ({ method }) => {
  const colors = {
    GET:    'bg-status-success/10 text-status-success border-status-success/20',
    POST:   'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    PUT:    'bg-status-warning/10 text-status-warning border-status-warning/20',
    DELETE: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    PATCH:  'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${colors[method] ?? ''}`}>
      {method}
    </span>
  )
}

export default function EndpointsGuidePage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Defining Endpoints
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        Endpoints are the core of every project — they define what your API looks like
        before any backend code exists.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      <h2 id="overview" className={H2}>Overview</h2>
      <p className={P}>
        An endpoint in JO-MOCK is a combination of an HTTP method and a URL path. You can optionally
        define what request body it expects (Request Schema) and what response it returns
        (Response Scenarios).
      </p>
      <p className={P}>
        Once created, the endpoint is immediately reachable at its mock URL — no further setup needed.
      </p>

      <h2 id="define-endpoint" className={H2}>Defining an Endpoint</h2>
      <p className={P}>To create an endpoint, you need to provide:</p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}>
          <strong className="font-semibold text-foreground">Method</strong> — one of{' '}
          {['GET','POST','PUT','DELETE','PATCH'].map(m => (
            <span key={m} className="inline-flex mr-1"><MethodBadge method={m} /></span>
          ))}
        </li>
        <li className={LI}>
          <strong className="font-semibold text-foreground">Path</strong> — the URL path relative to your project slug.
          Must start with <code className={IC}>/</code>. Supports dynamic segments like <code className={IC}>:id</code>.
        </li>
      </ul>

      <p className={P}>Example paths:</p>
      <pre className={PRE}>
        <code className={CODE}>{`/users
/users/:id
/products/:productId/reviews
/orders/:orderId/items/:itemId`}</code>
      </pre>

      <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-semibold">Path priority:</strong> When a request comes in, static path segments
          always take precedence over dynamic ones. So <code className={IC}>/users/me</code> will always match
          the static endpoint, not <code className={IC}>/users/:id</code>.
        </p>
      </div>

      <h2 id="request-schema" className={H2}>Request Schema</h2>
      <p className={P}>
        For endpoints that accept a request body (<code className={IC}>POST</code>, <code className={IC}>PUT</code>,{' '}
        <code className={IC}>PATCH</code>), you can optionally define the expected body schema.
      </p>
      <p className={P}>
        The schema builder supports the following types at each level:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}><code className={IC}>string</code> — any text value</li>
        <li className={LI}><code className={IC}>number</code> — integer or float</li>
        <li className={LI}><code className={IC}>boolean</code> — true / false</li>
        <li className={LI}><code className={IC}>object</code> — nested object with its own fields (up to 3 levels deep)</li>
        <li className={LI}><code className={IC}>array</code> — array of a specified type</li>
      </ul>
      <p className={P}>
        Each field can be marked as <strong className="font-semibold text-foreground">required</strong> or <strong className="font-semibold text-foreground">optional</strong>.
        When a request arrives at the mock server with a body that's missing required fields, the server
        returns a 400 validation error automatically.
      </p>

      <h2 id="response-scenarios" className={H2}>Response Scenarios</h2>
      <p className={P}>
        Each endpoint can have multiple response scenarios. A scenario is a named combination of:
      </p>
      <ul className="list-disc pl-5 space-y-1.5 mb-6">
        <li className={LI}><strong className="font-semibold text-foreground">Status code</strong> — e.g. 200, 201, 400, 404, 500</li>
        <li className={LI}><strong className="font-semibold text-foreground">Response body</strong> — valid JSON</li>
      </ul>
      <p className={P}>
        Common scenarios to define per endpoint:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
        {['200 Success', '201 Created', '400 Bad Request', '401 Unauthorized', '404 Not Found', '500 Server Error'].map(s => (
          <div key={s} className="px-3 py-2 rounded-lg bg-bg-surface border border-border
            text-xs font-mono text-muted-foreground">
            {s}
          </div>
        ))}
      </div>

      <h2 id="default-response" className={H2}>Default Response</h2>
      <p className={P}>
        One scenario per endpoint must be designated as the <strong className="font-semibold text-foreground">default response</strong>.
        This is what the mock server returns when no custom toggle is active for the requesting user.
      </p>
      <p className={P}>
        The default response must have a 2xx status code. You cannot delete the default response
        unless you first assign a different scenario as the default.
      </p>

      <DocsPager />
    </article>
  )
}
