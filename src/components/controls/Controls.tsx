import cn from 'classnames';
import { HTMLAttributes } from 'react';
import Button from '../buttons/Button';
import TestRunningLoader from '../loaders/TestRunningLoader';

interface Props extends HTMLAttributes<HTMLDivElement> {
  isRunning: boolean;
  executeTest: () => Promise<void>;
}

export function Controls({ className, children, isRunning, executeTest, ...otherProps }: Props) {
  return (
    <div className={cn('flex items-end gap-1.5', className)} {...otherProps}>
      {children}
      <Button className="min-w-auto! w-12! py-0.5! px-2!" disabled={isRunning} onClick={executeTest}>
        {isRunning ? (
          <TestRunningLoader className="w-fit! mx-auto! p-0.5! [&>span]:h-3! [&>span]:w-3! [&>span]:border-2! [&>span]:border-white! [&>span]:border-b-button-primary!" />
        ) : (
          'Run'
        )}
      </Button>
    </div>
  );
}
