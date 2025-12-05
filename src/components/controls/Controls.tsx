import cn from 'classnames';
import { HTMLAttributes } from 'react';
import Button, { ButtonSize } from '../buttons/Button';
import Loader from '../loaders/Loader';

interface Props extends HTMLAttributes<HTMLDivElement> {
  isRunning: boolean;
  executeTest: () => Promise<void>;
}

export function Controls({ className, children, isRunning, executeTest, ...otherProps }: Props) {
  return (
    <div className={cn('flex items-end gap-1.5', className)} {...otherProps}>
      {children}
      <Button
        buttonSize={ButtonSize.SMALL}
        className="min-w-auto flex justify-center items-center w-12"
        disabled={isRunning}
        onClick={executeTest}
      >
        {isRunning ? (
          <Loader className="h-3 w-3 my-0.5 [&>span]:border-2! [&>span]:border-white! [&>span]:border-b-button-primary!" />
        ) : (
          'Run'
        )}
      </Button>
    </div>
  );
}
