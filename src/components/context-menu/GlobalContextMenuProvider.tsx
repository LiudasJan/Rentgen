import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store/slices/uiSlice';
import ContextMenu from './ContextMenu';
import ContextMenuItem from './ContextMenuItem';

interface MenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
}

interface ContextMenuValue extends MenuState {
  showContextMenu: (x: number, y: number, text: string) => void;
}

const ContextMenuContext = createContext<ContextMenuValue | undefined>(undefined);

export const useContextMenu = () => useContext(ContextMenuContext);

export default function GlobalContextMenuProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const [htmlElement, setHtmlElement] = useState<HTMLElement>(null);
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: '',
  });
  const hasSelection = useMemo(() => menuState.selectedText.length > 0, [menuState.selectedText]);

  const closeMenu = useCallback(() => setMenuState((prev) => ({ ...prev, isOpen: false })), []);

  const showContextMenu = useCallback((x: number, y: number, text: string) => {
    setHtmlElement(null);
    setMenuState({
      isOpen: true,
      position: { x, y },
      selectedText: text,
    });
  }, []);

  const handleCut = useCallback(async () => {
    const selectedText = getSelectedText();
    if (!selectedText || !isInputOrTextarea(htmlElement)) {
      closeMenu();
      return;
    }

    await navigator.clipboard.writeText(selectedText);

    const start = htmlElement.selectionStart ?? 0;
    const end = htmlElement.selectionEnd ?? 0;

    htmlElement.focus();
    htmlElement.setRangeText('', start, end, 'start');
    htmlElement.dispatchEvent(new Event('input', { bubbles: true }));

    closeMenu();
  }, [htmlElement, menuState.selectedText, closeMenu]);

  const handleCopy = useCallback(async () => {
    if (isInputOrTextarea(htmlElement)) htmlElement.focus();

    await navigator.clipboard.writeText(menuState.selectedText);
    closeMenu();
  }, [htmlElement, menuState.selectedText, closeMenu]);

  const handlePaste = useCallback(async () => {
    if (!isInputOrTextarea(htmlElement)) {
      closeMenu();
      return;
    }

    const clipboardText = await navigator.clipboard.readText();
    const start = htmlElement.selectionStart ?? 0;
    const end = htmlElement.selectionEnd ?? 0;

    htmlElement.focus();
    htmlElement.setRangeText(clipboardText, start, end, 'end');
    htmlElement.dispatchEvent(new Event('input', { bubbles: true }));

    closeMenu();
  }, [htmlElement, closeMenu]);

  const handleSetAsVariable = useCallback(() => {
    dispatch(uiActions.openSetAsVariableModal(menuState.selectedText));
    closeMenu();
  }, [menuState.selectedText, closeMenu, dispatch]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const selectedText = getSelectedText();

      if (!selectedText && !isInputOrTextarea(target)) return;

      event.preventDefault();
      setHtmlElement(target);
      setMenuState({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        selectedText,
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('scroll', closeMenu, { passive: true, capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('scroll', closeMenu);
    };
  }, []);

  return (
    <ContextMenuContext.Provider value={{ ...menuState, showContextMenu }}>
      {children}
      <ContextMenu isOpen={menuState.isOpen} position={menuState.position} onClose={closeMenu}>
        {htmlElement && isInputOrTextarea(htmlElement) && (
          <ContextMenuItem label="Cut" onClick={handleCut} disabled={!hasSelection} />
        )}
        <ContextMenuItem label="Copy" onClick={handleCopy} disabled={!hasSelection} />
        {htmlElement && isInputOrTextarea(htmlElement) && <ContextMenuItem label="Paste" onClick={handlePaste} />}
        <ContextMenuItem label="Set as Variable" onClick={handleSetAsVariable} disabled={!hasSelection} divider />
      </ContextMenu>
    </ContextMenuContext.Provider>
  );
}

function isInputOrTextarea(element: Element | null): element is HTMLInputElement | HTMLTextAreaElement {
  return element !== null && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA');
}

function getSelectedText() {
  const selection = window.getSelection();
  return selection?.toString().trim() || '';
}
