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
      className={cn('m-0 py-2 px-3 text-xs border border-border rounded-md outline-none', className)}
      disabled={disabled}
      type={type}
      {...otherProps}
    />
  );
}
