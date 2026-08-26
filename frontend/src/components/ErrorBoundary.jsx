import { Component } from 'react';

/**
 * ErrorBoundary — catches unhandled render errors anywhere in the component tree.
 * Wrap the app root (or individual sections) with this to show a fallback UI
 * instead of a blank white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Log to console in dev; hook into Sentry/LogRocket here in production
        console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h1 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 text-sm mb-6">
                            An unexpected error occurred. Please refresh the page.
                            If the problem persists, contact support.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                        {import.meta.env.DEV && (
                            <details className="mt-4 text-left">
                                <summary className="text-xs text-gray-400 cursor-pointer">Error Details (dev only)</summary>
                                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg overflow-auto max-h-40">
                                    {this.state.error?.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
