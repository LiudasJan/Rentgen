import cn from 'classnames';
import { InputHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Toggle({
  className,
  disabled,
  label,
  type = 'checkbox',
  ...otherProps
}: InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode }) {
  return (
    <label
      className={twMerge(
        cn('flex gap-4 items-center cursor-pointer', { 'opacity-50 cursor-not-allowed': disabled }, className),
      )}
    >
      {label}
      <span className="relative inline-flex items-center">
        <input disabled={disabled} type="checkbox" className="sr-only peer" {...otherProps} />
        <span
          className="w-10 h-5 bg-button-secondary-hover dark:bg-dark-button-secondary rounded-full
          peer-checked:bg-button-primary
            after:content-[''] after:absolute after:top-0.5 after:left-0.5
            after:bg-white after:h-4 after:w-4
            after:rounded-full
            after:transition-all after:duration-300
            peer-checked:after:translate-x-5"
        ></span>
      </span>
    </label>
  );
}
