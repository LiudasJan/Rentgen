import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { collectionActions } from '../../store/slices/collectionSlice';
import { selectSelectedRequestId } from '../../store/selectors';
import { SidebarItemData } from '../../utils/collection';
import MethodBadge from '../MethodBadge';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';

interface Props {
  item: SidebarItemData;
}

export default function SidebarItem({ item }: Props) {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector(selectSelectedRequestId);
  const isSelected = item.id === selectedId;
  const { attributes, isDragging, listeners, transform, transition, setNodeRef } = useSortable({
    id: item.id,
    data: { type: 'item', folderId: item.folderId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border hover:bg-button-secondary dark:hover:bg-dark-input',
        'cursor-pointer outline-none',
        {
          'bg-button-secondary dark:bg-dark-input': isSelected,
          'opacity-50 shadow-lg z-50': isDragging,
        },
      )}
      onClick={() => !isDragging && dispatch(collectionActions.selectRequest(item.id))}
      {...attributes}
      {...listeners}
    >
      <MethodBadge method={item.method} />
      <span className="flex-1 text-xs truncate" title={item.url}>
        {item.url}
      </span>
      <ClearCrossIcon
        className="h-4.5 w-4.5 p-0.5 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          dispatch(collectionActions.removeRequest(item.id));
        }}
      />
    </div>
  );
}
