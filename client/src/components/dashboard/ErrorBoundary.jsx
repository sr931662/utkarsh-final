import React from 'react';
import styles from './dashboard.module.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Component Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorFallback}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.toString()}</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo?.componentStack}
          </details>
          <button 
            onClick={this.handleReload}
            className={styles.reloadButton}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}