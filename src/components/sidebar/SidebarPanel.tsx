import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SidebarItem, { SidebarItemData } from './SidebarItem';

interface SidebarPanelProps {
  items: SidebarItemData[];
  selectedId: string | null;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export default function SidebarPanel({ items, selectedId, onRemove, onSelect, onReorder }: SidebarPanelProps) {
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
    <div className="py-4.5 min-h-[100vh] max-h-[100vh] min-w-80 flex flex-col border-l border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-6">
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

        {items.length === 0 && (
          <div className="px-3 py-4 text-xs text-text-secondary text-center whitespace-nowrap">No saved requests</div>
        )}
      </div>
    </div>
  );
}
