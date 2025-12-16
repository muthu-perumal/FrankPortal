import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setAuthed, isAuthed } from '../auth'
import { BrandMark } from '../components/BrandMark'

export default function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthed()) navigate('/home', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <BrandMark />

        <div className="mt-14 text-xl font-medium text-slate-900">
          Hello, User
        </div>

        <h1 className="mt-14 text-5xl font-extrabold tracking-tight text-slate-900">
          Welcome to Mortgage
        </h1>

        <p className="mt-10 max-w-3xl text-xl leading-relaxed text-slate-700">
          Let&apos;s initiate the Frank Mortgage process - we&apos;ll verify and
          provide the necessary details and approve your status as Frank
          Mortgage
        </p>

        <button
          type="button"
          onClick={() => {
            setAuthed(true)
            navigate('/home', { replace: true })
          }}
          className="mt-10 inline-flex items-center justify-center rounded-full bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          Auth0 Sign In
        </button>

        <div className="mt-14 max-w-3xl text-sm leading-relaxed text-slate-600">
          <p>
            By clicking &quot;Next&quot; you agree{' '}
            <a className="text-blue-600 underline" href="#">
              Terms of Service
            </a>{' '}
            and acknowledge you have read our{' '}
            <a className="text-blue-600 underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
          <p className="mt-4">
            By providing your phone number and clicking &quot;Next&quot;, you
            consent to receive text messages from frank mortgage. Text messages
            may be autodialed, and data rates may apply. The frequency of text
            messages varies. You may text STOP to cancel any time.
          </p>
        </div>
      </div>
    </div>
  )
}

