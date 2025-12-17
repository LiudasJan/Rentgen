import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { environmentActions } from '../../../store/slices/environmentSlice';
import { selectSelectedEnvironmentId } from '../../../store/selectors';
import { Environment } from '../../../types';

import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';

interface Props {
  environment: Environment;
}

export default function EnvironmentItem({ environment }: Props) {
  const dispatch = useAppDispatch();
  const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);
  const isSelected = environment.id === selectedEnvironmentId;
  const { attributes, isDragging, listeners, transform, transition, setNodeRef } = useSortable({
    id: environment.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border',
        'hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer outline-none',
        {
          'bg-button-secondary dark:bg-dark-input': isSelected,
          'opacity-50 shadow-lg z-50': isDragging,
        },
      )}
      onClick={() => {
        if (!isDragging) {
          dispatch(environmentActions.selectEnvironment(environment.id));
          dispatch(environmentActions.startEditing(environment.id));
        }
      }}
      {...attributes}
      {...listeners}
    >
      {/* Color indicator */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: environment.color }} />
      <span className="flex-1 text-xs truncate">{environment.title}</span>
      <ClearCrossIcon
        className="h-4.5 w-4.5 p-0.5 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer"
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          dispatch(environmentActions.setEnvironmentToDelete(environment.id));
        }}
      />
    </div>
  );
}
