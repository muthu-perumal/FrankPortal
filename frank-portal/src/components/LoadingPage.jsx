import { BrandMark } from './BrandMark'

export default function LoadingPage({ title = 'Loading', subtitle = 'Please wait…' }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-5 pt-8">
        <div className="rounded-2xl bg-white/80 px-6 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5 backdrop-blur">
          <div className="flex items-center justify-between">
            <BrandMark />
            <div className="text-xs font-semibold text-slate-500">Working…</div>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-xl rounded-2xl bg-white/90 p-8 shadow-[0_22px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5">
          <div className="text-lg font-extrabold tracking-tight text-slate-900">
            {title}
          </div>
          <div className="mt-2 text-sm text-slate-500">{subtitle}</div>

          <div className="mt-6 fp-progress-track">
            <div className="fp-progress-bar" />
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-blue-600/70" />
            Preparing your next step…
          </div>
        </div>
      </div>
    </div>
  )
}

