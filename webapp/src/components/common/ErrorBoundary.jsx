import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PulseUp Clinical Cockpit Telemetry Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[420px] w-full flex items-center justify-center p-6">
          <div className="clinical-card max-w-lg w-full p-6 text-center space-y-4 bg-white/95 dark:bg-[#111827]/95 border border-rose-500/30 rounded-2xl shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-500">
              <AlertTriangle size={28} />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                Clinical Telemetry Interruption
              </span>
              <h3 className="font-display font-black text-lg text-zinc-900 dark:text-zinc-100 mt-2">
                Workstation Exception Trapped
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                An isolated component error occurred during rendering. Your resident credentials, duty status, and session data remain safe in memory.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-100 dark:bg-black/40 rounded-xl text-left border border-zinc-200 dark:border-white/10 overflow-x-auto">
                <p className="text-[11px] font-mono font-semibold text-rose-600 dark:text-rose-400">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
              >
                <RefreshCw size={13} />
                <span>Recover Workstation</span>
              </button>
              {this.props.onNavigateHome && (
                <button
                  onClick={this.props.onNavigateHome}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl border border-zinc-200 dark:border-white/10 flex items-center gap-1.5 transition-colors"
                >
                  <Home size={13} />
                  <span>Return to Career Board</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
