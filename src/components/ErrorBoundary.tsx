import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-600/30 rounded-lg p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-400 mb-6">
              An unexpected error occurred. Please try refreshing the page or go
              back to the home page.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 p-3 bg-gray-700/50 rounded border border-gray-600/30">
                <summary className="text-sm text-gray-300 cursor-pointer mb-2">
                  Error Details
                </summary>
                <div className="text-xs text-gray-400 font-mono">
                  <p>
                    <strong>Message:</strong> {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <p>
                      <strong>Stack:</strong>{" "}
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
