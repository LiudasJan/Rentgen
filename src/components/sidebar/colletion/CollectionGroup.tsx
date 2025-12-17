import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import cn from 'classnames';
import { useMemo, useState } from 'react';
import { useCollectionRunner } from '../../../hooks/useCollectionRunner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectCollectionRunResults, selectRunningFolderId, selectSelectedFolderId } from '../../../store/selectors';
import { collectionActions } from '../../../store/slices/collectionSlice';
import { uiActions } from '../../../store/slices/uiSlice';
import { SidebarFolderData } from '../../../utils/collection';
import CollectionItem from './CollectionItem';

import ChevronIcon from '../../../assets/icons/chevron-icon.svg';
import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';
import EditIcon from '../../../assets/icons/edit-icon.svg';
import FolderIcon from '../../../assets/icons/folder-icon.svg';
import PlayIcon from '../../../assets/icons/play-icon.svg';
import StopIcon from '../../../assets/icons/stop-icon.svg';

interface Props {
  folder: SidebarFolderData;
  folderCount: number;
  isEditing: boolean;
  editingName: string;
  onStartEdit: (folderId: string) => void;
  onSaveEdit: (folderId: string, newName: string) => void;
  onCancelEdit: () => void;
  onEditingNameChange: (name: string) => void;
}

export default function CollectionGroup({
  folder,
  folderCount,
  isEditing,
  editingName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingNameChange,
}: Props) {
  const dispatch = useAppDispatch();
  const selectedFolderId = useAppSelector(selectSelectedFolderId);
  const runningFolderId = useAppSelector(selectRunningFolderId);
  const { runFolder, cancelRun } = useCollectionRunner();
  const [isExpanded, setIsExpanded] = useState(folderCount === 1);
  const isSelected = folder.id === selectedFolderId;
  const canEdit = true;
  const isThisFolderRunning = runningFolderId === folder.id;
  const isOtherFolderRunning = runningFolderId !== null && runningFolderId !== folder.id;
  const runResults = useAppSelector(selectCollectionRunResults);

  const folderStatus = useMemo(() => {
    const itemResults = folder.items.map((item) => runResults[item.id]).filter(Boolean);

    if (itemResults.length === 0) return null;

    const hasRed = itemResults.some((r) => !r.status || r.status < 200 || r.status >= 500);
    const hasOrange = itemResults.some((r) => r.status >= 400 && r.status < 500);

    if (hasRed) return 'red';
    if (hasOrange) return 'orange';
    return 'green';
  }, [folder.items, runResults]);

  const { attributes, isDragging, listeners, transform, transition, setNodeRef } = useSortable({
    id: folder.id,
    data: { type: 'folder' },
  });

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    dispatch(collectionActions.selectFolder(folder.id));
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit(folder.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    folder.items.length === 0
      ? dispatch(collectionActions.removeFolder(folder.id))
      : dispatch(uiActions.openDeleteFolderModal(folder.id));
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisFolderRunning) {
      cancelRun();
    } else {
      runFolder(folder.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSaveEdit(folder.id, editingName);
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        className={cn({
          'opacity-50 shadow-lg z-50': isDragging,
        })}
      >
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-input',
            'hover:bg-button-secondary dark:hover:bg-dark-input group cursor-pointer outline-none',
            {
              'bg-button-secondary dark:bg-dark-input': isSelected,
            },
          )}
          onClick={handleHeaderClick}
          {...attributes}
          {...listeners}
        >
          <ChevronIcon
            className={cn('h-4 w-4 text-text-secondary transition-transform', {
              'rotate-90': isExpanded,
            })}
          />
          <FolderIcon className="h-4 w-4 text-text-secondary" />

          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => onSaveEdit(folder.id, editingName)}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex-1 text-xs bg-transparent border border-border dark:border-dark-input dark:text-dark-text rounded px-1 py-0.5 outline-none focus:border-button-primary"
              autoFocus
            />
          ) : (
            <span className="flex-1 text-xs truncate">{folder.name}</span>
          )}

          <span className="text-xs text-text-secondary">{folder.items.length}</span>

          {folderStatus && (
            <span
              className={cn('w-2 h-2 rounded-full shrink-0', {
                'bg-green-500': folderStatus === 'green',
                'bg-orange-500': folderStatus === 'orange',
                'bg-red-500': folderStatus === 'red',
              })}
            />
          )}

          {folder.items.length > 0 &&
            !isEditing &&
            !isOtherFolderRunning &&
            (isThisFolderRunning ? (
              <StopIcon
                className="h-4 w-4 text-red-500 hover:text-red-600 cursor-pointer transition-opacity"
                onClick={handlePlayClick}
              />
            ) : (
              <PlayIcon
                className="h-4 w-4 text-green-500 hover:text-green-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePlayClick}
              />
            ))}

          {canEdit && !isEditing && (
            <EditIcon
              className="h-4 w-4 text-button-text-secondary dark:text-text-secondary hover:text-button-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleEditClick}
            />
          )}

          {!isEditing && (
            <ClearCrossIcon
              className="h-4 w-4 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDeleteClick}
            />
          )}
        </div>
      </div>

      {isExpanded && folder.items.length > 0 && (
        <div>
          {folder.items.map((item) => (
            <CollectionItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
