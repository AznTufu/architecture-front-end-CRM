import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string | null;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue.';

    return {
      hasError: true,
      errorMessage,
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error('Erreur non geree dans l\'interface.', error, errorInfo);
  }

  private readonly handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="auth-page">
          <section className="auth-card" role="alert" aria-live="assertive">
            <h1>Une erreur est survenue</h1>
            <p>
              {this.state.errorMessage ??
                'Un probleme inattendu est apparu. Recharge la page pour continuer.'}
            </p>
            <button type="button" className="ghost-toggle" onClick={this.handleReset}>
              Reessayer
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}