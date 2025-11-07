import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
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
      className={classNames(
        'min-w-[110px] m-0 py-2 px-3 text-xs font-bold rounded-md',
        {
          'bg-button-primary border border-button-primary text-white': buttonType === ButtonType.PRIMARY,
          'hover:bg-button-primary/80': buttonType === ButtonType.PRIMARY && !disabled,
          'bg-button-secondary border border-border': buttonType === ButtonType.SECONDARY,
          'hover:bg-button-secondary/80': buttonType === ButtonType.SECONDARY && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
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
