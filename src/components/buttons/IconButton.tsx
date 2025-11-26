import cn from 'classnames';
import Button, { Props as ButtonProps } from './Button';

export function CopyButton({ className, children, ...otherProps }: ButtonProps) {
  return (
    <Button className={cn('h-6! w-6! min-w-auto! p-2! rounded-full', className)} {...otherProps}>
      {children}
    </Button>
  );
}
