import cn from 'classnames';
import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useClickOutside from '../../hooks/useClickOutside';

interface Props extends PropsWithChildren {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ContextMenu({ children, isOpen, position, onClose }: Props) {
  const menuRef = useClickOutside<HTMLDivElement>(onClose, true);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isVisible, setIsVisible] = useState(false);

  // Delay to allow DOM mount before triggering CSS transition
  useEffect(() => {
    const visibilityTimeout = setTimeout(() => setIsVisible(isOpen));
    return () => clearTimeout(visibilityTimeout);
  }, [isOpen]);

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

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={cn('fixed py-1 min-w-40 bg-white rounded-md shadow-lg', 'dark:bg-dark-input transition-opacity', {
        'invisible opacity-0 -z-100': !isVisible,
        'visible opacity-100 z-100': isVisible,
      })}
      style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
    >
      {children}
    </div>,
    document.body,
  );
}
