import cn from 'classnames';
import { useState } from 'react';
import { SidebarItemData } from '../../utils/collection';
import SidebarPanel from './SidebarPanel';

import CollectionIcon from '../../assets/icons/collection-icon.svg';

interface Props {
  items: SidebarItemData[];
  selectedId: string | null;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export default function Sidebar({ items, selectedId, onRemove, onSelect, onReorder }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'h-screen sticky top-0 flex border-r border-border dark:border-dark-input transition-[width] duration-300',
        {
          'w-20': !isExpanded,
          'w-100': isExpanded,
        },
      )}
    >
      <div
        className={cn(
          'shrink-0 w-20 h-fit py-5 flex flex-col items-center gap-1 cursor-pointer',
          'text-button-text-secondary hover:bg-button-secondary hover:text-button-text-secondary-hover',
          'dark:text-dark-text dark:hover:bg-dark-input dark:hover:text-dark-text',
        )}
        onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}
      >
        <CollectionIcon className="w-5 h-5" />
        <span className="font-bold text-xs">Collections</span>
      </div>

      <div className="overflow-hidden border-l border-border dark:border-dark-input">
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
