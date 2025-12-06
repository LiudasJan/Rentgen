import cn from 'classnames';
import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Input({
  className,
  disabled,
  type = 'text',
  ...otherProps
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={twMerge(
        cn(
          'm-0 py-2 px-3 text-xs font-monospace text-text border border-border rounded-md box-border outline-none',
          'dark:text-dark-text dark:bg-dark-input dark:border-dark-input dark:placeholder:text-text-secondary',
          className,
        ),
      )}
      disabled={disabled}
      type={type}
      {...otherProps}
    />
  );
}
