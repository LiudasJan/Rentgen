import cn from 'classnames';
import { useEffect, useState } from 'react';
import { SidebarFolderData } from '../../utils/collection';
import SidebarButton from './SidebarButton';
import SidebarPanel from './SidebarPanel';

import CollectionIcon from '../../assets/icons/collection-icon.svg';
import UpgradeStarIcon from '../../assets/icons/upgrade-star-icon.svg';

interface Props {
  folders: SidebarFolderData[];
  selectedId: string | null;
  selectedFolderId: string | null;
  onRemoveItem: (id: string) => void;
  onSelectItem: (id: string) => void;
  onReorderItem: (activeId: string, overId: string) => void;
  onMoveItem: (itemId: string, targetFolderId: string, targetIndex?: number) => void;
  onSelectFolder: (folderId: string) => void;
  onAddFolder: () => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onRemoveFolder: (folderId: string, itemCount: number) => void;
  onReorderFolder: (activeId: string, overId: string) => void;
}

export default function Sidebar({
  folders,
  selectedId,
  selectedFolderId,
  onRemoveItem,
  onSelectItem,
  onReorderItem,
  onMoveItem,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onRemoveFolder,
  onReorderFolder,
}: Props) {
  const [appVersion, setAppVersion] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchAppVersion = async () => setAppVersion(await window.electronAPI.getAppVersion());
    fetchAppVersion();
  }, []);

  return (
    <div
      className={cn(
        'h-screen sticky top-0 flex border-r border-border dark:border-dark-input bg-body dark:bg-dark-body transition-[width] duration-300',
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
      <div className="overflow-hidden border-l border-border dark:border-dark-input bg-body dark:bg-dark-body">
        <SidebarPanel
          folders={folders}
          selectedId={selectedId}
          selectedFolderId={selectedFolderId}
          onRemoveItem={onRemoveItem}
          onSelectItem={onSelectItem}
          onReorderItem={onReorderItem}
          onMoveItem={onMoveItem}
          onSelectFolder={onSelectFolder}
          onAddFolder={onAddFolder}
          onRenameFolder={onRenameFolder}
          onRemoveFolder={onRemoveFolder}
          onReorderFolder={onReorderFolder}
        />
      </div>
    </div>
  );
}
