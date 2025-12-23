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
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { collectionActions } from '../../../store/slices/collectionSlice';
import { uiActions } from '../../../store/slices/uiSlice';
import { selectCollectionData, selectSidebarFolders } from '../../../store/selectors';
import { detectImportConflicts } from '../../../utils/collection';
import CollectionGroup from './CollectionGroup';

import AddIcon from '../../../assets/icons/add-icon.svg';
import ExportIcon from '../../../assets/icons/export-icon.svg';
import ImportIcon from '../../../assets/icons/import-icon.svg';

export default function CollectionsPanel() {
  const dispatch = useAppDispatch();
  const folders = useAppSelector(selectSidebarFolders);
  const collection = useAppSelector(selectCollectionData);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImport = async () => {
    const result = await window.electronAPI.importPostmanCollection();

    if (result.canceled) return;

    if (result.error) {
      setImportStatus(`Import failed: ${result.error}`);
      setTimeout(() => setImportStatus(null), 3000);
      return;
    }

    if (result.collection) {
      // Detect conflicts
      const conflictSummary = detectImportConflicts(collection, result.collection);

      if (conflictSummary.hasConflicts) {
        // Open conflict resolution modal
        dispatch(
          uiActions.openImportConflictModal({
            collection: result.collection,
            conflictSummary,
            warnings: result.warnings || [],
          }),
        );
      } else {
        // No conflicts - proceed with merge (adds all items since no duplicates)
        dispatch(collectionActions.importCollection({ collection: result.collection, mode: 'merge' }));

        const warningCount = result.warnings?.length || 0;
        const successMsg = warningCount > 0 ? `Imported with ${warningCount} warning(s)` : 'Collection imported';
        setImportStatus(successMsg);
        setTimeout(() => setImportStatus(null), 3000);
      }
    }
  };

  const handleExport = async () => {
    const result = await window.electronAPI.exportPostmanCollection(collection);

    if (result.canceled) return;

    if (result.error) {
      setImportStatus(`Export failed: ${result.error}`);
      setTimeout(() => setImportStatus(null), 3000);
      return;
    }

    setImportStatus('Collection exported');
    setTimeout(() => setImportStatus(null), 3000);
  };

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
      dispatch(collectionActions.reorderFolder({ activeId: active.id as string, overId: over.id as string }));
      return;
    }

    if (activeType === 'item') {
      const activeFolderId = active.data.current?.folderId;

      if (overType === 'folder') {
        if (activeFolderId !== over.id) {
          dispatch(collectionActions.moveRequest({ itemId: active.id as string, targetFolderId: over.id as string }));
        }
        return;
      }

      if (overType === 'item') {
        const overFolderId = over.data.current?.folderId;

        if (activeFolderId === overFolderId) {
          dispatch(collectionActions.reorderRequest({ activeId: active.id as string, overId: over.id as string }));
        } else {
          const targetFolder = folders.find((f) => f.id === overFolderId);
          const targetIndex = targetFolder?.items.findIndex((i) => i.id === over.id) ?? -1;
          dispatch(
            collectionActions.moveRequest({
              itemId: active.id as string,
              targetFolderId: overFolderId as string,
              targetIndex: targetIndex >= 0 ? targetIndex : undefined,
            }),
          );
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
      dispatch(collectionActions.renameFolder({ folderId, newName: newName.trim() }));
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
      <div className="flex items-center justify-between px-3 py-2 border-b border-border dark:border-dark-border gap-2">
        <div
          className="flex items-center gap-2 hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer rounded px-1 py-0.5 h-6.5 w-full"
          onClick={() => dispatch(collectionActions.addFolder('New Folder'))}
          title="New Folder"
        >
          <AddIcon className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary" />
          <span className="text-xs text-text-secondary dark:text-dark-text-secondary">New Folder</span>
        </div>
        <div className="flex items-center gap-1">
          <ImportIcon
            className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary hover:text-button-primary cursor-pointer transition-colors"
            onClick={handleImport}
            title="Import Collection"
          />
          <ExportIcon
            className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary hover:text-button-primary cursor-pointer transition-colors"
            onClick={handleExport}
            title="Export Collection"
          />
        </div>
      </div>

      {importStatus && (
        <div className="px-3 py-1.5 text-xs text-text-secondary dark:text-dark-text-secondary bg-button-secondary dark:bg-dark-input">
          {importStatus}
        </div>
      )}

      {folders.length > 0 ? (
        <div className="h-full overflow-x-hidden overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={allSortableIds} strategy={verticalListSortingStrategy}>
              {folders.map((folder) => (
                <CollectionGroup
                  key={folder.id}
                  folder={folder}
                  folderCount={folders.length}
                  isEditing={editingFolderId === folder.id}
                  editingName={editingName}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onEditingNameChange={setEditingName}
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
