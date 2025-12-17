import { useEffect, useMemo, useRef, useState } from 'react'
import { getLookupForAPI } from '../../api/Lookup'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function safeJsonParse(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function splitDescription(desc) {
  const parts = String(desc || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const [City, Province, PostalCode] = parts
  return { City, Province, PostalCode }
}

export default function LookupTextInput({
  field,
  value,
  onChange,
  onSelectPayload,
  disabled = false,
  placeholder = ' ',
  minChars = 5,
}) {
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)

  const lookup = field?.settings?.lookupSettings
  const hubLinkId = useMemo(() => {
    // Your JSON may set hubLinkId elsewhere; allow direct id for now.
    return lookup?.hubLinkId || 0
  }, [lookup])

  useEffect(() => {
    const handler = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = async (searchTerm) => {
    if (!lookup) return
    setLoading(true)
    try {
      const payload = {
        SearchTerm: searchTerm,
        Country: '',
        LastId: '',
        MaxSuggestions: 30,
      }
      const resp = await getLookupForAPI({
        hublinkId: hubLinkId,
        payloadMapping: JSON.stringify(payload),
      })
      const list = Array.isArray(resp?.Items) ? resp.Items : []
      const mapped = list
        .map((x) => {
          if (!x?.Id || !x?.Text) return null
          return {
            id: x.Id,
            value: x.Text,
            label: x.Description ? `${x.Text}, ${x.Description}` : x.Text,
            description: x.Description || '',
            raw: x,
          }
        })
        .filter(Boolean)
      setItems(mapped)
      setOpen(true)
      setActiveIndex(mapped.length ? 0 : -1)
    } finally {
      setLoading(false)
    }
  }

  const commit = async (opt) => {
    onChange(opt.value)
    setOpen(false)
    setItems([])
    setActiveIndex(-1)

    const raw = opt.raw || {}
    const desc = splitDescription(opt.description)
    const payload = {
      Id: raw.Id || opt.id,
      City: raw.City || desc.City,
      Province: raw.Province || desc.Province,
      PostalCode: raw.PostalCode || desc.PostalCode,
      Raw: raw,
    }
    onSelectPayload?.(payload, field)
  }

  useEffect(() => {
    if (!open) return
    if (!listRef.current) return
    if (activeIndex < 0) return
    const el = listRef.current.children[activeIndex]
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  const stringValue = value ?? ''
  const parsed = safeJsonParse(stringValue)
  const displayValue = typeof parsed === 'object' && parsed?.value ? parsed.value : stringValue

  return (
    <div ref={rootRef} className="relative">
      <input
        value={displayValue}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value
          onChange(v)
          if (lookup && v.trim().length >= minChars) fetchSuggestions(v.trim())
          else setOpen(false)
        }}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === 'Escape') setOpen(false)
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => Math.min(i + 1, items.length - 1))
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(i - 1, 0))
          }
          if (e.key === 'Enter') {
            e.preventDefault()
            const opt = items[activeIndex]
            if (opt) commit(opt)
          }
        }}
        className={cx(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : '',
        )}
      />

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div ref={listRef} className="max-h-56 overflow-auto p-1">
            {loading ? (
              <div className="px-3 py-3 text-sm text-slate-500">Loading…</div>
            ) : items.length ? (
              items.map((opt, idx) => (
                <button
                  key={opt.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => commit(opt)}
                  className={cx(
                    'w-full rounded-lg px-3 py-2 text-left text-sm',
                    idx === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  <span className="block truncate font-semibold">{opt.value}</span>
                  {opt.description ? (
                    <span className="block truncate text-xs text-slate-500">{opt.description}</span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-sm text-slate-500">No results</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

