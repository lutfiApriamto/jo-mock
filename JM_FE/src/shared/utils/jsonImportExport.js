export function downloadJson(data, filename) {
  const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const blob = new Blob([str], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch {
        reject(new Error('File is not valid JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsText(file)
  })
}

function inferType(value) {
  if (value === null || value === undefined) return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return 'string'
}

export function inferSchemaFromJson(obj, depth = 0) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return []

  return Object.entries(obj).map(([key, value]) => {
    const type = inferType(value)
    const field = { name: key, type, required: true, properties: null, items: null }

    if (type === 'object' && depth < 2) {
      field.properties = inferSchemaFromJson(value, depth + 1)
    }

    if (type === 'array' && Array.isArray(value)) {
      const sample = value[0]
      if (sample !== undefined) {
        const itemType = inferType(sample)
        if (itemType === 'object' && depth < 2) {
          field.items = { type: 'object', properties: inferSchemaFromJson(sample, depth + 1) }
        } else {
          field.items = { type: itemType }
        }
      } else {
        field.items = { type: 'string' }
      }
    }

    return field
  })
}

function exampleValue(type) {
  if (type === 'number') return 0
  if (type === 'boolean') return false
  return ''
}

function fieldsToExample(fields) {
  const obj = {}
  for (const f of fields) {
    if (f.type === 'object' && Array.isArray(f.properties)) {
      obj[f.name] = fieldsToExample(f.properties)
    } else if (f.type === 'array') {
      if (f.items?.type === 'object' && Array.isArray(f.items.properties)) {
        obj[f.name] = [fieldsToExample(f.items.properties)]
      } else {
        obj[f.name] = [exampleValue(f.items?.type ?? 'string')]
      }
    } else {
      obj[f.name] = exampleValue(f.type)
    }
  }
  return obj
}

export function schemaToExampleJson(fields) {
  return fieldsToExample(fields ?? [])
}
