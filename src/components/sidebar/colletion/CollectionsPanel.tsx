import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';
import { SidebarFolderData } from '../../../utils/collection';
import CollectionGroup from './CollectionGroup';

import AddIcon from '../../../assets/icons/add-icon.svg';

interface Props {
  folders: SidebarFolderData[];
  selectedId: string | null;
  selectedFolderId: string | null;
  onRemoveCollection: (id: string) => void;
  onReorderCollection: (activeId: string, overId: string) => void;
  onMoveItem: (itemId: string, targetFolderId: string, targetIndex?: number) => void;
  onSelectCollection: (id: string) => void;
  onSelectFolder: (folderId: string) => void;
  onAddFolder: () => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onRemoveFolder: (folderId: string, itemCount: number) => void;
  onReorderFolder: (activeId: string, overId: string) => void;
}

export default function CollectionsPanel({
  folders,
  selectedId,
  selectedFolderId,
  onRemoveCollection,
  onReorderCollection,
  onMoveItem,
  onSelectCollection,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onRemoveFolder,
  onReorderFolder,
}: Props) {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'folder') {
      onReorderFolder(active.id as string, over.id as string);
      return;
    }

    if (activeType === 'item') {
      const activeFolderId = active.data.current?.folderId;

      if (overType === 'folder') {
        if (activeFolderId !== over.id) {
          onMoveItem(active.id as string, over.id as string);
        }
        return;
      }

      if (overType === 'item') {
        const overFolderId = over.data.current?.folderId;

        if (activeFolderId === overFolderId) {
          onReorderCollection(active.id as string, over.id as string);
        } else {
          const targetFolder = folders.find((f) => f.id === overFolderId);
          const targetIndex = targetFolder?.items.findIndex((i) => i.id === over.id) ?? -1;
          onMoveItem(active.id as string, overFolderId as string, targetIndex >= 0 ? targetIndex : undefined);
        }
      }
    }
  };

  const handleStartEdit = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      setEditingFolderId(folderId);
      setEditingName(folder.name);
    }
  };

  const handleSaveEdit = (folderId: string, newName: string) => {
    if (newName.trim()) {
      onRenameFolder(folderId, newName.trim());
    }
    setEditingFolderId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingFolderId(null);
    setEditingName('');
  };

  // Create flat list of all sortable IDs (folders + all items from all folders)
  const allSortableIds = useMemo(() => {
    const ids: string[] = [];
    folders.forEach((folder) => {
      ids.push(folder.id);
      folder.items.forEach((item) => ids.push(item.id));
    });
    return ids;
  }, [folders]);

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border cursor-pointer hover:bg-button-secondary dark:hover:bg-dark-input"
        onClick={onAddFolder}
      >
        <AddIcon className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
        <span className="text-xs text-text-secondary dark:text-dark-text-secondary">New Folder</span>
      </div>

      {folders.length > 0 ? (
        <div className="h-full overflow-x-hidden overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
              {folders.map((folder) => (
                <CollectionGroup
                  key={folder.id}
                  folder={folder}
                  folderCount={folders.length}
                  selectedId={selectedId}
                  selectedFolderId={selectedFolderId}
                  isEditing={editingFolderId === folder.id}
                  editingName={editingName}
                  onRemoveCollection={onRemoveCollection}
                  onSelectCollection={onSelectCollection}
                  onSelectFolder={onSelectFolder}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditingNameChange={setEditingName}
                  onRemoveFolder={onRemoveFolder}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full p-5 text-xs text-text-secondary">
          No saved requests
        </div>
      )}
    </>
  );
}
