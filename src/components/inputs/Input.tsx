import cn from 'classnames';
import { InputHTMLAttributes } from 'react';

export default function Input({
  className,
  disabled,
  type = 'text',
  ...otherProps
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'm-0 py-2 px-3 text-xs border border-border rounded-md outline-none',
        'dark:text-white dark:bg-[#343a46] dark:border-[#343a46] dark:placeholder:text-[#99a1b3]',
        { 'p-1.5!': type === 'file' },
        className,
      )}
      disabled={disabled}
      type={type}
      {...otherProps}
    />
  );
}
