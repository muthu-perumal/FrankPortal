import { useMemo } from 'react'

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

export default function EmailInviteInput({
  value,
  onChange,
  disabled = false,
  verificationRequired = false,
  mainApplicantEmail = '',
  isCoApplicant = false,
  onValidationError,
}) {
  const parsed = useMemo(() => safeJsonParse(value), [value])
  const email = verificationRequired ? String(parsed?.value ?? '') : String(value ?? parsed?.value ?? '')
  const verified = verificationRequired ? Boolean(parsed?.verify) : false

  const commit = (nextEmail, nextVerified) => {
    if (verificationRequired) {
      onChange(JSON.stringify({ value: nextEmail, verify: Boolean(nextVerified) }))
    } else {
      onChange(nextEmail)
    }
  }

  const validate = (nextEmail, nextVerified) => {
    if (!verificationRequired) return
    if (!isCoApplicant) return

    if (mainApplicantEmail && nextEmail && nextEmail.trim().toLowerCase() === mainApplicantEmail.trim().toLowerCase()) {
      onValidationError?.(
        'Co-applicant cannot use the same email as the main applicant. Please use a separate email for the co-applicant.',
      )
      return
    }
    if (!nextVerified) {
      onValidationError?.('Kindly Send Invite To Co-applicant')
      return
    }
    onValidationError?.('')
  }

  return (
    <div className="flex items-center gap-3">
      <input
        value={email}
        disabled={disabled}
        type="email"
        inputMode="email"
        placeholder=" "
        onChange={(e) => {
          const v = e.target.value.trimStart()
          commit(v, false)
          validate(v, false)
        }}
        onBlur={() => validate(email, verified)}
        className={cx(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
          disabled ? 'cursor-not-allowed bg-slate-50 text-slate-500' : '',
        )}
      />

      {verificationRequired ? (
        verified ? (
          <div className="flex h-10 items-center rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            Verified
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || !email}
            onClick={() => {
              commit(email, true)
              validate(email, true)
            }}
            className={cx(
              'h-10 whitespace-nowrap rounded-xl bg-amber-400 px-4 text-xs font-extrabold text-slate-900 shadow-[0_12px_20px_rgba(245,158,11,0.25)] hover:bg-amber-300',
              disabled || !email ? 'cursor-not-allowed opacity-60' : '',
            )}
          >
            Send Invite
          </button>
        )
      ) : null}
    </div>
  )
}

