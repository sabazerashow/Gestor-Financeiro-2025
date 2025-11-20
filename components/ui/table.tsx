import * as React from 'react';
import { cn } from '../../lib/utils';

const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={cn('w-full text-left border-collapse', className)} {...props} />
);

const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-muted', className)} {...props} />
);

const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('', className)} {...props} />
);

const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn('border-b border-border', className)} {...props} />
);

const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-4 py-2 text-sm font-medium text-foreground', className)} {...props} />
);

const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-2 text-sm text-foreground', className)} {...props} />
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };

