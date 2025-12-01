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
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

export default function SidebarItem({ item, onRemove, onSelect }: SidebarItemProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-input hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer"
      onClick={() => onSelect(item.id)}
    >
      <MethodBadge method={item.method} />

      <span className="flex-1 text-xs text-text dark:text-dark-text truncate" title={item.url}>
        {item.url}
      </span>

      <button
        className="flex items-center justify-center w-5 h-5 text-text-secondary hover:text-button-danger shrink-0 cursor-pointer bg-transparent border-none"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
      >
        X
      </button>
    </div>
  );
}
