import cn from 'classnames';
import Button, { Props as ButtonProps, ButtonType } from './Button';

export function IconButton({ buttonType = ButtonType.SECONDARY, className, children, ...otherProps }: ButtonProps) {
  return (
    <Button
      buttonType={buttonType}
      className={cn('flex items-center justify-center h-8.5 w-8.5 min-w-auto p-0 rounded-full', className)}
      {...otherProps}
    >
      {children}
    </Button>
  );
}
