import SidebarItem, { SidebarItemData } from './SidebarItem';

interface SidebarPanelProps {
  items: SidebarItemData[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function SidebarPanel({ items, onRemove, onSelect }: SidebarPanelProps) {
  return (
    <div className="w-[320px] flex flex-col border-l border-border dark:border-dark-input py-4.5">
      <div className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <SidebarItem key={item.id} item={item} onRemove={onRemove} onSelect={onSelect} />
        ))}

        {items.length === 0 && (
          <div className="px-3 py-4 text-xs text-text-secondary text-center">No saved requests</div>
        )}
      </div>
    </div>
  );
}
