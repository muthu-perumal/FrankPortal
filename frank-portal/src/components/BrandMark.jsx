function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function BrandMark({ className }) {
  return (
    <div className={cx('flex items-center gap-2', className)}>
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600/10 ring-1 ring-blue-700/10">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M6 19V8.2c0-.5.2-1 .6-1.3l4.8-3.6c.4-.3 1-.3 1.4 0l4.8 3.6c.4.3.6.8.6 1.3V19"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M10 19v-6h4v6"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold tracking-wide text-slate-700">
          FRANK
        </div>
        <div className="text-[10px] font-semibold tracking-wide text-slate-700">
          MORTGAGE
        </div>
      </div>
    </div>
  )
}

