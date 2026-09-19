import React from 'react';
import { History, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { CommandLogItem } from '../types';

interface CommandLogDrawerProps {
  logs: CommandLogItem[];
  onClearLogs: () => void;
  onRerunPrompt?: (prompt: string) => void;
}

export const CommandLogDrawer: React.FC<CommandLogDrawerProps> = ({
  logs,
  onClearLogs,
  onRerunPrompt,
}) => {
  return (
    <div className="mt-6 bg-gray-800/80 rounded-lg border border-gray-700/80 p-4 shadow-sm text-xs text-gray-300">
      <div className="flex items-center justify-between pb-3 border-b border-gray-700/60 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h4 className="font-semibold text-white">AI Command Activity Log</h4>
          <span className="text-[11px] px-2 py-0.2 rounded bg-gray-700 text-gray-300">
            {logs.length} runs
          </span>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500 italic py-2">
          AI command a la run lo. A chunga input box-ah khan command chhu lut la 'Run Prompt' hmet rawh le.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {logs.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded bg-gray-900/70 border border-gray-700/50 flex flex-col gap-1 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {item.success ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="font-mono text-gray-200 font-medium truncate max-w-xs sm:max-w-md">
                    "{item.prompt}"
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 shrink-0">
                  <span className="px-1.5 py-0.5 rounded bg-gray-800 text-indigo-300 border border-indigo-900/50">
                    {item.action}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>

              <div className="text-gray-400 text-[11px] pl-5 flex items-center justify-between">
                <span>{item.message}</span>
                {onRerunPrompt && (
                  <button
                    type="button"
                    onClick={() => onRerunPrompt(item.prompt)}
                    className="text-indigo-400 hover:text-indigo-300 underline text-[10px] shrink-0 ml-2"
                  >
                    Re-run
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
