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
import { Environment } from '../../types';
import AddIcon from '../../assets/icons/add-icon.svg';

import EnvironmentSidebarItem from './EnvironmentSidebarItem';

interface Props {
  environments: Environment[];
  selectedEnvironmentId: string | null;
  onSelect: (id: string | null) => void;
  onEdit: (id: string | null) => void;
  onAdd: () => void;
  onReorder: (activeId: string, overId: string) => void;
  onRemove: (id: string) => void;
}

export default function EnvironmentSidebarPanel({
  environments,
  selectedEnvironmentId,
  onSelect,
  onEdit,
  onAdd,
  onReorder,
  onRemove,
}: Props) {
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
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="max-h-screen h-full w-80 flex flex-col overflow-hidden">
      {/* Add New Env Button - Always visible at top */}
        <div
            className="flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border cursor-pointer hover:bg-button-secondary dark:hover:bg-dark-input"
            onClick={onAdd}
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
                <EnvironmentSidebarItem
                  key={env.id}
                  environment={env}
                  isSelected={env.id === selectedEnvironmentId}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full p-5 text-xs text-text-secondary dark:text-dark-text-secondary">
          No environments created
        </div>
      )}
    </div>
  );
}
