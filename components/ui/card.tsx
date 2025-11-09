import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-[var(--color-surface)] rounded-xl shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 will-change-transform', className)} {...props} />
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 border-b border-[var(--color-border)]', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-[var(--font-size-h3)] font-semibold text-[var(--color-text)]', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4', className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 border-t border-[var(--color-border)]', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
