import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('HireSense ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold text-xl flex items-center justify-center mx-auto">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-gray-900">Something went wrong</h2>
            <p className="text-xs text-gray-500">
              An unexpected render error occurred. Click below to reload the platform.
            </p>
            {this.state.error?.message && (
              <div className="bg-red-50 text-red-600 text-[11px] font-mono p-3 rounded-xl text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 rounded-xl shadow-sm transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
