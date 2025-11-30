import classNames from 'classnames';
import { SelectHTMLAttributes } from 'react';
import { SelectOption } from './Select';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption<string>[];
  placeholder?: string;
}

export default function SimpleSelect({ className, options, placeholder, ...otherProps }: Props) {
  const optionClassName = options.find((option) => option.value === otherProps.value)?.className || '';

  return (
    <select
      className={classNames(
        'min-w-[110px] m-0 py-2 px-3 font-segoe-ui text-xs text-text border border-border rounded-md',
        'dark:text-dark-text dark:bg-dark-input dark:border-dark-input',
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
