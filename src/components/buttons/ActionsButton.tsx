import cn from 'classnames';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useClickOutside from '../../hooks/useClickOutside';
import { Props as ButtonProps, ButtonSize, ButtonType } from './Button';

import ChevronIcon from '../../assets/icons/chevron-icon.svg';

export interface Props extends ButtonProps {
  actions?: { label: string; onClick: () => void }[];
}

export default function ActionsButton({
  actions,
  buttonType = ButtonType.PRIMARY,
  buttonSize = ButtonSize.MEDIUM,
  children,
  className,
  disabled,
  ...otherProps
}: Props) {
  const [openActions, setOpenActions] = useState<boolean>(false);
  const refButton = useClickOutside<HTMLDivElement>(() => setOpenActions(false));

  const buttonClassName = twMerge(
    cn('border', {
      'bg-button-primary border-button-primary text-white': buttonType === ButtonType.PRIMARY,
      'hover:bg-button-primary-hover hover:border-button-primary-hover': buttonType === ButtonType.PRIMARY && !disabled,
      'bg-button-secondary border-button-secondary text-button-text-secondary': buttonType === ButtonType.SECONDARY,
      'dark:bg-dark-button-secondary dark:border-dark-button-secondary dark:text-dark-text':
        buttonType === ButtonType.SECONDARY,
      'hover:bg-button-secondary-hover hover:border-button-secondary-hover hover:text-button-text-secondary-hover':
        buttonType === ButtonType.SECONDARY && !disabled,
      'dark:hover:bg-dark-button-secondary-hover dark:hover:border-dark-button-secondary-hover dark:hover:text-dark-text':
        buttonType === ButtonType.SECONDARY && !disabled,
      'bg-button-danger border-button-danger text-white': buttonType === ButtonType.DANGER,
      'hover:bg-button-danger-hover hover:border-button-danger-hover': buttonType === ButtonType.DANGER && !disabled,
      'opacity-50 cursor-not-allowed': disabled,
      'cursor-pointer': !disabled,
    }),
  );

  return (
    <div className={twMerge(cn('relative flex items-center', className))} ref={refButton}>
      <button
        className={twMerge(
          cn(
            'm-0 font-segoe-ui text-xs font-bold',
            {
              'py-0.5 px-2 rounded-l-sm': buttonSize === ButtonSize.SMALL,
              'min-w-24 py-2 px-3 rounded-l-md': buttonSize === ButtonSize.MEDIUM,
            },
            buttonClassName,
          ),
        )}
        disabled={disabled}
        {...otherProps}
      >
        {children}
      </button>
      {actions && actions.length > 0 && (
        <>
          <button
            className={twMerge(
              cn(
                'leading-0',
                {
                  'p-0.5 rounded-r-sm': buttonSize === ButtonSize.SMALL,
                  'p-1.5 rounded-r-md': buttonSize === ButtonSize.MEDIUM,
                },
                buttonClassName,
              ),
            )}
            onClick={() => setOpenActions((prevOpenActions) => !prevOpenActions)}
          >
            <ChevronIcon
              className={cn('rotate-90', {
                'w-4 h-4': buttonSize === ButtonSize.SMALL,
                'w-5 h-5': buttonSize === ButtonSize.MEDIUM,
              })}
            />
          </button>
          {openActions && (
            <div className="absolute top-full right-0 w-full bg-white dark:bg-dark-input rounded-md shadow-md z-50">
              {actions.map(({ label, onClick }, index) => (
                <div
                  key={index}
                  className={cn(
                    'text-xs first:rounded-t-md last:rounded-b-md hover:bg-select-hover dark:hover:bg-dark-button-secondary cursor-pointer',
                    { 'py-2 px-3': buttonSize === ButtonSize.MEDIUM },
                    { 'py-1 px-2': buttonSize === ButtonSize.SMALL },
                  )}
                  onClick={() => {
                    onClick();
                    setOpenActions(false);
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
