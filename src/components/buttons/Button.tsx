import cn from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger',
}

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  buttonType?: ButtonType;
}

export default function Button({
  buttonType = ButtonType.PRIMARY,
  children,
  className,
  disabled,
  type = 'button',
  ...otherProps
}: Props) {
  return (
    <button
      className={cn(
        'min-w-[110px] m-0 py-2 px-3 text-xs font-bold rounded-sm',
        {
          'bg-button-primary border border-button-primary text-white': buttonType === ButtonType.PRIMARY,
          'hover:bg-button-primary-hover hover:border-button-primary-hover':
            buttonType === ButtonType.PRIMARY && !disabled,
          'bg-button-secondary border border-button-secondary text-text-secondary': buttonType === ButtonType.SECONDARY,
          'hover:bg-button-secondary-hover hover:border-button-secondary-hover hover:text-text-secondary-hover':
            buttonType === ButtonType.SECONDARY && !disabled,
          'bg-button-danger border border-button-danger text-white': buttonType === ButtonType.DANGER,
          'hover:bg-button-danger-hover hover:border-button-danger-hover':
            buttonType === ButtonType.DANGER && !disabled,
          'opacity-80 cursor-default': disabled,
          'cursor-pointer': !disabled,
        },
        className,
      )}
      disabled={disabled}
      type={type}
      {...otherProps}
    >
      {children}
    </button>
  );
}
