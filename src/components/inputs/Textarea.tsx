import cn from 'classnames';
import { TextareaHTMLAttributes } from 'react';

export default function Textarea({ className, ...otherProps }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full min-h-24 m-0 py-2 px-3 text-xs border border-border rounded-md box-border resize-y outline-none',
        'dark:text-white dark:bg-[#343a46] dark:border-[#343a46] dark:placeholder:text-[#99a1b3]',
        className,
      )}
      {...otherProps}
    />
  );
}
