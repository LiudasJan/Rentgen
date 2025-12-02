import cn from 'classnames';
import { useState } from 'react';
import SidebarIconRail from './SidebarIconRail';
import SidebarPanel from './SidebarPanel';
import { SidebarItemData } from './SidebarItem';

export type { SidebarItemData as SidebarItem };

interface SidebarProps {
  items: SidebarItemData[];
  selectedId: string | null;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export default function Sidebar({ items, selectedId, onRemove, onSelect, onReorder }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'h-screen sticky top-0 flex border-r border-border dark:border-dark-input bg-body dark:bg-dark-body transition-all duration-300 shrink-0',
        {
          'w-20': !isExpanded,
          'w-100': isExpanded,
        },
      )}
    >
      <SidebarIconRail onToggle={() => setIsExpanded(!isExpanded)} />

      <div className={cn('transition-all duration-300 overflow-hidden')}>
        <SidebarPanel
          items={items}
          selectedId={selectedId}
          onRemove={onRemove}
          onSelect={onSelect}
          onReorder={onReorder}
        />
      </div>
    </div>
  );
}
