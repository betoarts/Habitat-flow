import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50 dark:bg-gray-900">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4 animate-bounce">
                        <AlertTriangle size={32} className="text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ops! Algo deu errado.</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                        Ocorreu um erro ao carregar esta página. Tente recarregar para resolver.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs text-left w-full max-w-xs mb-6 overflow-auto max-h-32 text-red-500 font-mono">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                    >
                        <RefreshCw size={18} />
                        Recarregar App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
