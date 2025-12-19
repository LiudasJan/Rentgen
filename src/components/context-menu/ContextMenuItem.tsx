import cn from 'classnames';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export default function ContextMenuItem({ label, onClick, disabled = false, divider = false }: Props) {
  return (
    <>
      {divider && <div className="my-1 border-t border-border dark:border-dark-body" />}
      <button
        type="button"
        className={cn(
          'w-full px-3 py-1.5 text-left text-xs cursor-pointer border-none bg-transparent',
          'hover:bg-gray-100 dark:hover:bg-dark-button-secondary',
          'text-text dark:text-dark-text',
          {
            'opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent': disabled,
          },
        )}
        onClick={() => {
          if (!disabled) onClick();
        }}
        disabled={disabled}
      >
        {label}
      </button>
    </>
  );
}
