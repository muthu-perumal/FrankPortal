import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuthed } from '../auth'
import { BrandMark } from '../components/BrandMark'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Icon({ children, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function PlusIcon({ className }) {
  return (
    <Icon className={className}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  )
}

function InfoIcon({ className }) {
  return (
    <Icon className={className}>
      <path
        d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 10.5v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </Icon>
  )
}

function EyeIcon({ className }) {
  return (
    <Icon className={className}>
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Icon>
  )
}

function UploadIcon({ className }) {
  return (
    <Icon className={className}>
      <path
        d="M12 16V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.5 9.5 12 6l3.5 3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18.5c1.4 1.7 3.6 2.5 7 2.5s5.6-.8 7-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Icon>
  )
}

function ChevronRightIcon({ className }) {
  return (
    <Icon className={className}>
      <path
        d="m10 7 5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}

function RocketArt({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(25 10)">
        <path
          d="M109 6c28 7 50 29 57 57-28 7-50 29-57 57-28-7-50-29-57-57C59 35 81 13 109 6Z"
          fill="#ff3b6a"
          opacity=".95"
        />
        <path
          d="M110 18c20 6 36 22 42 42-20 6-36 22-42 42-20-6-36-22-42-42 6-20 22-36 42-42Z"
          fill="#ff7aa0"
          opacity=".8"
        />
        <path
          d="M109 33c12 4 22 14 26 26-12 4-22 14-26 26-12-4-22-14-26-26 4-12 14-22 26-26Z"
          fill="#ffffff"
        />
        <path
          d="M143 91c7 2 14 8 16 15-7 2-14 8-16 15-7-2-14-8-16-15 2-7 9-13 16-15Z"
          fill="#ffb703"
          opacity=".9"
        />
        <circle cx="109" cy="59" r="12" fill="#60a5fa" opacity=".9" />
        <circle cx="109" cy="59" r="6" fill="#1d4ed8" opacity=".25" />
        <path
          d="M71 102c10 2 20 9 25 18-10 2-20 9-25 18-10-2-20-9-25-18 5-9 15-16 25-18Z"
          fill="#ffb703"
          opacity=".9"
        />
        <path
          d="M97 122c5 2 10 6 12 11-5 2-10 6-12 11-5-2-10-6-12-11 2-5 7-9 12-11Z"
          fill="#fb7185"
          opacity=".75"
        />
      </g>
    </svg>
  )
}

function TopHeader() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto mt-8 w-full max-w-5xl px-5">
      <div className="rounded-2xl bg-white/80 px-6 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 backdrop-blur">
        <div className="flex items-center justify-between">
          <BrandMark />
          <button
            type="button"
            onClick={() => {
              setAuthed(false)
              navigate('/', { replace: true })
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-5 text-center">
      <div className="mx-auto inline-flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-600/10">
          <span className="text-2xl" aria-hidden="true">
            🏡
          </span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Welcome Back!
        </h1>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500">
        Continue your journey to homeownership
      </p>
    </div>
  )
}

function PrimaryCard() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-5">
      <div className="relative overflow-hidden rounded-2xl bg-white/90 shadow-[0_22px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5">
        <div className="grid gap-8 p-8 sm:grid-cols-[1.35fr_0.65fr] sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Ready to get started?
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
              Begin your mortgage application journey in just a few minutes. Our
              streamlined process makes it easy to find the perfect mortgage
              for your dream home.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/application/new')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_24px_rgba(245,158,11,0.35)] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <PlusIcon className="h-4 w-4" />
                Start New Application
              </button>

              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-transparent px-2 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                <InfoIcon className="h-4 w-4" />
                How it Works
              </button>
            </div>
          </div>

          <div className="relative hidden sm:block">
            <RocketArt className="absolute right-0 top-1/2 h-40 w-56 -translate-y-1/2 drop-shadow-[0_18px_30px_rgba(15,23,42,0.15)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function formatMoney(amount) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `$${amount}`
  }
}

function StatusPill({ status }) {
  const map = {
    'In Progress': {
      bg: 'bg-blue-50',
      fg: 'text-blue-700',
    },
    Submitted: {
      bg: 'bg-emerald-50',
      fg: 'text-emerald-700',
    },
    Documents: {
      bg: 'bg-amber-50',
      fg: 'text-amber-700',
    },
  }
  const s = map[status] ?? map['In Progress']
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wide',
        s.bg,
        s.fg,
      )}
    >
      {status.toUpperCase()}
    </span>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-amber-50/60 px-3 py-2 text-xs ring-1 ring-amber-100">
      <div className="text-slate-500">{label}</div>
      <div className="font-extrabold text-slate-900">{value}</div>
    </div>
  )
}

function ProgressRow({ leftLabel, rightLabel, value }) {
  const pct = Math.max(0, Math.min(1, value))
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-900/5">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  )
}

function PrimaryActionButton({ children, IconLeft, IconRight }) {
  return (
    <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow-[0_10px_18px_rgba(245,158,11,0.28)] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
      {IconLeft ? <IconLeft className="h-4 w-4" /> : null}
      <span className="leading-none">{children}</span>
      {IconRight ? <IconRight className="h-4 w-4" /> : null}
    </button>
  )
}

function ApplicationCard({ app }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5">
      <div className="h-1 w-full bg-blue-600" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              {app.title}
            </div>
            <div className="mt-1 text-[10px] font-medium text-slate-400">
              {app.submittedText}
            </div>
          </div>
          <StatusPill status={app.status} />
        </div>

        <div className="mt-4 space-y-2">
          {app.rows.map((r) => (
            <StatRow key={r.label} label={r.label} value={r.value} />
          ))}
        </div>

        {app.progress ? (
          <ProgressRow
            leftLabel={app.progress.label}
            rightLabel={app.progress.right}
            value={app.progress.value}
          />
        ) : null}

        <PrimaryActionButton
          IconLeft={app.action.iconLeft}
          IconRight={app.action.iconRight}
        >
          {app.action.label}
        </PrimaryActionButton>

        <div className="mt-3 flex items-center justify-end">
          <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">
            <span className="sr-only">More actions</span>
            <Icon className="h-4 w-4">
              <path
                d="M12 6h.01M12 12h.01M12 18h.01"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </Icon>
          </button>
        </div>
      </div>
    </div>
  )
}

const TABS = ['All', 'In Progress', 'Submitted', 'Documents']

function Tabs({ value, onChange }) {
  return (
    <div className="inline-flex items-center rounded-xl bg-white/80 p-1 shadow-[0_12px_28px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 backdrop-blur">
      {TABS.map((t) => {
        const active = t === value
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={cx(
              'rounded-lg px-4 py-2 text-[11px] font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
              active
                ? 'bg-amber-200 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800',
            )}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

function ApplicationsSection() {
  const [tab, setTab] = useState('All')

  const apps = useMemo(
    () => [
      {
        title: 'Purchase Test',
        status: 'In Progress',
        submittedText: 'Started Nov 28, 2025',
        rows: [
          { label: 'Property Value', value: formatMoney(850000) },
          { label: 'Down Payment', value: formatMoney(170000) },
        ],
        progress: { label: 'Progress', right: '3 of 4 steps', value: 0.75 },
        action: {
          label: 'Continue Application',
          iconLeft: null,
          iconRight: ChevronRightIcon,
        },
      },
      {
        title: 'Test 45',
        status: 'Submitted',
        submittedText: 'Submitted Nov 22, 2025',
        rows: [
          { label: 'Property Value', value: formatMoney(675000) },
          { label: 'Mortgage Amount', value: formatMoney(540000) },
          { label: 'Selected Rate', value: '3.94%' },
        ],
        progress: null,
        action: {
          label: 'View Details',
          iconLeft: null,
          iconRight: EyeIcon,
        },
      },
      {
        title: 'dfadjfdasfa',
        status: 'Documents',
        submittedText: 'Started Nov 20, 2025',
        rows: [
          { label: 'Property Value', value: formatMoney(925000) },
          { label: 'Documents Needed', value: '3 items' },
        ],
        progress: { label: 'Documents', right: '2 of 5 uploaded', value: 0.4 },
        action: {
          label: 'Upload Documents',
          iconLeft: null,
          iconRight: UploadIcon,
        },
      },
    ],
    [],
  )

  const visible = useMemo(() => {
    if (tab === 'All') return apps
    return apps.filter((a) => a.status === tab)
  }, [apps, tab])

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl px-5 pb-16">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
          My Applications
        </h3>
        <Tabs value={tab} onChange={setTab} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((app) => (
          <ApplicationCard key={app.title} app={app} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TopHeader />
      <Hero />
      <PrimaryCard />
      <ApplicationsSection />
    </div>
  )
}

