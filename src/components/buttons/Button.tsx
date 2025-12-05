import cn from 'classnames';
import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
}

export enum ButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: ButtonType;
  buttonSize?: ButtonSize;
}

export default function Button({
  buttonType = ButtonType.PRIMARY,
  buttonSize = ButtonSize.MEDIUM,
  children,
  className,
  disabled,
  type = 'button',
  ...otherProps
}: Props) {
  return (
    <button
      className={twMerge(
        cn(
          'm-0 font-segoe-ui text-xs font-bold border',
          {
            'py-0.5 px-2 rounded-sm': buttonSize === ButtonSize.SMALL,
            'min-w-24 py-2 px-3 rounded-md': buttonSize === ButtonSize.MEDIUM,
            'bg-button-primary border-button-primary text-white': buttonType === ButtonType.PRIMARY,
            'hover:bg-button-primary-hover hover:border-button-primary-hover':
              buttonType === ButtonType.PRIMARY && !disabled,
            'bg-button-secondary border-button-secondary text-button-text-secondary':
              buttonType === ButtonType.SECONDARY,
            'dark:bg-dark-button-secondary dark:border-dark-button-secondary dark:text-dark-text':
              buttonType === ButtonType.SECONDARY,
            'hover:bg-button-secondary-hover hover:border-button-secondary-hover hover:text-button-text-secondary-hover':
              buttonType === ButtonType.SECONDARY && !disabled,
            'dark:hover:bg-dark-button-secondary-hover dark:hover:border-dark-button-secondary-hover dark:hover:text-dark-text':
              buttonType === ButtonType.SECONDARY && !disabled,
            'bg-button-danger border-button-danger text-white': buttonType === ButtonType.DANGER,
            'hover:bg-button-danger-hover hover:border-button-danger-hover':
              buttonType === ButtonType.DANGER && !disabled,
            'opacity-50 cursor-not-allowed': disabled,
            'cursor-pointer': !disabled,
          },
          className,
        ),
      )}
      disabled={disabled}
      type={type}
      {...otherProps}
    >
      {children}
    </button>
  );
}
