import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        'h-4 w-4 rounded border border-[var(--color-border)]',
        'bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

export default Checkbox;
