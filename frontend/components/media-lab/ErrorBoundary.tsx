'use client';

import React, { ReactNode, Component, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches React component errors and displays fallback UI
 * Prevents entire app from crashing due to one component error
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error) || (
          <div className="p-6 bg-gradient-to-b from-red-950 to-red-900 rounded-lg border border-red-700 text-red-100">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Something went wrong</h3>
                <p className="text-xs text-red-200 mb-3">{this.state.error.message}</p>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="text-xs px-3 py-1 bg-red-800 hover:bg-red-700 rounded transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

interface SafeComponentProps {
  children: ReactNode;
  errorMessage?: string;
}

/**
 * SafeComponent - Wraps children with error boundary
 * Useful for isolated component protection
 */
export function SafeComponent({ children, errorMessage }: SafeComponentProps) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            {errorMessage || 'Component error: '} {error.message}
          </p>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
