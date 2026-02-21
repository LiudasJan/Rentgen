import { useCallback, useEffect, useRef, useState } from 'react';

import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';
import SearchIcon from '../../../assets/icons/search-icon.svg';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CollectionSearch({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (val: string) => {
      setLocalValue(val);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(val), 150);
    },
    [onChange],
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleChange('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative flex items-center px-3 py-2 border-b border-border dark:border-dark-border">
      <SearchIcon className="absolute left-5 w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search collections..."
        className="w-full pl-5.5 pr-6 py-1 text-xs bg-transparent border border-border dark:border-dark-input dark:text-dark-text rounded outline-none placeholder:text-text-secondary dark:placeholder:text-dark-text-secondary focus:border-button-primary dark:focus:border-button-primary transition-colors"
      />
      {localValue && (
        <ClearCrossIcon
          className="absolute right-5 w-3.5 h-3.5 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text cursor-pointer"
          onClick={() => handleChange('')}
        />
      )}
    </div>
  );
}
