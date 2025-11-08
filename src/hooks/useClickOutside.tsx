import { useEffect, useRef } from 'react';

const useClickOutside = <T extends HTMLElement>(onClickOutside?: () => void) => {
  const element = useRef<T>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (onClickOutside && element.current && !element.current.contains(event.target as T)) onClickOutside();
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClickOutside]);

  return element;
};

export default useClickOutside;
