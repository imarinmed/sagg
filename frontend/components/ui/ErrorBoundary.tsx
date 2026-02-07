"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@heroui/react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center bg-[var(--color-surface)]/30 border border-[var(--color-border)] rounded-xl backdrop-blur-sm">
          <div className="p-3 bg-red-500/10 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-heading text-[var(--color-text-primary)] mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md">
            {this.state.error?.message || "An unexpected error occurred while rendering this component."}
          </p>
          <Button
            variant="ghost"
            className="text-blue-400 hover:bg-blue-500/10 flex items-center gap-2"
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
