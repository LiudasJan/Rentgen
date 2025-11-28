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
        'm-0 py-2 px-3 text-xs font-monospace text-text border border-border rounded-md outline-none',
        'dark:text-dark-text dark:bg-dark-input dark:border-dark-input dark:placeholder:text-text-secondary',
        { 'p-1.5!': type === 'file' },
        className,
      )}
      disabled={disabled}
      type={type}
      {...otherProps}
    />
  );
}
