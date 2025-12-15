import { useCallback, useState } from 'react';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedText: string;
}

interface UseContextMenuReturn extends ContextMenuState {
  openMenu: (event: React.MouseEvent, selectedText: string) => void;
  closeMenu: () => void;
}

const useContextMenu = (): UseContextMenuReturn => {
  const [state, setState] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    selectedText: '',
  });

  const openMenu = useCallback((event: React.MouseEvent, selectedText: string) => {
    event.preventDefault();
    setState({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      selectedText,
    });
  }, []);

  const closeMenu = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    openMenu,
    closeMenu,
  };
};

export default useContextMenu;
