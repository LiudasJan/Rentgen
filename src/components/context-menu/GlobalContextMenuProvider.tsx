import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCollectionData, selectSelectedRequestId } from '../../store/selectors';
import { uiActions } from '../../store/slices/uiSlice';
import { findRequestWithFolder } from '../../utils/collection';
import ContextMenu from './ContextMenu';
import ContextMenuItem from './ContextMenuItem';

interface MenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
}

export interface ResponsePanelContext {
  isResponsePanel: boolean;
  source: 'body' | 'header';
  jsonPath?: string | null;
  jsonValue?: string | null;
}

interface ContextMenuValue extends MenuState {
  showContextMenu: (x: number, y: number, text: string, responsePanelContext?: ResponsePanelContext) => void;
}

const ContextMenuContext = createContext<ContextMenuValue | undefined>(undefined);

export const useContextMenu = () => useContext(ContextMenuContext);

export default function GlobalContextMenuProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const collection = useAppSelector(selectCollectionData);
  const selectedRequestId = useAppSelector(selectSelectedRequestId);
  const [htmlElement, setHtmlElement] = useState<HTMLElement>(null);
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: '',
  });
  const [responsePanelContext, setResponsePanelContext] = useState<ResponsePanelContext | null>(null);
  const hasSelection = useMemo(() => menuState.selectedText.length > 0, [menuState.selectedText]);

  // Check if current request is saved in collection and get folder info
  const currentRequestWithFolder = useMemo(() => {
    if (!selectedRequestId) return null;
    return findRequestWithFolder(collection, selectedRequestId);
  }, [collection, selectedRequestId]);

  const closeMenu = useCallback(() => setMenuState((prev) => ({ ...prev, isOpen: false })), []);

  const showContextMenu = useCallback((x: number, y: number, text: string, panelContext?: ResponsePanelContext) => {
    setHtmlElement(null);
    setResponsePanelContext(panelContext || null);
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
    if (!currentRequestWithFolder || !selectedRequestId) return;

    const { folder, request } = currentRequestWithFolder;
    dispatch(
      uiActions.openSetAsDynamicVariableModal({
        initialSelector: responsePanelContext?.jsonPath || menuState.selectedText,
        initialValue: responsePanelContext?.jsonValue || menuState.selectedText,
        collectionId: folder.id,
        requestId: selectedRequestId,
        collectionName: folder.name,
        requestName: request.name,
        editingVariableId: null,
        editingVariableName: null,
        source: responsePanelContext?.source || 'body',
      }),
    );
    closeMenu();
  }, [currentRequestWithFolder, selectedRequestId, responsePanelContext, menuState.selectedText, closeMenu, dispatch]);

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
  }, [closeMenu]);

  return (
    <ContextMenuContext.Provider value={{ ...menuState, showContextMenu }}>
      {children}
      <ContextMenu isOpen={menuState.isOpen} position={menuState.position} onClose={closeMenu}>
        {htmlElement && isInputOrTextarea(htmlElement) && (
          <ContextMenuItem label="Cut" onClick={handleCut} disabled={!hasSelection} />
        )}
        <ContextMenuItem label="Copy" onClick={handleCopy} disabled={!hasSelection} />
        {htmlElement && isInputOrTextarea(htmlElement) && <ContextMenuItem label="Paste" onClick={handlePaste} />}
        {responsePanelContext && (
          <ContextMenuItem
            label="Set as Variable"
            onClick={handleSetAsVariable}
            disabled={!hasSelection || !currentRequestWithFolder}
            title={!currentRequestWithFolder ? 'Save request to collection first' : undefined}
            divider
          />
        )}
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
