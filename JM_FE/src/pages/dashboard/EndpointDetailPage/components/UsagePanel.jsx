import { useState } from 'react'
import toast from 'react-hot-toast'
import { FaCopy, FaCheck, FaExclamationTriangle, FaLink, FaCode } from 'react-icons/fa'
import InfoTooltip from '@/shared/components/InfoTooltip'
import { useProjectCtx } from '@/pages/dashboard/ProjectDetailPage/context'
import { useEndpointCtx } from '../context'

// Mock calls go through the FE (proxied to BE) — never expose BE URL to users
const MOCK_BASE = (import.meta.env.VITE_APP_URL ?? 'http://localhost:5173') + '/mock'
// Prevent Vite from replacing this literal in generated code strings
const ENV_KEY = 'import' + '.meta.env.VITE_JOMOCK_KEY'

const METHOD_STYLE = {
  GET:    'bg-blue-500/10 text-blue-500 border-blue-500/20',
  POST:   'bg-status-success/10 text-status-success border-status-success/20',
  PUT:    'bg-status-warning/10 text-status-warning border-status-warning/20',
  PATCH:  'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  DELETE: 'bg-status-danger/10 text-status-danger border-status-danger/20',
}

const COMBOS = [
  { id: 'js-state',   lang: 'js', stateLib: 'useState', label: 'JS + useState'  },
  { id: 'js-zustand', lang: 'js', stateLib: 'zustand',  label: 'JS + Zustand'   },
  { id: 'ts-state',   lang: 'ts', stateLib: 'useState', label: 'TS + useState'  },
  { id: 'ts-zustand', lang: 'ts', stateLib: 'zustand',  label: 'TS + Zustand'   },
]

const METHOD_VERB = { GET: 'get', POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' }

function getResource(path) {
  const segs = path.split('/').filter(s => s && !s.startsWith(':'))
  return segs[segs.length - 1] || 'data'
}

function toPascal(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Data'
}

function schemaToTSInterface(schema) {
  if (!schema?.length) return ''
  const fields = schema.map((f) => {
    const t = {
      string: 'string', number: 'number', boolean: 'boolean',
      object: 'Record<string, unknown>', array: 'unknown[]',
    }[f.type] ?? 'unknown'
    return `  ${f.name}${f.required ? '' : '?'}: ${t}`
  }).join('\n')
  return `\ninterface RequestBody {\n${fields}\n}\n`
}

function schemaToBodyExample(schema) {
  if (!schema?.length) return '  // add your request body here'
  return schema.map((f) => `  ${f.name}: '...',${f.required ? '' : ' // optional'}`).join('\n')
}

function generateCode({ lang, stateLib }, { method, path, slug, schema }) {
  const isTS      = lang === 'ts'
  const isZustand = stateLib === 'zustand'
  const hasBody   = ['POST', 'PUT', 'PATCH'].includes(method)
  const ext       = isTS ? 'ts' : 'js'
  const compExt   = isTS ? 'tsx' : 'jsx'
  const resource  = getResource(path)
  const Comp      = toPascal(resource)
  const funcName  = `${METHOD_VERB[method] ?? 'call'}${Comp}`
  const baseURL   = `${MOCK_BASE}/${slug}`
  const tsIface   = isTS && hasBody && schema?.length ? schemaToTSInterface(schema) : ''
  const bodyParam = hasBody ? (isTS && schema?.length ? '(body: RequestBody)' : '(body)') : '()'
  const bodyArg   = hasBody ? ', body' : ''

  const apiFile = `\
// api/${resource}.${ext}
import axios from 'axios'
${tsIface}
const api = axios.create({
  baseURL: '${baseURL}',
  headers: { 'x-api-key': ${ENV_KEY} },
})

export const ${funcName} = ${bodyParam} => api.${method.toLowerCase()}('${path}'${bodyArg})`

  if (isZustand) {
    const storeIface = isTS
      ? `\ninterface ${Comp}Store {\n  data: unknown\n  loading: boolean\n  error: string | null\n  ${hasBody ? 'submit' : 'fetch'}: (${hasBody ? `body${schema?.length ? ': RequestBody' : ''}` : ''}) => Promise<void>\n}\n`
      : ''

    const storeFile = `\
// store/use${Comp}Store.${ext}
import { create } from 'zustand'
import { ${funcName} } from '../api/${resource}'
${storeIface}
const use${Comp}Store = create${isTS ? `<${Comp}Store>` : ''}((set) => ({
  data:    null,
  loading: false,
  error:   null,
  ${hasBody ? 'submit' : 'fetch'}:   async (${hasBody ? `body${isTS && schema?.length ? ': RequestBody' : ''}` : ''}) => {
    set({ loading: true, error: null })
    try {
      const res = await ${funcName}(${hasBody ? 'body' : ''})
      set({ data: res.data, loading: false })
    } catch (err) {
      set({ error: ${isTS ? '(err as Error).message' : 'err.message'}, loading: false })
    }
  },
}))

export default use${Comp}Store`

    const compBody = hasBody
      ? `  const handleSubmit = () => submit({\n${schemaToBodyExample(schema)}\n  })\n\n  if (loading) return <p>Loading...</p>\n  if (error)   return <p>Error: {error}</p>\n  return (\n    <div>\n      <button onClick={handleSubmit}>Submit</button>\n      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}\n    </div>\n  )`
      : `  useEffect(() => { fetch() }, [])\n\n  if (loading) return <p>Loading...</p>\n  if (error)   return <p>Error: {error}</p>\n  return <pre>{JSON.stringify(data, null, 2)}</pre>`

    const compImport = hasBody ? `import use${Comp}Store from '../store/use${Comp}Store'` : `import { useEffect } from 'react'\nimport use${Comp}Store from '../store/use${Comp}Store'`

    const compFile = `\
// components/${Comp}.${compExt}
${compImport}

export default function ${Comp}()${isTS ? ': JSX.Element' : ''} {
  const { data, loading, error, ${hasBody ? 'submit' : 'fetch'} } = use${Comp}Store()

${compBody}
}`

    return `${apiFile}\n\n\n${storeFile}\n\n\n${compFile}`
  }

  // useState version
  if (hasBody) {
    const compFile = `\
// components/${Comp}.${compExt}
import { useState } from 'react'
import { ${funcName} } from '../api/${resource}'

export default function ${Comp}()${isTS ? ': JSX.Element' : ''} {
  const [data, setData]       = useState${isTS ? '<unknown>' : ''}(null)
  const [loading, setLoading] = useState${isTS ? '<boolean>' : ''}(false)
  const [error, setError]     = useState${isTS ? '<string | null>' : ''}(null)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await ${funcName}({
${schemaToBodyExample(schema)}
      })
      setData(res.data)
    } catch (err) {
      setError(${isTS ? '(err as Error).message' : 'err.message'})
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>
  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}`
    return `${apiFile}\n\n\n${compFile}`
  }

  const compFile = `\
// components/${Comp}.${compExt}
import { useState, useEffect } from 'react'
import { ${funcName} } from '../api/${resource}'

export default function ${Comp}()${isTS ? ': JSX.Element' : ''} {
  const [data, setData]       = useState${isTS ? '<unknown>' : ''}(null)
  const [loading, setLoading] = useState${isTS ? '<boolean>' : ''}(false)
  const [error, setError]     = useState${isTS ? '<string | null>' : ''}(null)

  useEffect(() => {
    setLoading(true)
    ${funcName}()
      .then(res => setData(res.data))
      .catch(err => setError(${isTS ? '(err as Error).message' : 'err.message'}))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}`

  return `${apiFile}\n\n\n${compFile}`
}

// ──────────────────────────────────────────────────────────────────────────────
// CopyButton
// ──────────────────────────────────────────────────────────────────────────────
function CopyButton({ text, small = false, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy.')
    }
  }
  return (
    <button
      onClick={copy}
      className={[
        'flex items-center gap-1.5 rounded-lg font-semibold border transition-all duration-150',
        small
          ? 'px-2.5 py-1 text-[11px]'
          : 'px-3 py-1.5 text-[12px]',
        copied
          ? 'border-status-success/40 text-status-success bg-status-success/8'
          : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border bg-background',
      ].join(' ')}
    >
      {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// UsagePanel
// ──────────────────────────────────────────────────────────────────────────────
export default function UsagePanel() {
  const { project }  = useProjectCtx()
  const { endpoint } = useEndpointCtx()
  const [comboId, setComboId] = useState('js-state')

  const selectedCombo = COMBOS.find(c => c.id === comboId)
  const mockUrl = `${MOCK_BASE}/${project.slug}${endpoint.path}`
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(endpoint?.method)
  const noSchema = hasBody && !endpoint?.requestSchema?.length

  const code = generateCode(selectedCombo, {
    method: endpoint.method,
    path:   endpoint.path,
    slug:   project.slug,
    schema: endpoint.requestSchema,
  })

  return (
    <div className="p-5 max-w-3xl">

      {/* ── Mock URL ──────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <FaLink size={11} className="text-muted-foreground/50" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Mock URL</h2>
          <InfoTooltip content="Use this URL to call the mock API from your code. All requests must include the x-api-key header with your personal API key." />
        </div>
        <p className="text-[12px] text-muted-foreground/60 mb-3">
          Use this URL to call the mock API from your application. Include the{' '}
          <code className="font-mono text-[11px] text-foreground/70 bg-bg-surface px-1.5 py-0.5 rounded border border-border/60">
            x-api-key
          </code>{' '}
          header with your account API key.
        </p>

        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-surface border border-border/60">
          <span className={[
            'shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md border',
            METHOD_STYLE[endpoint?.method] ?? 'bg-bg-surface text-muted-foreground border-border',
          ].join(' ')}>
            {endpoint?.method}
          </span>
          <code className="flex-1 min-w-0 text-[12.5px] font-mono text-foreground break-all">
            {mockUrl}
          </code>
          <div className="shrink-0">
            <CopyButton text={mockUrl} small />
          </div>
        </div>

        <div className="mt-2 px-3.5 py-2.5 rounded-xl bg-bg-surface/50 border border-border/40">
          <p className="text-[11.5px] text-muted-foreground/70">
            Required header:{' '}
            <code className="font-mono text-foreground/80 text-[11px] bg-bg-surface px-1.5 py-0.5 rounded border border-border/60">
              x-api-key: {'<your API key>'}
            </code>
            <span className="ml-2 text-muted-foreground/40">— find it on your profile page</span>
          </p>
        </div>
      </section>

      {/* ── Code Generator ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <FaCode size={11} className="text-muted-foreground/50" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Code Generator</h2>
          <InfoTooltip content="Pick a language and state-management combo to generate ready-to-paste Axios code for your React project. Replace the baseURL with your real API when your backend is ready." />
        </div>
        <p className="text-[12px] text-muted-foreground/60 mb-4">
          Pick a language and state management combo. The generated code uses Axios and is ready to paste —
          replace the <code className="font-mono text-[11px] text-foreground/70 bg-bg-surface px-1 rounded border border-border/50">baseURL</code> with your real API URL when your backend is ready.
        </p>

        {/* Warning: POST/PUT/PATCH without schema */}
        {noSchema && (
          <div className="mb-4 flex items-start gap-2.5 px-3.5 py-3 rounded-xl
            border border-status-warning/30 bg-status-warning/5">
            <FaExclamationTriangle size={11} className="text-status-warning shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-status-warning leading-relaxed">
              This endpoint uses <strong>{endpoint.method}</strong> but has no Request Schema defined yet.
              Go to the <strong>Request Schema</strong> tab to add one so the code generator can include the correct body types.
            </p>
          </div>
        )}

        {/* Combo selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {COMBOS.map(c => (
            <button
              key={c.id}
              onClick={() => setComboId(c.id)}
              className={[
                'px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all duration-150',
                comboId === c.id
                  ? 'border-brand-primary/40 bg-brand-primary/8 text-brand-primary'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border',
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Code block */}
        <div className="relative">
          <div className="absolute right-3 top-3 z-10">
            <CopyButton text={code} small />
          </div>
          <pre className="px-4 py-4 pt-12 rounded-xl bg-bg-surface border border-border/60
            text-[11.5px] font-mono text-foreground/85 overflow-x-auto whitespace-pre leading-relaxed">
            {code}
          </pre>
        </div>
      </section>
    </div>
  )
}
