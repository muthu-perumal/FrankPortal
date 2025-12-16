export default function LoadingPage({ title = 'Loading', subtitle = 'Please wait…' }) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="grid place-items-center">
        {/* Neon “home” loader (animated stroke + moving gradient) */}
        <svg viewBox="0 0 220 140" className="h-36 w-72" aria-hidden="true">
          <defs>
            <linearGradient
              id="fpNeonMove"
              x1="-120"
              y1="0"
              x2="120"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#60a5fa" stopOpacity="1" />
              <stop offset="60%" stopColor="#a78bfa" stopOpacity="1" />
              <stop offset="85%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              <animateTransform
                attributeName="gradientTransform"
                type="translate"
                from="-140 0"
                to="300 0"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </linearGradient>
          </defs>

          {/* soft glow underlay */}
          <path
            d="M52 64 110 20l58 44v56a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10V64Z"
            fill="none"
            stroke="rgba(59,130,246,0.18)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="fp-neon-glow"
            opacity="0.55"
          />

          {/* main outline */}
          <path
            d="M52 64 110 20l58 44v56a10 10 0 0 1-10 10H62a10 10 0 0 1-10-10V64Z"
            fill="none"
            stroke="url(#fpNeonMove)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="fp-neon-stroke fp-neon-glow"
          />

          {/* door */}
          <path
            d="M96 130V94a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v36"
            fill="none"
            stroke="url(#fpNeonMove)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="fp-neon-stroke fp-neon-glow"
            style={{ animationDelay: '0.1s' }}
          />
        </svg>

        <div className="mt-5 text-center">
          <div className="text-sm font-semibold text-slate-700">{title}…</div>
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

