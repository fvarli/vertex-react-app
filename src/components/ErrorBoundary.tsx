import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="mx-auto max-w-xl rounded-2xl border border-border/70 bg-card/70 p-6 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Error</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted">
            An unexpected error occurred. Please reload the page to try again.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 dark:text-slate-950"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }
}
