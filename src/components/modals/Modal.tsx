import cn from 'classnames';
import { HTMLAttributes } from 'react';
import useClickOutside from '../../hooks/useClickOutside';

interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Modal({ className, children, isOpen, onClose }: Props) {
  const refModal = useClickOutside<HTMLDivElement>(onClose);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/40 dark:bg-[#343a46]/80 z-50',
        className,
      )}
    >
      <div
        ref={refModal}
        className="w-[600px] max-w-[90%] p-5 bg-white dark:bg-[#23272f] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      >
        {children}
      </div>
    </div>
  );
}
