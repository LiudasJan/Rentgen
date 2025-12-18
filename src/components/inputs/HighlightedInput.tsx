import cn from 'classnames';
import { InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import VariableHighlighter from '../VariableHighlighter';
import { ContextMenu, ContextMenuItem } from '../context-menu';
import useContextMenu from '../../hooks/useContextMenu';
import { useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store/slices/uiSlice';

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
  onChange,
  ...otherProps
}: Props) {
  const dispatch = useAppDispatch();
  const highlighterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [scrollValue, setScrollValue] = useState<number>(0);
  const { isOpen, position, selectedText, openMenu, closeMenu } = useContextMenu();

  const textValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    if (highlighterRef.current) highlighterRef.current.scrollLeft = scrollValue;
  }, [scrollValue]);

  const getSelectedText = (): string => {
    const input = inputRef.current;
    if (!input) return '';
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    return input.value.substring(start, end);
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLInputElement>) => {
    const selected = getSelectedText();
    openMenu(event, selected);
  };

  const handleCut = async () => {
    const input = inputRef.current;
    if (!input || !selectedText) return;

    await navigator.clipboard.writeText(selectedText);

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newValue = input.value.substring(0, start) + input.value.substring(end);

    // Trigger onChange with synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, newValue);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    closeMenu();
  };

  const handleCopy = async () => {
    if (!selectedText) return;
    await navigator.clipboard.writeText(selectedText);
    closeMenu();
  };

  const handlePaste = async () => {
    const input = inputRef.current;
    if (!input) return;

    const clipboardText = await navigator.clipboard.readText();
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newValue = input.value.substring(0, start) + clipboardText + input.value.substring(end);

    // Trigger onChange with synthetic event
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, newValue);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    closeMenu();
  };

  const handleSetAsVariable = () => {
    // Use selected text, or entire input value if nothing selected
    const valueToSet = selectedText || textValue;
    dispatch(uiActions.openSetAsVariableModal(valueToSet));
    closeMenu();
  };

  const hasSelection = selectedText.length > 0;

  return (
    <div
      className={cn(
        'relative leading-0 text-text bg-white border border-border rounded-md',
        'dark:text-dark-text dark:bg-dark-input dark:border-dark-border',
        className,
      )}
    >
      <input
        ref={inputRef}
        className={cn(
          'relative w-full m-0 py-2 px-3 font-monospace text-xs text-transparent bg-transparent border-none caret-text box-border outline-none z-1',
          'dark:placeholder:text-text-secondary dark:caret-dark-text',
        )}
        value={value}
        onChange={onChange}
        onScroll={(event) => {
          setScrollValue(event.currentTarget.scrollLeft);
          onScroll?.(event);
        }}
        onContextMenu={handleContextMenu}
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

      <ContextMenu isOpen={isOpen} position={position} onClose={closeMenu}>
        <ContextMenuItem label="Cut" onClick={handleCut} disabled={!hasSelection} />
        <ContextMenuItem label="Copy" onClick={handleCopy} disabled={!hasSelection} />
        <ContextMenuItem label="Paste" onClick={handlePaste} />
        <ContextMenuItem label="Set as Variable" onClick={handleSetAsVariable} divider />
      </ContextMenu>
    </div>
  );
}
