import cn from 'classnames';
import { useEffect, useState } from 'react';
import { SidebarItemData } from '../../utils/collection';
import SidebarButton from './SidebarButton';
import SidebarPanel from './SidebarPanel';

import CollectionIcon from '../../assets/icons/collection-icon.svg';
import UpgradeStarIcon from '../../assets/icons/upgrade-star-icon.svg';

interface Props {
  items: SidebarItemData[];
  selectedId: string | null;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export default function Sidebar({ items, selectedId, onRemove, onSelect, onReorder }: Props) {
  const [appVersion, setAppVersion] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchAppVersion = async () => setAppVersion(await window.electronAPI.getAppVersion());
    fetchAppVersion();
  }, []);

  return (
    <div
      className={cn(
        'h-screen sticky top-0 flex border-r border-border dark:border-dark-input transition-[width] duration-300',
        { 'w-20': !isExpanded, 'w-100': isExpanded },
      )}
    >
      <div className="w-20 shrink-0 flex flex-col justify-between">
        <div>
          <SidebarButton label="Collections" onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}>
            <CollectionIcon className="w-5 h-5" />
          </SidebarButton>
        </div>
        <SidebarButton
          label="Check for updates"
          onClick={() =>
            window.electronAPI.openExternal(`https://rentgen.io/check-for-update.html?current_version=${appVersion}`)
          }
        >
          <UpgradeStarIcon className="w-5 h-5" />
        </SidebarButton>
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
