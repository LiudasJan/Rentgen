import cn from 'classnames';
import { InputHTMLAttributes, useRef, useState } from 'react';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  buttonClassName?: string;
  fileNameClassName?: string;
}

export default function FileInput({
  accept,
  className,
  buttonClassName,
  fileNameClassName,
  onChange,
  ...otherProps
}: FileInputProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file?.name || null);
    onChange?.(event);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={cn('flex', className)}>
      <input ref={inputRef} accept={accept} className="sr-only" type="file" onChange={handleChange} {...otherProps} />
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'py-2 px-3 font-segoe-ui text-xs font-bold border rounded-l-md cursor-pointer whitespace-nowrap',
          'bg-button-secondary border-button-secondary text-button-text-secondary',
          'hover:bg-button-secondary-hover hover:border-button-secondary-hover hover:text-button-text-secondary-hover',
          'dark:bg-dark-button-secondary dark:border-dark-button-secondary dark:text-dark-text',
          'dark:hover:bg-dark-button-secondary-hover dark:hover:border-dark-button-secondary-hover dark:hover:text-dark-text',
          buttonClassName,
        )}
      >
        Choose file
      </button>
      <span
        className={cn(
          'flex-1 py-2 px-3 text-xs font-monospace border border-l-0 rounded-r-md truncate',
          'bg-white border-border text-text',
          'dark:bg-dark-input dark:border-dark-input dark:text-dark-text',
          { 'text-text-secondary': !fileName },
          fileNameClassName,
        )}
      >
        {fileName || 'No file chosen'}
      </span>
    </div>
  );
}
