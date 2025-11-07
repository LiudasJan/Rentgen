import classNames from 'classnames';
import { InputHTMLAttributes } from 'react';

export default function Button({
  className,
  disabled,
  type = 'text',
  ...otherProps
}: InputHTMLAttributes<HTMLInputElement>) {
  const inputClassName = classNames('m-0 py-2 px-3 text-xs border border-border rounded-md', className);

  return <input className={inputClassName} disabled={disabled} type={type} {...otherProps} />;
}
