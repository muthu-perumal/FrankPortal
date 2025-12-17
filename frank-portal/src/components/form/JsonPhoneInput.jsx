import { useMemo } from 'react'
import SearchableSelect from './SearchableSelect'

function safeJsonParse(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function cleanPhone(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 10)
}

function formatPhone(v) {
  const cleaned = cleanPhone(v)
  if (!cleaned) return ''
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}

const DEFAULT_COUNTRIES = [
  { label: 'Canada (+1)', code: '+1' },
  { label: 'United States (+1)', code: '+1' },
]

export default function JsonPhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder = ' ',
  countryOptions = DEFAULT_COUNTRIES,
}) {
  const parsed = useMemo(() => safeJsonParse(value), [value])
  const code = parsed?.code || '+1'
  const phoneNo = parsed?.phoneNo || ''

  const commit = (nextCode, nextPhone) => {
    const payload = {
      code: nextCode,
      phoneNo: cleanPhone(nextPhone),
      verified: Boolean(parsed?.verified) || false,
      otpOutput: parsed?.otpOutput || '',
    }
    onChange(JSON.stringify(payload))
  }

  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-5">
        <SearchableSelect
          disabled={disabled}
          value={countryOptions.find((x) => x.code === code)?.label || code}
          options={countryOptions.map((x) => x.label)}
          onChange={(label) => {
            const found = countryOptions.find((x) => x.label === label)
            const next = found?.code || code
            commit(next, phoneNo)
          }}
        />
      </div>
      <div className="col-span-7">
        <input
          disabled={disabled}
          value={formatPhone(phoneNo)}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value
            const cleaned = cleanPhone(raw)
            commit(code, cleaned)
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>
    </div>
  )
}

