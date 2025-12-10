import cn from 'classnames';
import { useEffect, useState } from 'react';
import { Environment } from '../../types';
import { SidebarFolderData } from '../../utils/collection';
import EnvironmentSidebarPanel from './EnvironmentSidebarPanel';
import SidebarButton from './SidebarButton';
import SidebarPanel from './SidebarPanel';

import CollectionIcon from '../../assets/icons/collection-icon.svg';
import EnvironmentIcon from '../../assets/icons/environment-icon.svg';
import UpgradeStarIcon from '../../assets/icons/upgrade-star-icon.svg';

type SidebarTab = 'collections' | 'environments' | null;

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
  environments: Environment[];
  selectedEnvironmentId: string | null;
  onSelectEnvironment: (id: string | null) => void;
  onEditEnvironment: (id: string | null) => void;
  onAddEnvironment: () => void;
  onReorderEnvironment: (activeId: string, overId: string) => void;
  onRemoveEnvironment: (id: string) => void;
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
  environments,
  selectedEnvironmentId,
  onSelectEnvironment,
  onEditEnvironment,
  onAddEnvironment,
  onReorderEnvironment,
  onRemoveEnvironment,
}: Props) {
  const [appVersion, setAppVersion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<SidebarTab>(null);

  const isExpanded = activeTab !== null;

  useEffect(() => {
    const fetchAppVersion = async () => setAppVersion(await window.electronAPI.getAppVersion());
    fetchAppVersion();
  }, []);

  const handleCollectionClick = () => {
    setActiveTab((prev) => (prev === 'collections' ? null : 'collections'));
    onEditEnvironment(null);
  };

  const handleEnvironmentClick = () => {
    setActiveTab((prev) => (prev === 'environments' ? null : 'environments'));
  };

  const handleSelectItem = (id: string) => {
    onSelectItem(id);
    onEditEnvironment(null);
  };

  return (
    <div
      className={cn(
        'h-screen sticky top-0 flex border-r border-border dark:border-dark-border bg-body dark:bg-dark-body transition-[width] duration-300',
        { 'w-22': !isExpanded, 'w-100': isExpanded },
      )}
    >
      <div className="w-22 shrink-0 flex flex-col justify-between">
        <div>
          <SidebarButton
            label="Collections"
            className={activeTab === 'collections' ? 'bg-button-secondary dark:bg-dark-input' : ''}
            onClick={handleCollectionClick}
          >
            <CollectionIcon className="w-5 h-5" />
          </SidebarButton>
          <SidebarButton
            label="Environments"
            className={activeTab === 'environments' ? 'bg-button-secondary dark:bg-dark-input' : ''}
            onClick={handleEnvironmentClick}
          >
            <EnvironmentIcon className="w-5 h-5" />
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
      <div className="border-l border-border dark:border-dark-border overflow-hidden bg-body dark:bg-dark-body">
        <div className="max-h-screen h-full w-78 flex flex-col overflow-hidden">
          {activeTab === 'collections' && (
            <SidebarPanel
              folders={folders}
              selectedId={selectedId}
              selectedFolderId={selectedFolderId}
              onRemoveItem={onRemoveItem}
              onSelectItem={handleSelectItem}
              onReorderItem={onReorderItem}
              onMoveItem={onMoveItem}
              onSelectFolder={onSelectFolder}
              onAddFolder={onAddFolder}
              onRenameFolder={onRenameFolder}
              onRemoveFolder={onRemoveFolder}
              onReorderFolder={onReorderFolder}
            />
          )}
          {activeTab === 'environments' && (
            <EnvironmentSidebarPanel
              environments={environments}
              selectedEnvironmentId={selectedEnvironmentId}
              onSelect={onSelectEnvironment}
              onEdit={onEditEnvironment}
              onAdd={onAddEnvironment}
              onReorder={onReorderEnvironment}
              onRemove={onRemoveEnvironment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
