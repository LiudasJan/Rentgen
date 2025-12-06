import { SidebarFolderData } from '../../utils/collection';
import CollectionsPanel from './colletion/CollectionsPanel';

interface Props {
  folders: SidebarFolderData[];
  selectedId: string | null;
  selectedFolderId: string | null;
  onRemoveItem: (id: string) => void;
  onReorderItem: (activeId: string, overId: string) => void;
  onMoveItem: (itemId: string, targetFolderId: string, targetIndex?: number) => void;
  onSelectItem: (id: string) => void;
  onSelectFolder: (folderId: string) => void;
  onAddFolder: () => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onRemoveFolder: (folderId: string, itemCount: number) => void;
  onReorderFolder: (activeId: string, overId: string) => void;
}

export default function SidebarPanel(props: Props) {
  return (
    <div className="max-h-screen h-full w-80 flex flex-col overflow-hidden bg-body dark:bg-dark-body">
      <CollectionsPanel {...props} />
    </div>
  );
}
