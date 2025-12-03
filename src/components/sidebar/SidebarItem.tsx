import cn from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';
import MethodBadge from './MethodBadge';

export interface SidebarItemData {
  id: string;
  method: string;
  url: string;
  name?: string;
  folderId?: string;
}

interface SidebarItemProps {
  item: SidebarItemData;
  isSelected?: boolean;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function SidebarItem({ item, isSelected, onRemove, onSelect }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-b border-border hover:bg-button-secondary dark:hover:bg-input-bg cursor-pointer',
        {
          'bg-button-secondary dark:bg-input-bg': isSelected,
          'opacity-50 shadow-lg z-50': isDragging,
        },
      )}
      onClick={() => !isDragging && onSelect(item.id)}
      {...attributes}
      {...listeners}
    >
      <MethodBadge method={item.method} />

      <span className="flex-1 text-xs text-text truncate" title={item.url}>
        {item.url}
      </span>

      <ClearCrossIcon
        className="h-4.5 w-4.5 p-0.5 text-text-secondary hover:text-button-danger shrink-0 cursor-pointer"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
      />
    </div>
  );
}
