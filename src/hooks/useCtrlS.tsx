import { useEffect } from 'react';

export function useCtrlS(callback?: () => void): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (callback && (event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [callback]);
}
