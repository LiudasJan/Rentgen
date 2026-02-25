import cn from 'classnames';
import { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Toggle({
  className,
  disabled,
  label,
  type = 'checkbox',
  ...otherProps
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className={twMerge(cn('flex gap-4 items-center cursor-pointer', className))}>
      {label}
      <span className="relative inline-flex items-center">
        <input disabled={disabled} type="checkbox" className="sr-only peer" {...otherProps} />
        <span
          className="w-11 h-6 bg-border rounded-full
          peer-checked:bg-button-primary
            after:content-[''] after:absolute after:top-1 after:left-1
            after:bg-white after:h-4 after:w-4
            after:rounded-full
            after:transition-all after:duration-300
            peer-checked:after:translate-x-5"
        ></span>
      </span>
    </label>
  );
}
