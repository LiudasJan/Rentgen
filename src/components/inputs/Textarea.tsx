import cn from 'classnames';
import { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Textarea({ className, ...otherProps }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={twMerge(
        cn(
          'w-full min-h-28 m-0 py-2 px-3 font-monospace text-xs text-text border border-border rounded-md box-border resize-y outline-none',
          'dark:text-dark-text dark:bg-dark-input dark:border-dark-input dark:placeholder:text-text-secondary',
          className,
        ),
      )}
      {...otherProps}
    />
  );
}
