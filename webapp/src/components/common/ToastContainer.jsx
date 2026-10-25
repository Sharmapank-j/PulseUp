import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, onClose }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-white dark:bg-[#1A2235] border border-zinc-200 dark:border-white/[0.15] shadow-xl rounded-xl p-3.5 flex items-start gap-3 transition-all duration-300 transform translate-y-0"
        >
          <div className="flex-shrink-0 mt-0.5">
            {t.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-500" />
            ) : t.type === 'info' ? (
              <Info size={16} className="text-blue-500" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{t.title || 'Notification'}</p>
            {t.message && <p className="text-[11px] text-zinc-500 dark:text-[#94A3B8] mt-0.5">{t.message}</p>}
          </div>
          <button
            onClick={() => onClose(t.id)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
