import classNames from 'classnames';
import { SelectHTMLAttributes } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string; className?: string }>;
  placeholder?: string;
}

export default function Select({ className, options, placeholder, ...otherProps }: Props) {
  const optionClassName = options.find((option) => option.value === otherProps.value)?.className || '';

  return (
    <select
      className={classNames(
        'min-w-[110px] m-0 py-2 px-3 text-xs border border-border rounded-md',
        optionClassName,
        className,
      )}
      {...otherProps}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value} className={option.className}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
