"use client";

import { useEffect } from "react";
import type { ToastMessage } from "@/lib/types";

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastMessage["type"], string> = {
  info: "ℹ️",
  success: "✅",
  error: "❌",
};

const COLORS: Record<ToastMessage["type"], string> = {
  info: "border-blue-500/50 bg-blue-950/80",
  success: "border-green-500/50 bg-green-950/80",
  error: "border-red-500/50 bg-red-950/80",
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl text-sm text-white animate-in slide-in-from-right-4 fade-in duration-300 ${COLORS[toast.type]}`}
    >
      <span>{ICONS[toast.type]}</span>
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white transition-colors flex-shrink-0 mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
