import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 touch-manipulation inline-flex items-center justify-center';
  
  const variants = {
    default: 'bg-black text-white hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'border border-gray-300 bg-white text-black hover:bg-gray-50 active:bg-gray-100',
    ghost: 'text-black hover:bg-gray-100 active:bg-gray-200',
  };

  /* Min 44px height on mobile for touch; sm stays compact */
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px] sm:min-h-0',
    md: 'px-4 py-2.5 text-sm min-h-[44px] sm:min-h-0',
    lg: 'px-6 py-3 text-base min-h-[48px] sm:min-h-0',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}

