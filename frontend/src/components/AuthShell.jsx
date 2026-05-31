import { FiActivity } from 'react-icons/fi'

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary-600 to-teal-600 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <FiActivity size={28} />
          <span className="text-2xl font-bold">MedAssist</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Your AI-powered healthcare companion.
          </h1>
          <p className="mt-4 max-w-md text-primary-100">
            Chat with an AI health assistant, analyse your medical reports, and
            book appointments with trusted doctors — all in one place.
          </p>
        </div>
        <p className="text-sm text-primary-200">
          © {new Date().getFullYear()} MedAssist. For educational use only.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <FiActivity size={24} className="text-primary-600" />
            <span className="text-xl font-bold">MedAssist</span>
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
