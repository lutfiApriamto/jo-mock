import { useRef, useEffect } from 'react'
import { FaPlus, FaTimes, FaChevronDown } from 'react-icons/fa'

const emptyField = () => ({ name: '', type: 'string', required: false, properties: null, items: null })

// ──────────────────────────────────────────────────────────────────────────────
// FieldRow: satu baris field (rekursif untuk nested)
// ──────────────────────────────────────────────────────────────────────────────
function FieldRow({ field, onChange, onRemove, onAddAfter, depth, readOnly, focusOnMount, onFocused }) {
  const inputRef    = useRef(null)
  const hasNested   = field.type === 'object' && Array.isArray(field.properties)
  const isArrayOfObject = field.type === 'array' && field.items?.type === 'object'
  const hasNameError = !readOnly && field.name.length > 0 && field.name.length < 2

  useEffect(() => {
    if (focusOnMount && inputRef.current) {
      inputRef.current.focus()
      onFocused?.()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch) => onChange({ ...field, ...patch })

  const handleTypeChange = (type) => {
    let next = { ...field, type }
    if (type === 'object') {
      next.properties = field.properties ?? []
      next.items      = null
    } else if (type === 'array') {
      next.items      = field.items ?? { type: 'string' }
      next.properties = null
    } else {
      next.properties = null
      next.items      = null
    }
    onChange(next)
  }

  const addNestedField = () => {
    if (field.type === 'object') {
      onChange({ ...field, properties: [...(field.properties ?? []), emptyField()] })
    }
  }

  const updateNestedField = (idx, val) => {
    const arr = [...(field.properties ?? [])]
    arr[idx] = val
    onChange({ ...field, properties: arr })
  }

  const removeNestedField = (idx) => {
    const arr = [...(field.properties ?? [])]
    arr.splice(idx, 1)
    onChange({ ...field, properties: arr })
  }

  const handleItemTypeChange = (type) => {
    update({
      items: type === 'object'
        ? { type: 'object', properties: [] }
        : { type },
    })
  }

  const updateItemNestedField = (idx, val) => {
    const props = [...(field.items?.properties ?? [])]
    props[idx] = val
    update({ items: { ...field.items, properties: props } })
  }

  const removeItemNestedField = (idx) => {
    const props = [...(field.items?.properties ?? [])]
    props.splice(idx, 1)
    update({ items: { ...field.items, properties: props } })
  }

  return (
    <div className={depth > 0 ? 'pl-4 border-l border-border/40 ml-2' : ''}>
      {/* Row */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            value={field.name}
            onChange={(e) => update({ name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && onAddAfter) {
                e.preventDefault()
                onAddAfter()
              }
            }}
            placeholder="field name"
            disabled={readOnly}
            className={[
              'w-full px-2.5 py-1.5 rounded-lg text-[12px] font-mono text-foreground',
              'bg-background border placeholder:text-muted-foreground/30',
              'focus:outline-none focus:ring-1 focus:ring-brand-primary/20',
              'disabled:opacity-50 disabled:cursor-default transition-all',
              hasNameError ? 'border-status-danger/50' : 'border-border/60',
            ].join(' ')}
          />
          {hasNameError && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-status-danger pointer-events-none">
              min.2
            </span>
          )}
        </div>

        <div className="relative shrink-0">
          <select
            value={field.type === 'array' ? `array:${field.items?.type ?? 'string'}` : field.type}
            onChange={(e) => {
              const v = e.target.value
              if (v.startsWith('array:')) {
                handleTypeChange('array')
                handleItemTypeChange(v.split(':')[1])
              } else {
                handleTypeChange(v)
              }
            }}
            disabled={readOnly}
            className="pl-2.5 pr-6 py-1.5 rounded-lg text-[11px] font-medium text-foreground
              bg-background border border-border/60 appearance-none
              focus:outline-none focus:ring-1 focus:ring-brand-primary/20
              disabled:opacity-50 disabled:cursor-default transition-all cursor-pointer"
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="object">object</option>
            <option value="array:string">string[]</option>
            <option value="array:number">number[]</option>
            <option value="array:boolean">boolean[]</option>
            <option value="array:object">object[]</option>
          </select>
          <FaChevronDown size={8} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/50" />
        </div>

        <label className="shrink-0 flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => update({ required: e.target.checked })}
            disabled={readOnly}
            className="accent-brand-primary"
          />
          <span className="text-[11px] text-muted-foreground font-medium">req</span>
        </label>

        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded
              text-muted-foreground/40 hover:text-status-danger hover:bg-status-danger/8
              transition-all duration-100"
          >
            <FaTimes size={9} />
          </button>
        )}
      </div>

      {/* Nested fields for object */}
      {hasNested && depth < 2 && (
        <div className="mb-2 space-y-1.5">
          {(field.properties ?? []).map((child, idx) => (
            <FieldRow
              key={idx}
              field={child}
              onChange={(val) => updateNestedField(idx, val)}
              onRemove={() => removeNestedField(idx)}
              depth={depth + 1}
              readOnly={readOnly}
            />
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={addNestedField}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/60
                hover:text-brand-primary transition-colors mt-1 pl-1"
            >
              <FaPlus size={8} /> Add field inside object
            </button>
          )}
        </div>
      )}

      {/* Nested fields for array of objects */}
      {isArrayOfObject && depth < 2 && (
        <div className="mb-2 space-y-1.5">
          {(field.items?.properties ?? []).map((child, idx) => (
            <FieldRow
              key={idx}
              field={child}
              onChange={(val) => updateItemNestedField(idx, val)}
              onRemove={() => removeItemNestedField(idx)}
              depth={depth + 1}
              readOnly={readOnly}
            />
          ))}
          {!readOnly && (
            <button
              type="button"
              onClick={() => update({ items: { ...field.items, properties: [...(field.items?.properties ?? []), emptyField()] } })}
              className="flex items-center gap-1 text-[11px] text-muted-foreground/60
                hover:text-brand-primary transition-colors mt-1 pl-1"
            >
              <FaPlus size={8} /> Add field inside object[][]
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// SchemaVisualEditor (exported)
// ──────────────────────────────────────────────────────────────────────────────
export default function SchemaVisualEditor({ fields, onChange, readOnly }) {
  const pendingFocusIdx = useRef(null)

  const addField = () => {
    pendingFocusIdx.current = fields.length
    onChange([...fields, emptyField()])
  }

  const addFieldAfter = (idx) => {
    const next = [...fields]
    next.splice(idx + 1, 0, emptyField())
    pendingFocusIdx.current = idx + 1
    onChange(next)
  }

  const updateField = (idx, val) => {
    const next = [...fields]
    next[idx] = val
    onChange(next)
  }

  const removeField = (idx) => {
    const next = [...fields]
    next.splice(idx, 1)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {fields.length === 0 && (
        <p className="text-[12px] text-muted-foreground/50 py-2">
          {readOnly ? 'No fields defined.' : 'No fields yet. Add the first field or press Enter.'}
        </p>
      )}

      {fields.map((field, idx) => {
        const shouldFocus = pendingFocusIdx.current === idx
        return (
          <FieldRow
            key={idx}
            field={field}
            onChange={(val) => updateField(idx, val)}
            onRemove={() => removeField(idx)}
            onAddAfter={() => addFieldAfter(idx)}
            depth={0}
            readOnly={readOnly}
            focusOnMount={shouldFocus}
            onFocused={() => { pendingFocusIdx.current = null }}
          />
        )
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1.5 text-[12px] font-medium text-brand-primary
            hover:opacity-80 transition-opacity mt-2"
        >
          <FaPlus size={9} />
          Add field
        </button>
      )}
    </div>
  )
}
