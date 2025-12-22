import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  success: (message: string) => {
    toasts = [...toasts, { id: String(toastId++), message, type: 'success' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== String(toastId - 1));
      notify();
    }, 3000);
  },
  error: (message: string) => {
    toasts = [...toasts, { id: String(toastId++), message, type: 'error' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== String(toastId - 1));
      notify();
    }, 5000);
  },
  info: (message: string) => {
    toasts = [...toasts, { id: String(toastId++), message, type: 'info' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== String(toastId - 1));
      notify();
    }, 3000);
  },
  warning: (message: string) => {
    toasts = [...toasts, { id: String(toastId++), message, type: 'warning' }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== String(toastId - 1));
      notify();
    }, 4000);
  },
};

export function useToast() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useState(() => {
    const listener = (newToasts: Toast[]) => {
      setToastList(newToasts);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  return toastList;
}

