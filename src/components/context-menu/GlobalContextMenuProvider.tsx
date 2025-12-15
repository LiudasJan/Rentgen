import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { uiActions } from '../../store/slices/uiSlice';
import ContextMenu from './ContextMenu';
import ContextMenuItem from './ContextMenuItem';

interface Props {
  children: ReactNode;
}

interface MenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
}

export default function GlobalContextMenuProvider({ children }: Props) {
  const dispatch = useAppDispatch();
  const [menuState, setMenuState] = useState<MenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: '',
  });

  const closeMenu = useCallback(() => {
    setMenuState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(menuState.selectedText);
    closeMenu();
  }, [menuState.selectedText, closeMenu]);

  const handleSetAsVariable = useCallback(() => {
    dispatch(uiActions.openSetAsVariableModal(menuState.selectedText));
    closeMenu();
  }, [dispatch, menuState.selectedText, closeMenu]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Skip if right-click is on input or textarea (they have their own context menus)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Get selected text
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || '';

      // Skip if no text is selected
      if (!selectedText) {
        return;
      }

      event.preventDefault();
      setMenuState({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        selectedText,
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <>
      {children}
      <ContextMenu isOpen={menuState.isOpen} position={menuState.position} onClose={closeMenu}>
        <ContextMenuItem label="Copy" onClick={handleCopy} />
        <ContextMenuItem label="Set as Variable" onClick={handleSetAsVariable} divider />
      </ContextMenu>
    </>
  );
}
