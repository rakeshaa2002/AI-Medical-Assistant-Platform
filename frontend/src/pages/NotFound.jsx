import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to dashboard</Link>
    </div>
  )
}
