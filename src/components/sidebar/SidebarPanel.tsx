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
import { SidebarItemData } from '../../utils/collection';
import SidebarItem from './SidebarItem';

interface Props {
  items: SidebarItemData[];
  selectedId: string | null;
  onRemove(id: string): void;
  onReorder(activeId: string, overId: string): void;
  onSelect(id: string): void;
}

export default function SidebarPanel({ items, selectedId, onRemove, onReorder, onSelect }: Props) {
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
      {items.length > 0 ? (
        <div className="h-full overflow-x-hidden overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedId}
                  onRemove={onRemove}
                  onSelect={onSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full p-5 text-xs text-text-secondary">
          No saved requests
        </div>
      )}
    </div>
  );
}
