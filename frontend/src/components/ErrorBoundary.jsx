import { Component } from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

/**
 * Catches render-time errors anywhere in the subtree so a single broken
 * component doesn't blank the whole app. In dev the error is shown; in
 * production a friendly recovery screen is shown instead.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Hook for an error-reporting service (Sentry, etc.).
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ error: null })
    if (this.props.onReset) this.props.onReset()
  }

  render() {
    if (!this.state.error) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback(this.state.error, this.handleReset)
    }

    const isDev = import.meta.env.DEV
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
          <FiAlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          An unexpected error occurred while rendering this view. You can try again, and if it
          keeps happening please contact support.
        </p>
        {isDev && (
          <pre className="mt-4 max-w-xl overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-red-600 dark:bg-slate-800">
            {this.state.error?.message}
          </pre>
        )}
        <button onClick={this.handleReset} className="btn-primary mt-6">
          <FiRefreshCw size={16} /> Try again
        </button>
      </div>
    )
  }
}
