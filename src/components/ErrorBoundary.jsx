import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    if (window.confirm("Do you want to reset cached application data to defaults?")) {
      const preserveKeys = ['zoxs_custom_firebase_config'];
      const backups = {};
      preserveKeys.forEach(k => {
        backups[k] = localStorage.getItem(k);
      });
      localStorage.clear();
      preserveKeys.forEach(k => {
        if (backups[k]) localStorage.setItem(k, backups[k]);
      });
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="text-3xl">⚠️</span>
              <div>
                <h1 className="text-xl font-bold font-['Outfit']">Dik lo a awm / Application Error</h1>
                <p className="text-xs text-slate-400">An unexpected error interrupted rendering.</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-rose-300 overflow-auto max-h-48 whitespace-pre-wrap">
              {this.state.error?.toString() || 'Unknown error'}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
              >
                Tih nawn / Reload Page
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition"
              >
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
