'use client';

import { Component, ReactNode } from 'react';

export default class ErrorBoundary extends Component<{children: ReactNode, fallback?: ReactNode}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error metrics here instead of console
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white p-4 text-center">
          <div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
            <p className="text-gray-400">Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
