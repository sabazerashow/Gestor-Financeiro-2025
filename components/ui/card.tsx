import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-transform hover:-translate-y-0.5 will-change-transform', className)} {...props} />
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 border-b border-gray-200 dark:border-gray-700', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4', className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 border-t border-gray-200 dark:border-gray-700', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
