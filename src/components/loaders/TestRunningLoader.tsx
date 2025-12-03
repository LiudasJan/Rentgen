import cn from 'classnames';
import { HTMLAttributes } from 'react';
import Loader from './Loader';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export default function TestRunningLoader({ className, text, ...otherProps }: Props) {
  return (
    <div className={cn('w-full p-4 flex items-center gap-2 text-sm text-text bg-body', className)} {...otherProps}>
      <Loader />
      {text}
    </div>
  );
}
