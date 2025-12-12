import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import AutosizeTextarea, { TextareaAutosizeProps } from 'react-textarea-autosize';
import VariableHighlighter from '../VariableHighlighter';

const DEFAULT_HIGHLIGHT_COLOR = '#6B7280';

interface Props extends TextareaAutosizeProps {
  highlightColor: string;
  variables?: string[];
}

export default function HighlightedTextarea({
  className,
  highlightColor,
  variables,
  value,
  onScroll,
  ...otherProps
}: Props) {
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [scrollValue, setScrollValue] = useState<{ scrollTop: number; scrollLeft: number }>({
    scrollTop: 0,
    scrollLeft: 0,
  });

  const textValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = scrollValue.scrollTop;
      highlighterRef.current.scrollLeft = scrollValue.scrollLeft;
    }
  }, [scrollValue]);

  return (
    <div
      className={cn(
        'relative leading-0 text-text bg-white border border-border rounded-md',
        'dark:text-dark-text dark:bg-dark-input dark:border-dark-border',
        className,
      )}
    >
      <AutosizeTextarea
        className={cn(
          'relative w-full min-h-28 m-0 py-2 px-3 font-monospace text-xs text-transparent bg-transparent border-none caret-text box-border resize-y outline-none z-1',
          'dark:placeholder:text-text-secondary dark:caret-dark-text',
        )}
        value={value}
        onScroll={(event) => {
          setScrollValue({ scrollLeft: event.currentTarget.scrollLeft, scrollTop: event.currentTarget.scrollTop });
          onScroll?.(event);
        }}
        {...otherProps}
      />
      <div
        className="absolute inset-0 mx-3 py-2 font-monospace text-xs whitespace-pre overflow-x-auto [scrollbar-width:none]"
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
