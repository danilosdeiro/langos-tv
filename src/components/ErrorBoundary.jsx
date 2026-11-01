import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.handleReset)
          : this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/90 rounded-2xl border border-red-500/20 m-4">
          <AlertTriangle className="text-amber-400 mb-3" size={36} />
          <h3 className="text-white font-bold text-base mb-1">Ops! Ocorreu um problema nesta área.</h3>
          <p className="text-zinc-400 text-xs mb-4 max-w-md">
            O aplicativo continua funcionando. Você pode tentar recarregar esta seção.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg"
          >
            <RefreshCw size={14} />
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
