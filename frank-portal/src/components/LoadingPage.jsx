import { BrandMark } from './BrandMark'

export default function LoadingPage({ title = 'Loading', subtitle = 'Please wait…' }) {
  return (
    <div className="fp-loading-bg fp-vignette grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-3xl rounded-2xl bg-black/30 p-10 ring-1 ring-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="opacity-90">
            <BrandMark />
          </div>
          <div className="text-xs font-semibold text-slate-300/80">Loading…</div>
        </div>

        <div className="mt-12 grid place-items-center">
          {/* Neon “home” loader (animated stroke + glow) */}
          <svg
            viewBox="0 0 220 140"
            className="h-36 w-72"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="fpNeon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* soft background glow */}
            <path
              d="M52 64 110 20l58 44v56a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10V64Z"
              fill="none"
              stroke="rgba(59,130,246,0.22)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fp-neon-glow"
              opacity="0.5"
            />

            {/* main outline */}
            <path
              d="M52 64 110 20l58 44v56a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10V64Z"
              fill="none"
              stroke="url(#fpNeon)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fp-neon-stroke fp-neon-glow"
            />

            {/* door */}
            <path
              d="M96 130V94a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v36"
              fill="none"
              stroke="url(#fpNeon)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fp-neon-stroke fp-neon-glow"
              style={{ animationDelay: '0.1s' }}
            />
          </svg>

          <div className="mt-6 text-center">
            <div className="text-sm font-semibold text-slate-200">{title}…</div>
            <div className="mt-1 text-xs text-slate-400/80">{subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

