import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { formDefinition } from '../data/formDefinition.sample'

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

function getOptions(field) {
  const parsed = safeJsonParse(field.validationJson)
  const opts = parsed?.specific?.customOptions
  return Array.isArray(opts) ? opts : []
}

function normalizeName(name) {
  return String(name || '').trim()
}

function shouldShowField(field, valuesById, fieldsByName) {
  const name = normalizeName(field.name)

  // Simple conditional rendering for co-applicant fields:
  // if there is a top-level question "Would you like to add a co-applicant?"
  // and the answer is "Yes", show co-applicant fields. Otherwise hide them.
  if (/\(co-applicant\)/i.test(name) || /^co-applicant/i.test(name)) {
    const coQ = fieldsByName.get('would you like to add a co-applicant?')
    if (!coQ) return true
    const val = valuesById[coQ.id]
    return String(val || '').toLowerCase() === 'yes'
  }

  return true
}

function Label({ children, required }) {
  return (
    <div className="mb-2 text-sm font-semibold text-slate-900">
      {children} {required ? <span className="text-red-500">*</span> : null}
    </div>
  )
}

function InputBase({ className, ...props }) {
  return (
    <input
      {...props}
      className={cx(
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
    />
  )
}

function TextAreaBase({ className, ...props }) {
  return (
    <textarea
      {...props}
      className={cx(
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
    />
  )
}

function SelectBase({ className, children, ...props }) {
  return (
    <select
      {...props}
      className={cx(
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        className,
      )}
    >
      {children}
    </select>
  )
}

function RadioCards({ field, value, onChange }) {
  const options = getOptions(field)
  if (options.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No options configured for “{field.name}”
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const checked = value === opt
        return (
          <label
            key={opt}
            className={cx(
              'flex cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 transition',
              checked
                ? 'border-blue-600 bg-blue-50'
                : 'border-slate-200 bg-sky-50/40 hover:border-slate-300',
            )}
          >
            <input
              type="radio"
              name={`field-${field.id}`}
              checked={checked}
              onChange={() => onChange(opt)}
              className="h-5 w-5 accent-blue-600"
              required={field.isMandatory}
            />
            <span className="text-sm font-semibold text-slate-900">{opt}</span>
          </label>
        )
      })}
    </div>
  )
}

function Checkboxes({ field, value, onChange }) {
  const options = getOptions(field)

  // If no options: treat it like a single consent checkbox.
  if (options.length === 0) {
    const checked = Boolean(value)
    return (
      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-sky-50/40 px-5 py-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-blue-600"
          required={field.isMandatory}
        />
        <span className="text-sm font-semibold text-slate-900">{field.name}</span>
      </label>
    )
  }

  const set = new Set(Array.isArray(value) ? value : [])

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const checked = set.has(opt)
        return (
          <label
            key={opt}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-sky-50/40 px-5 py-4"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                const next = new Set(set)
                if (e.target.checked) next.add(opt)
                else next.delete(opt)
                onChange(Array.from(next))
              }}
              className="mt-0.5 h-5 w-5 accent-blue-600"
            />
            <span className="text-sm font-semibold text-slate-900">{opt}</span>
          </label>
        )
      })}
      {field.isMandatory ? (
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value={set.size > 0 ? 'ok' : ''}
          onChange={() => {}}
        />
      ) : null}
    </div>
  )
}

function applyBasicValidationProps(field) {
  const parsed = safeJsonParse(field.validationJson)
  const rule = parsed?.validation?.contentRule

  if (field.type === 'SHORT_TEXT') {
    if (rule === 'EMAIL') return { type: 'email', inputMode: 'email' }
    if (rule === 'ALPHA_SPACES') return { inputMode: 'text', pattern: "^[A-Za-z ]*$" }
    if (rule === 'ALPHA_DASH') return { inputMode: 'text', pattern: "^[A-Za-z\\- ]*$" }
  }

  return {}
}

function FieldRenderer({ field, value, onChange }) {
  const required = Boolean(field.isMandatory)
  const common = {
    required,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
  }

  switch (field.type) {
    case 'SHORT_TEXT': {
      const extra = applyBasicValidationProps(field)
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <InputBase {...common} {...extra} placeholder="Enter value" />
        </div>
      )
    }
    case 'LONG_TEXT':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <TextAreaBase
            rows={4}
            required={required}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter details"
          />
        </div>
      )
    case 'PHONE_NUMBER':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <InputBase
            type="tel"
            inputMode="tel"
            {...common}
            placeholder="(555) 123-4567"
          />
        </div>
      )
    case 'DATE':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <InputBase type="date" {...common} />
          {normalizeName(field.name).toLowerCase() === 'date of birth' ? (
            <div className="mt-2 text-xs text-slate-500">
              You must be 18 or older to apply
            </div>
          ) : null}
        </div>
      )
    case 'NUMBER':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <InputBase type="number" inputMode="numeric" step="1" {...common} />
        </div>
      )
    case 'CURRENCY_AMOUNT':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              $
            </div>
            <InputBase
              className="pl-8"
              type="number"
              inputMode="decimal"
              step="0.01"
              {...common}
              placeholder="0.00"
            />
          </div>
        </div>
      )
    case 'URL':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <InputBase type="url" inputMode="url" {...common} placeholder="https://..." />
        </div>
      )
    case 'SINGLE_SELECT': {
      const options = getOptions(field)
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <SelectBase
            required={required}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="" disabled>
              Select…
            </option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </SelectBase>
        </div>
      )
    }
    case 'SINGLE_CHOICE': {
      // Styled radio cards (matches screenshots like Residence Type)
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <RadioCards field={field} value={value ?? ''} onChange={onChange} />
        </div>
      )
    }
    case 'MULTIPLE_CHOICE':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <Checkboxes field={field} value={value} onChange={onChange} />
        </div>
      )
    case 'CALCULATED':
      return (
        <div>
          <Label required={required}>{field.name}</Label>
          <InputBase disabled value={value ?? ''} placeholder="Calculated" />
        </div>
      )
    default:
      return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Unsupported field type: <span className="font-semibold">{field.type}</span>
        </div>
      )
  }
}

function TableField({ tableField, childrenFields, value, onChange }) {
  const rows = Array.isArray(value) ? value : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-base font-extrabold text-slate-900">{tableField.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            Add previous addresses as needed.
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange([...rows, {}])}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
        >
          + Add Row
        </button>
      </div>

      <div className="mt-5 space-y-5">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No rows added yet.
          </div>
        ) : null}

        {rows.map((row, idx) => (
          <div key={idx} className="rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-slate-900">Row {idx + 1}</div>
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, i) => i !== idx))}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Remove
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {childrenFields.map((child) => (
                <div key={child.id} className="sm:col-span-1">
                  <FieldRenderer
                    field={child}
                    value={row[child.id]}
                    onChange={(v) => {
                      const next = rows.slice()
                      next[idx] = { ...next[idx], [child.id]: v }
                      onChange(next)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ApplicationFormPage() {
  const navigate = useNavigate()

  const fields = useMemo(() => formDefinition, [])
  const fieldsByName = useMemo(() => {
    const m = new Map()
    for (const f of fields) m.set(normalizeName(f.name).toLowerCase(), f)
    return m
  }, [fields])

  const topLevelFields = useMemo(() => fields.filter((f) => Number(f.parentId) === 0), [fields])

  const tableChildrenByParent = useMemo(() => {
    const m = new Map()
    for (const f of fields) {
      const pid = Number(f.parentId)
      if (!pid) continue
      if (!m.has(pid)) m.set(pid, [])
      m.get(pid).push(f)
    }
    return m
  }, [fields])

  const [valuesById, setValuesById] = useState({})

  const visibleTopFields = useMemo(
    () =>
      topLevelFields.filter((f) => shouldShowField(f, valuesById, fieldsByName)),
    [topLevelFields, valuesById, fieldsByName],
  )

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-5 pt-8">
        <div className="rounded-2xl bg-white/80 px-6 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <BrandMark />
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            New Application
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This page renders controls dynamically from your JSON.
          </p>
        </div>

        <form
          className="mt-8 space-y-8 pb-16"
          onSubmit={(e) => {
            e.preventDefault()
            // For now: just show the payload in console
            // Later you can POST this to your API.
            console.log('Form submit:', valuesById)
            alert('Saved (check console for payload).')
          }}
        >
          <div className="rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {visibleTopFields.map((field) => {
                const isTable = field.type === 'TABLE'
                const show = shouldShowField(field, valuesById, fieldsByName)
                if (!show) return null

                if (isTable) {
                  const children = tableChildrenByParent.get(field.id) ?? []
                  return (
                    <div key={field.id} className="sm:col-span-2">
                      <TableField
                        tableField={field}
                        childrenFields={children}
                        value={valuesById[field.id]}
                        onChange={(v) => setValuesById((p) => ({ ...p, [field.id]: v }))}
                      />
                    </div>
                  )
                }

                // Give certain fields full width (better UX)
                const full =
                  field.type === 'SINGLE_CHOICE' ||
                  field.type === 'MULTIPLE_CHOICE' ||
                  /date of birth/i.test(field.name)

                return (
                  <div key={field.id} className={cx(full ? 'sm:col-span-2' : 'sm:col-span-1')}>
                    <FieldRenderer
                      field={field}
                      value={valuesById[field.id]}
                      onChange={(v) => setValuesById((p) => ({ ...p, [field.id]: v }))}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setValuesById({})}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 shadow-[0_12px_24px_rgba(245,158,11,0.30)] hover:bg-amber-300"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

