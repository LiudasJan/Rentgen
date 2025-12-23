import cn from 'classnames';
import { InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import VariableHighlighter from '../VariableHighlighter';

const DEFAULT_HIGHLIGHT_COLOR = '#6B7280';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  highlightColor: string;
  variables?: string[];
}

export default function HighlightedInput({
  className,
  highlightColor,
  variables,
  value,
  onScroll,
  ...otherProps
}: Props) {
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [scrollValue, setScrollValue] = useState<number>(0);
  const textValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    if (highlighterRef.current) highlighterRef.current.scrollLeft = scrollValue;
  }, [scrollValue]);

  return (
    <div
      className={cn(
        'relative leading-0 text-text bg-white border border-border rounded-md',
        'dark:text-dark-text dark:bg-dark-input dark:border-dark-border',
        className,
      )}
    >
      <input
        className={cn(
          'relative w-full m-0 py-2 px-3 font-monospace text-xs text-transparent bg-transparent border-none caret-text box-border outline-none z-1',
          'dark:placeholder:text-text-secondary dark:caret-dark-text',
        )}
        value={value}
        onScroll={(event) => {
          setScrollValue(event.currentTarget.scrollLeft);
          onScroll?.(event);
        }}
        {...otherProps}
      />
      <div
        className="absolute inset-0 flex items-center mx-3 py-2 font-monospace text-xs whitespace-pre overflow-x-auto [scrollbar-width:none]"
        ref={highlighterRef}
      >
        <VariableHighlighter
          text={textValue}
          highlightColor={highlightColor || DEFAULT_HIGHLIGHT_COLOR}
          variables={variables}
        />
      </div>
    </div>
  );
}
