import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { environmentActions } from '../../../store/slices/environmentSlice';
import { selectEnvironments } from '../../../store/selectors';
import AddIcon from '../../../assets/icons/add-icon.svg';

import EnvironmentItem from './EnvironmentItem';

export default function EnvironmentPanel() {
  const dispatch = useAppDispatch();
  const environments = useAppSelector(selectEnvironments);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      dispatch(environmentActions.reorderEnvironments({ activeId: active.id as string, overId: over.id as string }));
    }
  };

  return (
    <>
      {/* Add New Env Button - Always visible at top */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border cursor-pointer hover:bg-button-secondary dark:hover:bg-dark-input"
        onClick={() => dispatch(environmentActions.startAddEnvironment())}
      >
        <AddIcon className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
        <span className="text-xs text-text-secondary dark:text-dark-text-secondary">New Environment</span>
      </div>

      {/* Environment List */}
      {environments.length > 0 ? (
        <div className="h-full overflow-x-hidden overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={environments.map((env) => env.id)} strategy={verticalListSortingStrategy}>
              {environments.map((env) => (
                <EnvironmentItem key={env.id} environment={env} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full p-0 text-xs text-text-secondary dark:text-dark-text-secondary">
          No environments created
        </div>
      )}
    </>
  );
}
