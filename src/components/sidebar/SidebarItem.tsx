import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from 'classnames';
import { SidebarItemData } from '../../utils/collection';
import MethodBadge from '../MethodBadge';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';

interface Props {
  item: SidebarItemData;
  isSelected?: boolean;
  onRemove(id: string): void;
  onSelect(id: string): void;
}

export default function SidebarItem({ item, isSelected, onRemove, onSelect }: Props) {
  const { attributes, isDragging, listeners, transform, transition, setNodeRef } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-input hover:bg-button-secondary dark:hover:bg-dark-input',
        'cursor-pointer outline-none',
        {
          'bg-button-secondary dark:bg-dark-input': isSelected,
          'opacity-50 shadow-lg z-50': isDragging,
        },
      )}
      onClick={() => !isDragging && onSelect(item.id)}
      {...attributes}
      {...listeners}
    >
      <MethodBadge method={item.method} />
      <span className="flex-1 text-xs truncate" title={item.url}>
        {item.url}
      </span>
      <ClearCrossIcon
        className="h-4.5 w-4.5 p-0.5 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer"
        onClick={() => onRemove(item.id)}
      />
    </div>
  );
}
