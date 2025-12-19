import cn from 'classnames';
import { MouseEvent } from 'react';

interface Props {
  label: string;
  disabled?: boolean;
  divider?: boolean;
  onClick: (event: MouseEvent) => void;
}

export default function ContextMenuItem({ label, disabled = false, divider = false, onClick }: Props) {
  return (
    <>
      {divider && <div className="my-1 border-t border-border dark:border-dark-body" />}
      <button
        type="button"
        className={cn(
          'w-full px-3 py-1.5 text-left text-xs cursor-pointer border-none bg-transparent',
          'hover:bg-select-hover dark:hover:bg-dark-button-secondary',
          'text-text dark:text-dark-text',
          {
            'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent': disabled,
          },
        )}
        onClick={(event: MouseEvent) => !disabled && onClick(event)}
        disabled={disabled}
      >
        {label}
      </button>
    </>
  );
}
