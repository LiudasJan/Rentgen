import classNames from 'classnames';
import { ButtonHTMLAttributes } from 'react';

export enum ButtonType {
  PRIMARY = 'primary',
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
  const buttonClassName = classNames(
    'min-w-[110px] m-0 py-2 px-3 text-xs font-bold rounded-md',
    {
      'bg-button-primary border border-button-primary text-white': buttonType === ButtonType.PRIMARY,
      'hover:bg-button-primary/80': buttonType === ButtonType.PRIMARY && !disabled,
      'opacity-50 cursor-not-allowed': disabled,
      'cursor-pointer': !disabled,
    },
    className,
  );

  return (
    <button className={buttonClassName} disabled={disabled} type={type} {...otherProps}>
      {children}
    </button>
  );
}
