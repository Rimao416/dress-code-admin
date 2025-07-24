// components/shared/GenericErrorBoundary.tsx
"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  errorMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GenericErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Vous pouvez envoyer l'erreur à un service comme Sentry ici
    console.error("Error caught in boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-red-600 font-medium mb-2">Une erreur est survenue</h2>
          <p className="text-gray-700 mb-4">
            {this.state.error?.message || this.props.errorMessage || "Impossible de charger les données."}
          </p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default GenericErrorBoundary;