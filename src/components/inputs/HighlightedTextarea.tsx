import cn from 'classnames';
import { useRef } from 'react';
import { TextareaAutosizeProps } from 'react-textarea-autosize';
import TextareaAutosize from './TextareaAutosize';
import VariableHighlighter from './VariableHighlighter';
import { Environment } from '../../types';

const DEFAULT_HIGHLIGHT_COLOR = '#6B7280';

interface HighlightedTextareaProps extends TextareaAutosizeProps {
  environment?: Environment | null;
}

export default function HighlightedTextarea({
  className,
  value,
  environment,
  onScroll,
  ...otherProps
}: HighlightedTextareaProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const highlightColor = environment?.color || DEFAULT_HIGHLIGHT_COLOR;
  const textValue = typeof value === 'string' ? value : '';

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    onScroll?.(e);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Highlight overlay */}
      <div
        ref={overlayRef}
        className={cn(
          'absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words',
          'w-full m-0 py-2 px-3 font-monospace text-xs text-text',
          'dark:text-dark-text',
        )}
        aria-hidden="true"
      >
        <VariableHighlighter text={textValue} highlightColor={highlightColor} variables={environment?.variables} />
      </div>

      {/* Actual textarea */}
      <TextareaAutosize
        className="bg-transparent caret-text dark:caret-dark-text"
        style={{ color: 'transparent' }}
        value={value}
        onScroll={handleScroll}
        {...otherProps}
      />
    </div>
  );
}
