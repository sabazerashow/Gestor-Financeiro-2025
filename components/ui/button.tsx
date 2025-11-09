import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] focus-visible:ring-[var(--ring-color)]',
        secondary:
          'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-hover)] active:bg-[var(--color-secondary-active)] focus-visible:ring-[var(--ring-color)]',
        outline:
          'border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 focus-visible:ring-[var(--ring-color)]',
        ghost:
          'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 focus-visible:ring-[var(--ring-color)]',
      },
      size: {
        sm: 'h-9 px-3 py-1',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-6 py-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, onClick, disabled, ...props }, ref) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // Ripple effect
    if (!disabled) {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.className = 'button-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      target.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
