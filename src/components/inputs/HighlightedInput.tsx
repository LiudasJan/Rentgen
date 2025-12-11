import cn from 'classnames';
import { InputHTMLAttributes } from 'react';
import Input from './Input';
import VariableHighlighter from './VariableHighlighter';
import { Environment } from '../../types';

const DEFAULT_HIGHLIGHT_COLOR = '#6B7280';

interface HighlightedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  environment?: Environment | null;
}

export default function HighlightedInput({
  className,
  disabled,
  type = 'text',
  value,
  environment,
  ...otherProps
}: HighlightedInputProps) {
  const highlightColor = environment?.color || DEFAULT_HIGHLIGHT_COLOR;
  const textValue = typeof value === 'string' ? value : '';

  return (
    <div className={cn('relative', className)}>
      {/* Highlight overlay */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none overflow-hidden whitespace-nowrap',
          'm-0 py-2 px-3 text-xs font-monospace text-text',
          'dark:text-dark-text',
        )}
        aria-hidden="true"
      >
        <VariableHighlighter text={textValue} highlightColor={highlightColor} variables={environment?.variables} />
      </div>

      {/* Actual input */}
      <Input
        className={cn('w-full bg-transparent caret-text dark:caret-dark-text', { 'p-1.5!': type === 'file' })}
        style={{ color: 'transparent' }}
        disabled={disabled}
        type={type}
        value={value}
        {...otherProps}
      />
    </div>
  );
}
