import { useEffect, useRef } from 'react';
import { useContextMenu } from '../components/context-menu/GlobalContextMenuProvider';

const useClickOutside = <T extends HTMLElement>(onClickOutside?: () => void) => {
  const { isOpen } = useContextMenu();
  const element = useRef<T>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isOpen && onClickOutside && element.current && !element.current.contains(event.target as T))
        onClickOutside();
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClickOutside]);

  return element;
};

export default useClickOutside;
