import cn from 'classnames';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export default function TestRunningLoader({ className, text, ...otherProps }: Props) {
  return (
    <div className={cn('w-full p-4 flex items-center gap-2', className)} {...otherProps}>
      <span className="h-6 w-6 border-4 border-border border-b-button-primary rounded-full box-border animate-spin"></span>
      {text}
    </div>
  );
}
