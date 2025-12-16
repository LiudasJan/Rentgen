import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from 'classnames';
import { useCollectionRunner } from '../../../hooks/useCollectionRunner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectCollectionRunResults, selectRunningRequestId, selectSelectedRequestId } from '../../../store/selectors';
import { collectionActions } from '../../../store/slices/collectionSlice';
import { SidebarItemData } from '../../../utils/collection';
import MethodBadge from '../../MethodBadge';

import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';
import PlayIcon from '../../../assets/icons/play-icon.svg';

interface Props {
  item: SidebarItemData;
}

export default function CollectionItem({ item }: Props) {
  const dispatch = useAppDispatch();
  const { runRequest } = useCollectionRunner();
  const runningRequestId = useAppSelector(selectRunningRequestId);
  const selectedId = useAppSelector(selectSelectedRequestId);
  const runResults = useAppSelector(selectCollectionRunResults);
  const runResult = runResults[item.id] || null;
  const isSelected = item.id === selectedId;
  const { attributes, isDragging, listeners, transform, transition, setNodeRef } = useSortable({
    id: item.id,
    data: { type: 'item', folderId: item.folderId },
  });

  const handleClick = () => {
    if (isDragging) return;

    dispatch(collectionActions.selectRequest(item.id));
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border hover:bg-button-secondary dark:hover:bg-dark-input',
        'group cursor-pointer outline-none',
        {
          'bg-button-secondary dark:bg-dark-input': isSelected,
          'opacity-50 shadow-lg z-50': isDragging,
        },
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {runResult && (
        <span
          className={cn('w-2 h-2 rounded-full shrink-0', {
            'bg-green-500': runResult.status >= 200 && runResult.status < 300,
            'bg-blue-500': runResult.status >= 300 && runResult.status < 400,
            'bg-orange-500': runResult.status >= 400 && runResult.status < 500,
            'bg-red-500': runResult.status >= 500 || !runResult.status,
          })}
        />
      )}
      <MethodBadge method={item.method} />
      <span className="flex-1 text-xs truncate" title={item.url}>
        {item.url}
      </span>
      <PlayIcon
        className={cn('h-4 w-4 text-green-500 hover:text-green-600 opacity-0 transition-opacity', {
          'cursor-pointer opacity-0 group-hover:opacity-100': runningRequestId !== item.id,
          'group-hover:opacity-50 cursor-not-allowed': runningRequestId === item.id,
        })}
        onClick={(event: MouseEvent) => {
          event.stopPropagation();

          if (runningRequestId === item.id) return;
          runRequest(item.id);
        }}
      />
      <ClearCrossIcon
        className="h-4.5 w-4.5 p-0.5 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer"
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
          dispatch(collectionActions.removeRequest(item.id));
        }}
      />
    </div>
  );
}
