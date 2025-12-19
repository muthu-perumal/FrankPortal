import { useMemo, useState } from 'react'
import SearchableSelect from './SearchableSelect'

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

const DEFAULT_CURRENCIES = [
  { code: 'CAD', symbol: '$', flag: 'CA', label: 'Canada (CAD $)' },
  { code: 'USD', symbol: '$', flag: 'US', label: 'United States (USD $)' },
  { code: 'EUR', symbol: '€', flag: 'EU', label: 'Euro (EUR €)' },
  { code: 'GBP', symbol: '£', flag: 'GB', label: 'United Kingdom (GBP £)' },
  { code: 'INR', symbol: '₹', flag: 'IN', label: 'India (INR ₹)' },
  { code: 'AUD', symbol: '$', flag: 'AU', label: 'Australia (AUD $)' },
]

function normalizeAllowed(allowed) {
  if (!Array.isArray(allowed) || allowed.length === 0) return null
  return new Set(allowed.map((x) => String(x)))
}

function currencyKey(opt) {
  // You can match either "CAD", "$", or "CAD$" types of lists.
  return `${opt.code}${opt.symbol}`
}

function formatAmountWithCommas(raw) {
  const s = String(raw ?? '')
  if (!s) return ''
  const [intPartRaw, decPartRaw] = s.split('.')
  const intPart = String(intPartRaw || '').replace(/^0+(?=\d)/, '0')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  if (decPartRaw === undefined) return withCommas
  return `${withCommas}.${decPartRaw}`
}

function cleanNumericInput(next) {
  const raw = String(next ?? '')
  const cleaned = raw.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  const intPart = parts[0] ?? ''
  const decPart = parts.length > 1 ? parts.slice(1).join('') : ''
  const oneDot = parts.length > 1 ? `${intPart}.${decPart}` : intPart
  return oneDot
}

function isLeadingZeroInvalid(raw) {
  // Reject "01", "00" etc. Allow "0" and "0." and "0.1"
  return /^0[0-9]+/.test(raw)
}

export default function CurrencyAmountInput({
  field,
  value,
  onChange,
  disabled = false,
  required = false,
  onValidationError,
}) {
  const parsed = useMemo(() => safeJsonParse(value), [value])
  const specific = field?.settings?.specific || {}
  const allowed = normalizeAllowed(specific?.specificCurrencyOptions)

  const currencyOptions = useMemo(() => {
    let list = DEFAULT_CURRENCIES.slice()
    if (allowed) {
      list = list.filter((opt) => allowed.has(opt.code) || allowed.has(opt.symbol) || allowed.has(currencyKey(opt)))
    }
    list.sort((a, b) => a.label.localeCompare(b.label))
    return list
  }, [allowed])

  const initialCurrency =
    parsed?.code && parsed?.symbol
      ? currencyKey({ code: parsed.code, symbol: parsed.symbol })
      : String(parsed?.currency || '')

  const selected =
    currencyOptions.find((c) => currencyKey(c) === initialCurrency || c.code === initialCurrency) || currencyOptions[0]

  const [localError, setLocalError] = useState('')
  const amountRaw = String(parsed?.value ?? '')
  const displaySymbol = selected?.symbol || parsed?.symbol || '$'

  const commit = (nextCurrency, nextAmountRaw) => {
    const opt = currencyOptions.find((c) => currencyKey(c) === nextCurrency || c.code === nextCurrency) || selected

    const payload = {
      code: opt?.code || '',
      symbol: opt?.symbol || '',
      currency: currencyKey(opt || { code: '', symbol: '' }),
      cName: opt?.label || '',
      flag: opt?.flag || '',
      value: String(nextAmountRaw ?? ''),
    }
    onChange(JSON.stringify(payload))
  }

  const validate = (nextAmountRaw) => {
    if (!required) {
      setLocalError('')
      onValidationError?.('')
      return
    }
    if (!nextAmountRaw) {
      const msg = `${field?.displayLabel || field?.label || 'Field'} is required`
      setLocalError(msg)
      onValidationError?.(msg)
      return
    }
    setLocalError('')
    onValidationError?.('')
  }

  const showCurrencySelect = currencyOptions.length >= 2

  return (
    <div>
      <div className={cx('grid gap-3', showCurrencySelect ? 'grid-cols-12' : '')}>
        {showCurrencySelect ? (
          <div className="col-span-5">
            <SearchableSelect
              disabled={disabled}
              value={selected ? `${selected.flag} ${selected.label}` : ''}
              options={currencyOptions.map((c) => `${c.flag} ${c.label}`)}
              onChange={(label) => {
                const next = currencyOptions.find((c) => `${c.flag} ${c.label}` === label) || selected
                commit(currencyKey(next), amountRaw)
              }}
              placeholder="Select currency…"
            />
          </div>
        ) : null}

        <div className={showCurrencySelect ? 'col-span-7' : ''}>
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              {displaySymbol}
            </div>
            <input
              disabled={disabled}
              value={amountRaw ? formatAmountWithCommas(amountRaw) : ''}
              placeholder={field?.settings?.general?.placeholder || '0.00'}
              inputMode="decimal"
              onChange={(e) => {
                const next = cleanNumericInput(e.target.value)

                // max digits (excluding dot)
                const digitsOnly = next.replace(/\./g, '')
                if (digitsOnly.length > 15) return
                if (isLeadingZeroInvalid(next)) return

                commit(currencyKey(selected || currencyOptions[0] || DEFAULT_CURRENCIES[0]), next)
                validate(next)
              }}
              onBlur={() => validate(amountRaw)}
              className={cx(
                'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-8 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-500',
              )}
            />
          </div>
        </div>
      </div>

      {localError ? <p className="mt-1 text-xs font-medium text-red-500">{localError}</p> : null}
    </div>
  )
}

