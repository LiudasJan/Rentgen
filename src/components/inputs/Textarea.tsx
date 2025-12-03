import cn from 'classnames';
import { TextareaHTMLAttributes } from 'react';

export default function Textarea({ className, ...otherProps }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full min-h-28 m-0 py-2 px-3 font-monospace text-xs text-text bg-input-bg border border-border rounded-md box-border resize-y outline-none placeholder:text-text-secondary',
        className,
      )}
      {...otherProps}
    />
  );
}
