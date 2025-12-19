import cn from 'classnames';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useClickOutside from '../../hooks/useClickOutside';

interface Props {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  children: ReactNode;
}

export default function ContextMenu({ isOpen, position, onClose, children }: Props) {
  const menuRef = useClickOutside<HTMLDivElement>(onClose);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (!isOpen) return;

    // Adjust position to keep menu within viewport
    const menuWidth = 160;
    const menuHeight = 150;
    const padding = 8;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuWidth + padding > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding;
    }

    // Adjust vertical position
    if (y + menuHeight + padding > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding;
    }

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        'fixed py-1 min-w-40 bg-white rounded-md shadow-lg border border-border',
        'dark:bg-dark-input dark:border-dark-border transition-opacity',
        {
          'invisible opacity-0 -z-100': !isOpen,
          'visible opacity-100 z-100': isOpen,
        },
      )}
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      {children}
    </div>,
    document.body,
  );
}
