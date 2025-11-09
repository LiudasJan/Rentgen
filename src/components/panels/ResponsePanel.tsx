import cn from 'classnames';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

export default function ResponsePanel({ children, className, title, ...otherProps }: Props) {
  return (
    <div className={cn('bg-white border border-border rounded-md', className)} {...otherProps}>
      <h3 className="m-0 py-2 px-3">{title}</h3>
      {children}
    </div>
  );
}
