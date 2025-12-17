import { useEffect, useMemo, useRef, useState } from 'react'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onOutside])
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
}) {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  useOutsideClick(rootRef, () => setOpen(false))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => String(o).toLowerCase().includes(q))
  }, [options, query])

  const display = value ? String(value) : ''

  const commit = (v) => {
    onChange(v)
    setOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }

  const openMenu = () => {
    if (disabled) return
    setOpen(true)
    setActiveIndex(filtered.length ? 0 : -1)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  useEffect(() => {
    if (!open) return
    if (!listRef.current) return
    if (activeIndex < 0) return
    const el = listRef.current.children[activeIndex]
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        disabled={disabled}
        className={cx(
          'flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition',
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : 'hover:border-slate-300',
        )}
      >
        <span className={cx('truncate', display ? 'text-slate-900' : 'text-slate-400')}>
          {display || placeholder}
        </span>
        <span className="text-slate-400">▾</span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false)
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActiveIndex((i) => Math.max(i - 1, 0))
                }
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const opt = filtered[activeIndex]
                  if (opt != null) commit(opt)
                }
              }}
              placeholder="Search…"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div ref={listRef} className="max-h-56 overflow-auto p-1">
            {filtered.length ? (
              filtered.map((opt, idx) => {
                const isActive = idx === activeIndex
                const isSelected = String(opt) === String(value)
                return (
                  <button
                    key={`${opt}-${idx}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => commit(opt)}
                    className={cx(
                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm',
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    <span className="truncate">{String(opt)}</span>
                    {isSelected ? <span className="text-blue-600">✓</span> : null}
                  </button>
                )
              })
            ) : (
              <div className="px-3 py-4 text-sm text-slate-500">No results</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

