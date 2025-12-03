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
        'm-0 py-2 px-3 text-xs font-monospace text-text bg-input-bg border border-border rounded-md box-border outline-none placeholder:text-text-secondary',
        { 'p-1.5!': type === 'file' },
        className,
      )}
      disabled={disabled}
      type={type}
      {...otherProps}
    />
  );
}
