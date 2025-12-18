import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import AutosizeTextarea, { TextareaAutosizeProps } from 'react-textarea-autosize';
import VariableHighlighter from '../VariableHighlighter';
import { ContextMenu, ContextMenuItem } from '../context-menu';
import useContextMenu from '../../hooks/useContextMenu';
import { useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store/slices/uiSlice';

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
  onChange,
  ...otherProps
}: Props) {
  const dispatch = useAppDispatch();
  const highlighterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [scrollValue, setScrollValue] = useState<{ scrollTop: number; scrollLeft: number }>({
    scrollTop: 0,
    scrollLeft: 0,
  });
  const { isOpen, position, selectedText, openMenu, closeMenu } = useContextMenu();

  const textValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    if (highlighterRef.current) {
      highlighterRef.current.scrollTop = scrollValue.scrollTop;
      highlighterRef.current.scrollLeft = scrollValue.scrollLeft;
    }
  }, [scrollValue]);

  const getSelectedText = (): string => {
    const textarea = textareaRef.current;
    if (!textarea) return '';
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    return textarea.value.substring(start, end);
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLTextAreaElement>) => {
    const selected = getSelectedText();
    openMenu(event, selected);
  };

  const handleCut = async () => {
    const textarea = textareaRef.current;
    if (!textarea || !selectedText) return;

    await navigator.clipboard.writeText(selectedText);

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const newValue = textarea.value.substring(0, start) + textarea.value.substring(end);

    // Trigger onChange with synthetic event
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set;
    if (nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(textarea, newValue);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    closeMenu();
  };

  const handleCopy = async () => {
    if (!selectedText) return;
    await navigator.clipboard.writeText(selectedText);
    closeMenu();
  };

  const handlePaste = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const clipboardText = await navigator.clipboard.readText();
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const newValue = textarea.value.substring(0, start) + clipboardText + textarea.value.substring(end);

    // Trigger onChange with synthetic event
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set;
    if (nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(textarea, newValue);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    closeMenu();
  };

  const handleSetAsVariable = () => {
    // Use selected text, or entire textarea value if nothing selected
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
      <AutosizeTextarea
        ref={textareaRef}
        className={cn(
          'relative w-full min-h-28 m-0 py-2 px-3 font-monospace text-xs text-transparent bg-transparent border-none caret-text box-border resize-y outline-none z-1',
          'dark:placeholder:text-text-secondary dark:caret-dark-text',
        )}
        value={value}
        onChange={onChange}
        onScroll={(event) => {
          setScrollValue({ scrollLeft: event.currentTarget.scrollLeft, scrollTop: event.currentTarget.scrollTop });
          onScroll?.(event);
        }}
        onContextMenu={handleContextMenu}
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

      <ContextMenu isOpen={isOpen} position={position} onClose={closeMenu}>
        <ContextMenuItem label="Cut" onClick={handleCut} disabled={!hasSelection} />
        <ContextMenuItem label="Copy" onClick={handleCopy} disabled={!hasSelection} />
        <ContextMenuItem label="Paste" onClick={handlePaste} />
        <ContextMenuItem label="Set as Variable" onClick={handleSetAsVariable} divider />
      </ContextMenu>
    </div>
  );
}
