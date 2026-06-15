import DocsPager from '@/shared/components/DocsPager'

const H2 = 'font-heading font-bold text-xl text-foreground mt-12 mb-4 scroll-mt-24'
const P  = 'text-sm sm:text-base text-muted-foreground leading-relaxed mb-4'
const LI = 'text-sm sm:text-base text-muted-foreground leading-relaxed'
const IC = 'bg-bg-surface text-brand-accent font-mono text-[13px] px-1.5 py-0.5 rounded border border-border'
const PRE = 'bg-bg-surface border border-border rounded-xl p-4 overflow-x-auto mb-6'
const CODE = 'text-[13px] font-mono text-foreground/90 leading-relaxed'

const Combo = ({ lang, state }) => (
  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-bg-surface border border-border">
    <div className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
    <span className="text-sm text-foreground font-medium">{lang}</span>
    <span className="text-xs text-muted-foreground">+</span>
    <span className="text-sm text-muted-foreground">{state}</span>
  </div>
)

export default function CodeGeneratorPage() {
  return (
    <article>
      <h1 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-3">
        Code Generator
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
        Generate production-ready frontend code for any endpoint with one click — then swap the
        base URL when your backend is ready.
      </p>
      <div className="w-12 h-0.5 bg-brand-primary/40 mb-10" />

      <h2 id="overview" className={H2}>Overview</h2>
      <p className={P}>
        The Code Generator reads your endpoint's method, path, and request schema, then produces
        complete, usable frontend code. All generated code uses{' '}
        <strong className="font-semibold text-foreground">Axios</strong> for HTTP requests and is
        designed to be copied directly into your project.
      </p>
      <p className={P}>
        Since the code targets your mock URL by default, you can test the generated code immediately
        against the mock server. When your real backend is ready, simply replace the base URL.
      </p>

      <h2 id="combinations" className={H2}>Available Combinations</h2>
      <p className={P}>
        The generator supports four output combinations — two language choices crossed with two state
        management approaches:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        <Combo lang="React JavaScript" state="useState" />
        <Combo lang="React JavaScript" state="Zustand" />
        <Combo lang="React TypeScript" state="useState" />
        <Combo lang="React TypeScript" state="Zustand" />
      </div>
      <p className={P}>
        Choose the combination that matches your project's tech stack.
      </p>

      <h2 id="how-to-use" className={H2}>How to Use</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li className={LI}>Open the endpoint detail page for any endpoint in your project</li>
        <li className={LI}>Click the <strong className="font-semibold text-foreground">Generate Code</strong> button</li>
        <li className={LI}>Select your preferred combination (language + state management)</li>
        <li className={LI}>Copy the generated code using the copy button</li>
        <li className={LI}>Paste it into your React project and adjust as needed</li>
      </ol>
      <p className={P}>
        The generated code includes: the API call function, loading state, error state, and
        a sample usage in a React component. For Zustand, it includes a minimal store slice.
      </p>

      <h2 id="example" className={H2}>Example Output</h2>
      <p className={P}>
        For a <code className={IC}>GET /users/:id</code> endpoint, here's what the
        <strong className="font-semibold text-foreground"> React JS + useState</strong> output looks like:
      </p>
      <pre className={PRE}>
        <code className={CODE}>{`// api/users.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.jomock.app/mock/my-project',
  headers: {
    Authorization: \`Bearer \${import.meta.env.VITE_JOMOCK_KEY}\`,
  },
})

export const getUserById = (id) => api.get(\`/users/\${id}\`)


// components/UserProfile.jsx
import { useState, useEffect } from 'react'
import { getUserById } from '../api/users'

export default function UserProfile({ userId }) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    getUserById(userId)
      .then(res => setData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {'{error}'}</p>
  return <pre>{'{JSON.stringify(data, null, 2)}'}</pre>
}`}</code>
      </pre>

      <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl px-4 py-3 mb-6">
        <p className="text-sm text-foreground leading-relaxed">
          <strong className="font-semibold">Going to production:</strong> When your backend is ready,
          replace the <code className={IC}>baseURL</code> with your real API URL and remove the
          Authorization header (unless your production API also uses token auth). No other code changes needed.
        </p>
      </div>

      <DocsPager />
    </article>
  )
}
