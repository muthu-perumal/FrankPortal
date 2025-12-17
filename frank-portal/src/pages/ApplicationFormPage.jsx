import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { getInboxItem } from '../api/Portal'
import { formDefinition as sampleDefinition } from '../data/formDefinition.sample'
import SearchableSelect from '../components/form/SearchableSelect'
import LookupTextInput from '../components/form/LookupTextInput'
import EmailInviteInput from '../components/form/EmailInviteInput'
import JsonPhoneInput from '../components/form/JsonPhoneInput'
import LoadingPage from '../components/LoadingPage'
import {
  getUniqueColumnValues,
  getUniqueColumnsFromParentRepository,
  getUniqueColumnsRepository,
  getUserList,
} from '../api/DropdownOptions'

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

function normalizeName(name) {
  return String(name || '').trim()
}

function getLabelText(field) {
  const raw = field?.displayLabel || field?.label || field?.name || ''
  if (typeof raw !== 'string') return String(raw)
  if (raw.startsWith('[HINT] -')) return raw.replace('[HINT] -', '').trim()
  return raw
}

function getColSpanClass(field) {
  const size = field?.settings?.general?.size
  if (size === 'col-4') return 'sm:col-span-4'
  if (size === 'col-6') return 'sm:col-span-6'
  if (size === 'col-12') return 'sm:col-span-12'
  return 'sm:col-span-6'
}

function splitOptionsFromString(value) {
  if (typeof value !== 'string') return []
  const parts = value.split(',')
  const list = parts.length === 1 ? value.split('\n') : parts
  return list.map((s) => s.trim()).filter(Boolean)
}

function getOptions(field) {
  // Primary source (your sample code): field.settings.specific.customOptions
  const fromSettings = field?.settings?.specific?.customOptions
  if (Array.isArray(fromSettings)) return fromSettings
  const parsedFromSettings = splitOptionsFromString(fromSettings)
  if (parsedFromSettings.length) return parsedFromSettings

  // Fallback source (older API response): validationJson.specific.customOptions
  const parsed = safeJsonParse(field?.validationJson)
  const opts = parsed?.specific?.customOptions
  if (Array.isArray(opts)) return opts

  return []
}

function getOptionsType(field) {
  return String(field?.settings?.specific?.optionsType || 'CUSTOM').toUpperCase()
}

function optionsKey(field, valuesById) {
  const type = getOptionsType(field)
  if (type === 'REPOSITORY' && field?.settings?.specific?.repositoryFieldParent) {
    const parentId = field.settings.specific.repositoryFieldParent
    const parentVal = valuesById?.[parentId] ?? ''
    return `${field.id}::repoParent::${parentId}::${parentVal}`
  }
  if (type === 'MASTER' && field?.settings?.specific?.masterFormParentColumn) {
    const parentId = field.settings.specific.masterFormParentColumn
    const parentVal = valuesById?.[parentId] ?? ''
    return `${field.id}::masterParent::${parentId}::${parentVal}`
  }
  return `${field.id}::static`
}

function computeVisibilityMap({ controls, values, secureControls }) {
  const secure = Array.isArray(secureControls) ? secureControls : []
  const vis = {}

  // (A) default visible unless DISABLE/secure
  for (const c of controls) {
    const id = c?.id
    if (!id) continue
    const disabled =
      String(c?.settings?.general?.visibility || '').toUpperCase() === 'DISABLE'
    vis[id] = !disabled && !secure.includes(id)
  }

  // (B) all controlled fields default to false
  for (const parent of controls) {
    const enableSettings = parent?.settings?.validation?.enableSettings || []
    for (const setting of enableSettings) {
      for (const targetId of setting?.controls || []) {
        if (vis[targetId] !== false) vis[targetId] = false
      }
    }
  }

  // (C) evaluate enableSettings
  for (const parent of controls) {
    const enableSettings = parent?.settings?.validation?.enableSettings || []
    const parentVal = values?.[parent.id]

    for (const setting of enableSettings) {
      const targets = setting?.controls || []
      if (!targets.length) continue

      const matchesValue =
        parentVal == setting.value ||
        (Array.isArray(parentVal) && parentVal.includes(setting.value))
      if (!matchesValue) continue

      const conditions = setting?.conditions || []
      let ok = true

      if (Array.isArray(conditions) && conditions.length) {
        const mode = String(setting.groupLogic || 'ALL').toUpperCase() // ALL / ANY

        const evalCond = (cond) => {
          const v = values?.[cond.name]
          switch (cond.logic) {
            case 'IS_EQUALS_TO':
              return v == cond.value
            case 'IS_NOT_EQUALS_TO':
              return v != cond.value
            case 'IS_GREATER_THAN':
              return v > cond.value
            case 'IS_GREATER_THAN_OR_EQUALS_TO':
              return v >= cond.value
            case 'IS_LESSER_THAN':
              return v < cond.value
            case 'IS_LESSER_THAN_OR_EQUALS_TO':
              return v <= cond.value
            case 'IS_EMPTY':
              return v === '' || v == null
            case 'IS_NOT_EMPTY':
              return !(v === '' || v == null)
            default:
              return false
          }
        }

        ok = mode === 'ANY' ? conditions.some(evalCond) : conditions.every(evalCond)
      }

      if (!ok) continue

      for (const id of targets) {
        if (!secure.includes(id)) vis[id] = true
      }
    }
  }

  return vis
}

function isReadOnly(field) {
  return String(field?.settings?.general?.visibility || '').toUpperCase() === 'READ_ONLY'
}

function renderDivider(field) {
  const type = String(field?.settings?.general?.dividerType || 'SOLID').toUpperCase()
  const base = 'border-slate-200/70'
  if (type === 'DOUBLE') {
    return (
      <div className="space-y-2">
        <div className={cx('border-t', base)} />
        <div className={cx('border-t', base)} />
      </div>
    )
  }
  const style =
    type === 'DASHED'
      ? 'border-t border-dashed'
      : type === 'DOTTED'
        ? 'border-t border-dotted'
        : 'border-t border-solid'
  return <div className={cx(style, base)} />
}

function Label({ field, required, hideLabel = false }) {
  if (hideLabel) return null

  const tooltip = field?.settings?.general?.tooltip
  const hint = typeof field?.label === 'string' && field.label.startsWith('[HINT] -')
  const text = getLabelText(field)

  return (
    <div className="mb-2 flex items-center gap-2">
      <div
        className={cx(
          'text-sm font-medium',
          hint ? 'text-amber-500' : 'text-slate-700',
          isReadOnly(field) ? 'opacity-60' : '',
        )}
      >
        {text} {required ? <span className="text-red-500">*</span> : null}
      </div>
      {tooltip ? (
        <span
          title={tooltip}
          className="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200"
        >
          ?
        </span>
      ) : null}
    </div>
  )
}

function InputBase({ className, ...props }) {
  return (
    <input
      {...props}
      className={cx(
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500',
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
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500',
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
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500',
        className,
      )}
    >
      {children}
    </select>
  )
}

function RadioCards({ field, value, onChange, required, disabled }) {
  const options = getOptions(field)
  if (!options.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        No options configured for “{getLabelText(field)}”
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
              disabled ? 'cursor-not-allowed opacity-60' : '',
            )}
          >
            <input
              type="radio"
              name={`field-${field.id}`}
              checked={checked}
              onChange={() => onChange(opt)}
              className="h-5 w-5 accent-blue-600"
              required={required}
              disabled={disabled}
            />
            <span className="text-sm font-semibold text-slate-900">{opt}</span>
          </label>
        )
      })}
    </div>
  )
}

function Checkboxes({ field, value, onChange, required, disabled }) {
  const options = getOptions(field)

  // If no options: treat it like a single consent checkbox (still styled).
  if (!options.length) {
    const checked = Boolean(value)
    return (
      <label
        className={cx(
          'flex items-start gap-3 rounded-2xl border border-slate-200 bg-sky-50/40 px-5 py-4',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-blue-600"
          required={required}
          disabled={disabled}
        />
        <span className="text-sm font-semibold text-slate-900">{getLabelText(field)}</span>
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
            className={cx(
              'flex items-start gap-3 rounded-2xl border border-slate-200 bg-sky-50/40 px-5 py-4',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            )}
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
              disabled={disabled}
            />
            <span className="text-sm font-semibold text-slate-900">{opt}</span>
          </label>
        )
      })}

      {/* Required validation hook for checkbox groups */}
      {required ? (
        <input tabIndex={-1} className="sr-only" required value={set.size ? 'ok' : ''} readOnly />
      ) : null}
    </div>
  )
}

function applyBasicValidationProps(field) {
  const parsed = safeJsonParse(field?.validationJson)
  const rule = parsed?.validation?.contentRule

  if (field.type === 'SHORT_TEXT') {
    if (rule === 'EMAIL') return { type: 'email', inputMode: 'email' }
    if (rule === 'ALPHA_SPACES') return { inputMode: 'text', pattern: '^[A-Za-z ]*$' }
    if (rule === 'ALPHA_DASH') return { inputMode: 'text', pattern: '^[A-Za-z\\- ]*$' }
  }

  return {}
}

function FieldRenderer({
  field,
  value,
  onChange,
  required,
  hideLabel,
  error,
  mainApplicantEmail,
  onLookupPayload,
}) {
  const disabled = isReadOnly(field)
  const [localError, setLocalError] = useState('')

  const common = {
    required,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    disabled,
  }

  // Normalize some type aliases you used in your old renderer.
  const type = String(field.type || '').toUpperCase()
  const contentRule = String(field?.settings?.validation?.contentRule || '').toUpperCase()
  const verificationRequired = Boolean(field?.settings?.validation?.verificationRequired)
  const hasLookup =
    Boolean(field?.settings?.lookupSettings?.columnName) ||
    Boolean(field?.settings?.lookupSettings?.columnNameInAPI)

  if (type === 'DIVIDER') {
    return <div className="pt-3">{renderDivider(field)}</div>
  }

  if (type === 'PARAGRAPH') {
    const html = field?.settings?.specific?.textContent || ''
    // NOTE: Keep as-is; in production you should sanitize HTML.
    return <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  }

  if (type === 'LABEL') {
    return <Label field={field} required={required} hideLabel={hideLabel} />
  }

  return (
    <div>
      <Label field={field} required={required} hideLabel={hideLabel} />

      {type === 'SHORT_TEXT' && contentRule === 'EMAIL' ? (
        <EmailInviteInput
          value={value ?? ''}
          disabled={disabled}
          verificationRequired={verificationRequired}
          isCoApplicant={/co-applicant/i.test(getLabelText(field))}
          mainApplicantEmail={mainApplicantEmail || ''}
          onValidationError={(msg) => setLocalError(msg || '')}
          onChange={(v) => onChange(v)}
        />
      ) : type === 'SHORT_TEXT' && hasLookup ? (
        <LookupTextInput
          field={field}
          value={value ?? ''}
          disabled={disabled}
          placeholder={field?.settings?.general?.placeholder || ' '}
          onChange={(v) => onChange(v)}
          onSelectPayload={(payload, srcField) => onLookupPayload?.(payload, srcField)}
        />
      ) : type === 'SHORT_TEXT' ? (
        <InputBase
          {...common}
          {...applyBasicValidationProps(field)}
          placeholder={field?.settings?.general?.placeholder || ' '}
        />
      ) : type === 'LONG_TEXT' ? (
        <TextAreaBase
          rows={4}
          required={required}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={field?.settings?.general?.placeholder || ' '}
        />
      ) : type === 'PHONE_NUMBER' ? (
        <JsonPhoneInput
          value={value ?? ''}
          onChange={(v) => onChange(v)}
          disabled={disabled}
          placeholder={field?.settings?.general?.placeholder || '(555) 123-4567'}
        />
      ) : type === 'DATE' ? (
        <div>
          <InputBase type="date" {...common} />
          {normalizeName(field.name).toLowerCase() === 'date of birth' ? (
            <div className="mt-2 text-xs text-slate-500">You must be 18 or older to apply</div>
          ) : null}
        </div>
      ) : type === 'TIME' ? (
        <InputBase type="time" {...common} />
      ) : type === 'NUMBER' ? (
        <InputBase type="number" inputMode="numeric" step="1" {...common} />
      ) : type === 'CURRENCY_AMOUNT' || type === 'CURRENCY' ? (
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
            $
          </div>
          <InputBase className="pl-8" type="number" inputMode="decimal" step="0.01" {...common} placeholder="0.00" />
        </div>
      ) : type === 'URL' ? (
        <InputBase type="url" inputMode="url" {...common} placeholder="https://..." />
      ) : type === 'SINGLE_SELECT' || type === 'MULTI_SELECT' ? (
        <SearchableSelect
          value={value ?? ''}
          onChange={(v) => onChange(v)}
          options={Array.isArray(field.__resolvedOptions) ? field.__resolvedOptions : getOptions(field)}
          disabled={disabled}
          placeholder={
            field.__optionsLoading
              ? 'Loading…'
              : field?.settings?.general?.placeholder || 'Select…'
          }
        />
      ) : type === 'SINGLE_CHOICE' || type === 'RADIO' ? (
        <RadioCards field={field} value={value ?? ''} onChange={onChange} required={required} disabled={disabled} />
      ) : type === 'MULTI_CHOICE' || type === 'MULTIPLE_CHOICE' || type === 'CHECKBOX' ? (
        <Checkboxes field={field} value={value} onChange={onChange} required={required} disabled={disabled} />
      ) : type === 'CALCULATED' ? (
        <InputBase disabled value={value ?? ''} placeholder="Calculated" />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Unsupported field type: <span className="font-semibold">{field.type}</span>
        </div>
      )}

      {error || localError ? (
        <p className="mt-1 text-xs font-medium text-red-500">{error || localError}</p>
      ) : null}
    </div>
  )
}

function TableField({ tableField, childrenFields, value, onChange, required }) {
  const rows = Array.isArray(value) ? value : []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-base font-extrabold text-slate-900">{getLabelText(tableField)}</div>
          <div className="mt-1 text-xs text-slate-500">Add rows as needed.</div>
          {required ? <div className="mt-1 text-xs font-semibold text-red-500">This table is required</div> : null}
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

            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-12">
              {childrenFields.map((child) => {
                const col = getColSpanClass(child)
                const childRequired =
                  String(child?.settings?.validation?.fieldRule || '').toUpperCase() === 'REQUIRED' &&
                  String(child?.settings?.general?.visibility || '').toUpperCase() === 'NORMAL'

                return (
                  <div key={child.id} className={col}>
                    <FieldRenderer
                      field={child}
                      value={row[child.id]}
                      onChange={(v) => {
                        const next = rows.slice()
                        next[idx] = { ...next[idx], [child.id]: v }
                        onChange(next)
                      }}
                      required={childRequired}
                      mainApplicantEmail=""
                      onLookupPayload={(payload, srcField) => {
                        // When a lookup field is selected inside a TABLE row, fill sibling columns
                        // based on lookupSettings.columnNameInAPI if present.
                        const next = rows.slice()
                        const updated = { ...(next[idx] || {}) }

                        const raw = payload?.Raw || {}
                        for (const sibling of childrenFields) {
                          if (sibling.id === srcField?.id) continue
                          const map = sibling?.settings?.lookupSettings?.columnNameInAPI
                          const key = Array.isArray(map) ? map[0] : null
                          if (key && raw && raw[key] !== undefined && raw[key] !== null) {
                            updated[sibling.id] = raw[key]
                          }
                        }

                        // Heuristic fallback (City/Province/Postal)
                        const label = normalizeName(getLabelText(srcField || {})).toLowerCase()
                        if (label.includes('address')) {
                          for (const sibling of childrenFields) {
                            const t = normalizeName(getLabelText(sibling)).toLowerCase()
                            if (t.includes('city') && payload?.City) updated[sibling.id] = payload.City
                            if (t.includes('province') && payload?.Province) updated[sibling.id] = payload.Province
                            if (t.includes('postal') && payload?.PostalCode) updated[sibling.id] = payload.PostalCode
                          }
                        }

                        next[idx] = updated
                        onChange(next)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildFallbackPanelsFromSample() {
  const fields = sampleDefinition.map((f) => {
    const parsed = safeJsonParse(f.validationJson)
    const opts = parsed?.specific?.customOptions
    const customOptions = Array.isArray(opts) ? opts.join(',') : ''

    return {
      id: String(f.id),
      name: f.name,
      label: f.name,
      displayLabel: f.name,
      type: f.type,
      settings: {
        general: { size: 'col-6', visibility: 'NORMAL', tooltip: '' },
        validation: { fieldRule: f.isMandatory ? 'REQUIRED' : 'OPTIONAL', enableSettings: [], mandatorySettings: [] },
        specific: { customOptions, textContent: '', tableColumns: [] },
      },
    }
  })

  return [
    {
      id: 'panel-fallback-1',
      settings: { title: 'Application', description: 'Fill out your details.' },
      fields,
    },
  ]
}

export default function ApplicationFormPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const transactionId = searchParams.get('tid')
  const processId = searchParams.get('pid')

  const userData = useRef(null)
  const inboxDataAll = useRef(null)
  const [activityId, setActivityId] = useState(null)

  const formJson = useMemo(() => {
    try {
      const formSession = sessionStorage.getItem('formDetails')
      const formData = formSession ? JSON.parse(formSession) : null
      const raw = formData?.formJson
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const panels = useMemo(() => {
    const list = formJson?.panels
    if (Array.isArray(list) && list.length) return list
    return buildFallbackPanelsFromSample()
  }, [formJson])

  const allFields = useMemo(
    () =>
      panels.flatMap((p) =>
        Array.isArray(p.fields)
          ? p.fields.map((f) => ({
              ...f,
              panelId: p.id,
            }))
          : [],
      ),
    [panels],
  )

  const allFieldsById = useMemo(() => {
    const m = new Map()
    allFields.forEach((f) => m.set(f.id, f))
    return m
  }, [allFields])

  const getFieldById = useCallback((id) => allFieldsById.get(id), [allFieldsById])

  const [valuesById, setValuesById] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [animDirection, setAnimDirection] = useState(0)
  const [stepErrors, setStepErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [userDefaultsSeed, setUserDefaultsSeed] = useState(0)

  const [secureControls, setSecureControls] = useState([])
  const parentComponentChangeEvents = useRef({})

  // Dropdown options cache: key -> { status, options, error }
  const [dropdownState, setDropdownState] = useState({})

  const setDropdown = useCallback((key, next) => {
    setDropdownState((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), ...next } }))
  }, [])

  const allControls = useMemo(() => {
    const out = []
    for (const f of allFields) {
      out.push(f)
      if (String(f?.type || '').toUpperCase() === 'TABLE') {
        const cols = f?.settings?.specific?.tableColumns
        if (Array.isArray(cols)) out.push(...cols)
      }
    }
    return out
  }, [allFields])

  useEffect(() => {
    // Resolve secure controls from workflow session (supports "WorkFlowDetails" + activity block)
    try {
      const raw =
        sessionStorage.getItem('WorkFlowDetails') ||
        sessionStorage.getItem('workflowSession') ||
        sessionStorage.getItem('workflowDetails') ||
        sessionStorage.getItem('workflow')
      const obj = raw ? JSON.parse(raw) : null

      // If we have flowJson + blocks (WorkFlowDetails style), pick the block by activityId.
      const flowJsonRaw = obj?.flowJson
      if (flowJsonRaw) {
        const parsed = JSON.parse(flowJsonRaw)
        const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks : []
        const block = activityId
          ? blocks.find((b) => String(b?.id) === String(activityId))
          : blocks[0]
        const list =
          block?.settings?.formSecureControls ||
          block?.settings?.secureControls ||
          obj?.settings?.formSecureControls ||
          obj?.settings?.secureControls ||
          []
        setSecureControls(Array.isArray(list) ? list : [])
        return
      }

      // Fallback: simple list stored at workflow root
      const list =
        obj?.secureControls ||
        obj?.formSecureControls ||
        obj?.workflowSession?.secureControls ||
        obj?.workflowSession?.formSecureControls ||
        []
      setSecureControls(Array.isArray(list) ? list : [])
    } catch {
      setSecureControls([])
    }
  }, [activityId])

  useEffect(() => {
    // Build parent->children change events (for cascading dropdowns/resets)
    const map = {}
    for (const field of allControls) {
      const specific = field?.settings?.specific || {}
      const parentId =
        specific.masterFormParentColumn ||
        specific.repositoryFieldParent ||
        specific.parentDateField ||
        specific.parentOptionField
      if (!parentId) continue
      if (!map[parentId]) map[parentId] = []
      if (!map[parentId].includes(field.id)) map[parentId].push(field.id)
    }
    parentComponentChangeEvents.current = map
  }, [allControls])

  const visibilityMap = useMemo(() => {
    return computeVisibilityMap({
      controls: allControls,
      values: valuesById,
      secureControls,
    })
  }, [allControls, valuesById, secureControls])

  const clearDropdownCacheForField = useCallback((fieldId) => {
    setDropdownState((prev) => {
      const prefix = `${fieldId}::`
      const keys = Object.keys(prev)
      let changed = false
      const next = { ...prev }
      for (const k of keys) {
        if (k === fieldId || k.startsWith(prefix)) {
          delete next[k]
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [])

  const setFieldValue = useCallback(
    (fieldId, nextValue) => {
      setValuesById((prev) => {
        const next = { ...prev, [fieldId]: nextValue }

        // Reset children when a parent changes (cascading dropdowns)
        const reset = (parentId) => {
          const children = parentComponentChangeEvents.current?.[parentId] || []
          for (const childId of children) {
            if (Object.prototype.hasOwnProperty.call(next, childId)) delete next[childId]
            clearDropdownCacheForField(childId)
            reset(childId)
          }
        }
        reset(fieldId)

        // Clear values for hidden controls immediately
        const vis = computeVisibilityMap({
          controls: allControls,
          values: next,
          secureControls,
        })
        for (const id of Object.keys(next)) {
          if (vis[id] === false) {
            delete next[id]
            clearDropdownCacheForField(id)
          }
        }

        return next
      })
    },
    [allControls, secureControls, clearDropdownCacheForField],
  )

  // Safety net: if values are updated outside setFieldValue (defaults/inbox), prune hidden values
  useEffect(() => {
    const hiddenIds = Object.keys(valuesById).filter((id) => visibilityMap[id] === false)
    if (hiddenIds.length === 0) return

    setValuesById((prev) => {
      const next = { ...prev }
      let changed = false
      for (const id of hiddenIds) {
        if (Object.prototype.hasOwnProperty.call(next, id)) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })

    setStepErrors((prev) => {
      const next = { ...prev }
      let changed = false
      for (const id of hiddenIds) {
        if (Object.prototype.hasOwnProperty.call(next, id)) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : prev
    })

    hiddenIds.forEach(clearDropdownCacheForField)
  }, [valuesById, visibilityMap, clearDropdownCacheForField])

  const mainEmailFieldId = useMemo(() => {
    const emailFields = allFields.filter(
      (f) => String(f?.settings?.validation?.contentRule || '').toUpperCase() === 'EMAIL',
    )
    const preferred = emailFields.find(
      (f) => !/co-applicant/i.test(getLabelText(f)) && normalizeName(getLabelText(f)).toLowerCase() === 'email',
    )
    const fallback = emailFields.find((f) => !/co-applicant/i.test(getLabelText(f)))
    return preferred?.id || fallback?.id || ''
  }, [allFields])

  const mainApplicantEmail = useMemo(() => {
    if (!mainEmailFieldId) return ''
    const raw = valuesById[mainEmailFieldId]
    if (!raw) return ''
    const parsed = safeJsonParse(raw)
    if (parsed && typeof parsed === 'object') return String(parsed.value || '').trim()
    return String(raw || '').trim()
  }, [mainEmailFieldId, valuesById])

  const handleLookupPayload = useCallback(
    (payload) => {
      if (!payload) return
      const city = payload.City
      const province = payload.Province
      const postal = payload.PostalCode

      setValuesById((prev) => {
        const next = { ...prev }
        const candidates = allFields.filter((f) => {
          const t = normalizeName(getLabelText(f)).toLowerCase()
          return t.includes('city') || t.includes('province') || t.includes('postal')
        })

        for (const f of candidates) {
          const t = normalizeName(getLabelText(f)).toLowerCase()
          if (t.includes('city') && city && !next[f.id]) next[f.id] = city
          if (t.includes('province') && province && !next[f.id]) next[f.id] = province
          if (t.includes('postal') && postal && !next[f.id]) next[f.id] = postal
        }

        const vis = computeVisibilityMap({
          controls: allControls,
          values: next,
          secureControls,
        })
        for (const id of Object.keys(next)) {
          if (vis[id] === false) delete next[id]
        }
        return next
      })
    },
    [allFields, allControls, secureControls],
  )

  const loadDropdownOptions = useCallback(
    async (field, valuesSnapshot) => {
      const type = getOptionsType(field)
      const key = optionsKey(field, valuesSnapshot)
      const existing = dropdownState[key]
      if (existing?.status === 'ready' || existing?.status === 'loading') return

      setDropdown(key, { status: 'loading', options: [] })

      try {
        let opts = []

        if (type === 'EXISTING') {
          const wFormId = field?.settings?.specific?.wFormId || field?.settings?.specific?.masterFormId || 0
          const payload = { column: field.id, keyword: '', rowFrom: 0, rowCount: 0 }
          opts = await getUniqueColumnValues(wFormId, payload)
        } else if (type === 'MASTER') {
          const wFormId = field?.settings?.specific?.masterFormId || 0
          const col = field?.settings?.specific?.masterFormColumn || field.id
          const parentId = field?.settings?.specific?.masterFormParentColumn
          const parentVal = parentId ? valuesSnapshot?.[parentId] : ''
          const payload = parentVal
            ? {
                column: col,
                keyword: '',
                rowFrom: 0,
                rowCount: 0,
                filters: [
                  {
                    criteria: field?.settings?.specific?.masterFormParentColumn,
                    condition: 'IS_EQUALS_TO',
                    value: parentVal,
                    dataType: '',
                  },
                ],
              }
            : { column: col, keyword: '', rowFrom: 0, rowCount: 0 }
          opts = await getUniqueColumnValues(wFormId, payload)
        } else if (type === 'REPOSITORY') {
          const repoId = field?.settings?.specific?.repositoryId || 0
          const repoField = field?.settings?.specific?.repositoryField || field.id
          const parentId = field?.settings?.specific?.repositoryFieldParent
          if (parentId) {
            const parentVal = valuesSnapshot?.[parentId]
            const payload = {
              column: repoField,
              keyword: '',
              rowFrom: 0,
              rowCount: 0,
              filters: parentVal
                ? [
                    {
                      criteria: parentId,
                      condition: 'IS_EQUALS_TO',
                      value: parentVal,
                      dataType: '',
                      fieldId: parentId,
                    },
                  ]
                : [],
            }
            opts = await getUniqueColumnsFromParentRepository(repoId, payload)
          } else {
            opts = await getUniqueColumnsRepository(repoField, repoId)
          }
        } else if (type === 'PREDEFINED' && field?.settings?.specific?.predefinedTable === 'User') {
          opts = await getUserList({ criteria: 'userType', value: 'Normal' })
        } else {
          // CUSTOM / PREDEFINED list stored in settings
          opts = getOptions(field)
        }

        setDropdown(key, { status: 'ready', options: Array.isArray(opts) ? opts : [] })
      } catch {
        setDropdown(key, { status: 'error', error: 'Server error!', options: [] })
      }
    },
    [dropdownState, setDropdown],
  )

  const visibleFormControl = useCallback(
    (fieldId) => {
      if (visibilityMap && Object.prototype.hasOwnProperty.call(visibilityMap, fieldId)) {
        return visibilityMap[fieldId] !== false
      }
      const componentData = getFieldById(fieldId)
      if (String(componentData?.settings?.general?.visibility || '').toUpperCase() === 'DISABLE') return false
      if (Array.isArray(secureControls) && secureControls.includes(fieldId)) return false
      return true
    },
    [visibilityMap, getFieldById, secureControls],
  )

  // Mandatory: base fieldRule + mandatorySettings conditions
  const isMandatoryField = (fieldId, values) => {
    const field = getFieldById(fieldId)
    if (!field) return false
    let required = String(field.settings?.validation?.fieldRule || '').toUpperCase() === 'REQUIRED'

    for (const f of allFields) {
      const mandatorySettings = f?.settings?.validation?.mandatorySettings || []
      mandatorySettings.forEach((setting) => {
        const controls = setting?.controls || []
        if (!controls.includes(fieldId)) return
        const expected = setting.value
        const val = values[f.id]
        const match = Array.isArray(val) ? val?.includes?.(expected) : val == expected
        if (match) required = true
      })
    }

    if (!visibleFormControl(fieldId)) return false
    return required
  }

  // Defaults from field settings (subset of your logic)
  const pad2 = (n) => String(n).padStart(2, '0')
  const formatDateYMD = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  const formatTime12 = (d) => {
    const hh24 = d.getHours()
    const mm = pad2(d.getMinutes())
    const ampm = hh24 >= 12 ? 'pm' : 'am'
    const hh12 = hh24 % 12 || 12
    return `${pad2(hh12)}:${mm} ${ampm}`
  }

  const getAutoGenerateValue = (field) => {
    // Placeholder for your backend-specific auto-generate logic.
    // Safe deterministic-ish default for demo:
    return `AUTO_${String(field?.id || 'FIELD')}_${Date.now()}`
  }

  const getInputDefaultValues = (field) => {
    const specific = field?.settings?.specific ?? {}

    // 1) customDefaultValue (match your production behavior)
    if (specific.customDefaultValue != null && specific.customDefaultValue !== '') {
      const type = String(field?.type || '').toUpperCase()
      if (type === 'PHONE_NUMBER') return ''
      if (type === 'CURRENCY_AMOUNT') return ''
      return specific.customDefaultValue?.toString?.() ?? String(specific.customDefaultValue)
    }

    // 2) named defaults (USER_NAME/USER_EMAIL/etc)
    let user = null
    try {
      const raw = sessionStorage.getItem('userDetails')
      user = raw ? JSON.parse(raw) : null
    } catch {
      user = null
    }

    if (specific.defaultValue === 'USER_NAME') {
      const first = String(user?.firstName || '').trim()
      const last = String(user?.lastName || '').trim()
      return `${first} ${last}`.trim() || null
    }
    if (specific.defaultValue === 'USER_EMAIL') {
      return user?.email ? String(user.email).trim() : null
    }

    // 3) date/time defaults (moment-free)
    const now = new Date()
    if (specific.defaultValue === 'CURRENT_DATE') return formatDateYMD(now)
    if (specific.defaultValue === 'CURRENT_TIME') return formatTime12(now) // "hh:mm a"
    if (specific.defaultValue === 'CURRENT_DATE_TIME') return `${formatDateYMD(now)} ${formatTime12(now)}`

    // 4) auto-generate
    if (specific.defaultValue === 'AUTO_GENERATE') return getAutoGenerateValue(field)

    return null
  }

  useEffect(() => {
    if (!allFields.length) return
    const defaults = {}
    allFields.forEach((f) => {
      const v = getInputDefaultValues(f)
      if (v !== null && v !== undefined) defaults[f.id] = v
    })
    if (Object.keys(defaults).length) setValuesById((p) => ({ ...defaults, ...p }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFields.length, userDefaultsSeed])

  // Load existing values if tid/pid exist
  useEffect(() => {
    if (!transactionId || !processId) return
    let workflowId = ''
    try {
      const portalRaw = sessionStorage.getItem('portalDetails')
      const portalDetails = portalRaw ? JSON.parse(portalRaw) : null
      workflowId = portalDetails?.workflowId || ''
    } catch {
      workflowId = ''
    }

    const fetchInbox = async () => {
      setLoading(true)
      try {
        const inboxData = await getInboxItem(workflowId, processId, transactionId)
        inboxDataAll.current = inboxData
        setActivityId(inboxData?.activityId ?? null)

        const inboxFields = inboxData?.formData?.fields || {}
        if (inboxFields && typeof inboxFields === 'object') {
          // Merge inbox values
          setValuesById((prev) => ({ ...prev, ...inboxFields }))

          // Your extra logic: set role based on who raised the inbox item.
          try {
            const userRaw = sessionStorage.getItem('userDetails')
            if (userRaw) userData.current = JSON.parse(userRaw)
          } catch {
            userData.current = null
          }
          setUserDefaultsSeed((s) => s + 1)

          const currentUserEmail = userData.current?.email
          const raisedByEmail = inboxData?.raisedBy
          const roleKey = 'uLtgR0XSazvt0CC6bK0l8'
          const updatedFields = { ...inboxFields }

          if (currentUserEmail && raisedByEmail && currentUserEmail === raisedByEmail) {
            updatedFields[roleKey] = 'Primary'
          } else if (currentUserEmail && raisedByEmail && currentUserEmail !== raisedByEmail) {
            updatedFields[roleKey] = 'Coapplicant'
          }

          setValuesById((prev) => ({ ...prev, ...updatedFields }))
        }
      } catch {
        // ignore in demo mode
      } finally {
        setLoading(false)
      }
    }

    fetchInbox()
  }, [transactionId, processId])

  const visiblePanels = useMemo(() => {
    return panels.filter((panel) => {
      const panelFields = Array.isArray(panel.fields) ? panel.fields : []
      return panelFields.some((f) => visibleFormControl(f.id))
    })
  }, [panels, visibleFormControl])

  const currentPanel = visiblePanels[currentStep] ?? visiblePanels[0]

  const validateCurrentPanel = () => {
    if (!currentPanel) return true
    const panelFields = Array.isArray(currentPanel.fields) ? currentPanel.fields : []
    const errors = {}
    panelFields.forEach((field) => {
      if (!visibleFormControl(field.id)) return
      if (!isMandatoryField(field.id, valuesById)) return
      const v = valuesById[field.id]
      const empty =
        v === null ||
        v === undefined ||
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0)
      if (empty) errors[field.id] = `${getLabelText(field) || 'Field'} is required`
    })
    setStepErrors(errors)
    return Object.keys(errors).length === 0
  }

  const goNext = () => {
    if (!validateCurrentPanel()) return
    setAnimDirection(1)
    setCurrentStep((prev) => (prev + 1 < visiblePanels.length ? prev + 1 : prev))
  }

  const goBack = () => {
    setAnimDirection(-1)
    setCurrentStep((prev) => (prev - 1 >= 0 ? prev - 1 : prev))
  }

  if (loading) return <LoadingPage />
  if (!currentPanel) return null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl gap-8 px-5 pb-16 pt-8">
        <aside className="hidden w-64 flex-shrink-0 flex-col rounded-2xl bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 lg:flex">
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Your Application Progress
            </div>
          </div>
          <ol className="space-y-3">
            {visiblePanels.map((panel, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              return (
                <li key={panel.id}>
                  <button
                    type="button"
                    className={cx(
                      'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition',
                      isActive
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
                    )}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div
                      className={cx(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                        {panel?.settings?.title || `Step ${index + 1}`}
                      </span>
                      {panel?.settings?.description ? (
                        <span className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                          {panel.settings.description}
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        </aside>

        <div className="flex-1">
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
              {currentPanel?.settings?.title || 'Application'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {currentPanel?.settings?.description ||
                'Tell us a bit about yourself so we can personalize your mortgage experience.'}
            </p>
          </div>

          <form
            className="mt-8 space-y-8"
            onSubmit={(e) => {
              e.preventDefault()
              if (!validateCurrentPanel()) return
              console.log('Form submit:', valuesById)
            }}
          >
            <div
              className={cx(
                'rounded-2xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 transition-all duration-300',
                animDirection === 1
                  ? 'translate-x-2 opacity-100'
                  : animDirection === -1
                    ? '-translate-x-2 opacity-100'
                    : 'opacity-100',
              )}
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
                {(Array.isArray(currentPanel.fields) ? currentPanel.fields : []).map((field) => {
                  if (!visibleFormControl(field.id)) return null

                  const required = isMandatoryField(field.id, valuesById)
                  const col = getColSpanClass(field)
                  const type = String(field.type || '').toUpperCase()

                  // Attach resolved dropdown options (like your defaultDropDownValues cache).
                  const t = String(type)
                  if (t === 'SINGLE_SELECT' || t === 'MULTI_SELECT') {
                    const key = optionsKey(field, valuesById)
                    const cached = dropdownState[key]
                    const needsLoad = getOptionsType(field) !== 'CUSTOM' && cached?.status !== 'ready'
                    if (needsLoad) {
                      // fire-and-forget; state updates asynchronously
                      loadDropdownOptions(field, valuesById)
                    }
                    field = {
                      ...field,
                      __resolvedOptions: cached?.options,
                      __optionsLoading: cached?.status === 'loading' || (!cached && getOptionsType(field) !== 'CUSTOM'),
                    }
                  }

                  if (type === 'TABLE') {
                    const children =
                      field?.settings?.specific?.tableColumns ||
                      field?.settings?.specific?.tableColumns?.columns ||
                      []
                    const childrenFields = Array.isArray(children) ? children : []
                    return (
                      <div key={field.id} className="sm:col-span-12">
                        <TableField
                          tableField={field}
                          childrenFields={childrenFields}
                          value={valuesById[field.id]}
                          onChange={(v) => setFieldValue(field.id, v)}
                          required={required}
                        />
                      </div>
                    )
                  }

                  return (
                    <div key={field.id} className={col}>
                      <FieldRenderer
                        field={field}
                        value={valuesById[field.id]}
                        onChange={(v) => setFieldValue(field.id, v)}
                        required={required}
                        hideLabel={false}
                        error={stepErrors[field.id]}
                        mainApplicantEmail={mainApplicantEmail}
                        onLookupPayload={handleLookupPayload}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 0}
                className={cx(
                  'rounded-xl border px-5 py-3 text-sm font-semibold transition',
                  currentStep === 0
                    ? 'border-slate-200 text-slate-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                Back
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setValuesById({})
                    setStepErrors({})
                    setDropdownState({})
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!validateCurrentPanel()) return
                    if (currentStep === visiblePanels.length - 1) {
                      console.log('Final submit:', valuesById)
                    } else {
                      goNext()
                    }
                  }}
                  className="rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 shadow-[0_12px_24px_rgba(245,158,11,0.30)] hover:bg-amber-300"
                >
                  {currentStep === visiblePanels.length - 1 ? 'Save' : 'Save & Continue'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

