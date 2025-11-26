import cn from 'classnames';
import { HTMLAttributes } from 'react';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

export default function ResponsePanel({ children, className, title, ...otherProps }: Props) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#343a46] border border-border dark:border-[#343a46] rounded-md overflow-hidden',
        className,
      )}
      {...otherProps}
    >
      <h4 className="m-0 p-4 dark:text-white">{title}</h4>
      {children}
    </div>
  );
}
