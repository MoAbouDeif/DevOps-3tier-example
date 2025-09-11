import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something went wrong. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="calculate-btn">
              Refresh Page
            </button>
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error.toString()}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;