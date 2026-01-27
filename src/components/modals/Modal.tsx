import cn from 'classnames';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import useClickOutside from '../../hooks/useClickOutside';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose?: () => void;
}

export default function Modal({ className, children, isOpen, onClose }: Props) {
  const refModal = useClickOutside<HTMLDivElement>(onClose);

  if (!isOpen) return null;

  return (
    <div
      className={twMerge(
        cn(
          'fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/40 z-50',
          'dark:bg-dark-input/80',
          className,
        ),
      )}
    >
      <div
        ref={refModal}
        className={cn(
          'w-150 max-w-[90%] p-5 bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
          'dark:bg-dark-body',
        )}
      >
        {children}
      </div>
    </div>
  );
}
