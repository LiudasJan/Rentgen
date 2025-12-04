import cn from 'classnames';
import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export default function SidebarButton({ children, className, label, onClick, ...otherProps }: Props) {
  return (
    <div
      className={cn(
        'w-20 py-2.5 flex flex-col items-center gap-1 cursor-pointer text-center',
        'text-button-text-secondary hover:bg-button-secondary hover:text-button-text-secondary-hover',
        'dark:text-dark-text dark:hover:bg-dark-input dark:hover:text-dark-text',
        className,
      )}
      onClick={onClick}
      {...otherProps}
    >
      {children}
      <span className="font-bold text-xs">{label}</span>
    </div>
  );
}
