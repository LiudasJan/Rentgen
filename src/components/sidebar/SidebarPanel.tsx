import SidebarItem, { SidebarItemData } from './SidebarItem';

interface SidebarPanelProps {
  items: SidebarItemData[];
  selectedId: string | null;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function SidebarPanel({ items, selectedId, onRemove, onSelect }: SidebarPanelProps) {
  return (
    <div className="py-4.5 min-h-[100vh] min-w-[320px] flex flex-col border-l border-border dark:border-dark-input overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isSelected={item.id === selectedId}
            onRemove={onRemove}
            onSelect={onSelect}
          />
        ))}

        {items.length === 0 && (
          <div className="px-3 py-4 text-xs text-text-secondary text-center whitespace-nowrap">
            No saved requests
          </div>
        )}
      </div>
    </div>
  );
}
