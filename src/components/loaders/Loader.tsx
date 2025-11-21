import cn from 'classnames';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  text?: string;
}

export default function Loader({ className, ...otherProps }: Props) {
  return (
    <div className={cn('relative h-6 w-6 inline-block', className)} {...otherProps}>
      <span className="absolute top-0 left-0 right-0 bottom-0 border-4 border-border border-b-button-primary rounded-full box-border animate-spin"></span>
    </div>
  );
}
