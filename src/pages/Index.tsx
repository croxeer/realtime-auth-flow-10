import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/components/AuthPage';
import { Dashboard } from '@/components/Dashboard';

// Componente de erro fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-bg p-4">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2 text-destructive">Erro na Interface</h1>
      <p className="text-muted-foreground mb-4">
        Ocorreu um erro inesperado. Por favor, recarregue a página.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
      >
        Recarregar Página
      </button>
      <details className="mt-4 text-xs text-muted-foreground">
        <summary>Detalhes do erro (para desenvolvedores)</summary>
        <pre className="mt-2 p-2 bg-secondary rounded text-left overflow-auto">
          {error.message}
        </pre>
      </details>
    </div>
  </div>
);

// Componente de boundary para capturar erros
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Erro capturado pelo ErrorBoundary:', error);
    console.error('📍 Info do erro:', errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const Index = () => {
  const { user, isLoading } = useAuth();

  console.log('🔍 Index - Estado atual:', { user: user?.name, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {user ? <Dashboard /> : <AuthPage />}
    </ErrorBoundary>
  );
};

export default Index;
