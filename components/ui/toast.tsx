'use client';

import { useToast, Toast, ToastType } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

export function ToastContainer() {
  const toasts = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border shadow-lg min-w-[300px] flex items-center justify-between animate-in slide-in-from-right',
        toastStyles[toast.type]
      )}
    >
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}
