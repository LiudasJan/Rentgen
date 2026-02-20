import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCollectionData, selectImportConflictModal } from '../../store/selectors';
import { uiActions } from '../../store/slices/uiSlice';
import { collectionActions, ImportMode } from '../../store/slices/collectionSlice';
import { countMergeAdditions } from '../../utils/collection';
import Modal from './Modal';
import Button, { ButtonType } from '../buttons/Button';

export default function ImportConflictModal() {
  const dispatch = useAppDispatch();
  const { isOpen, importedCollection, conflictSummary, warnings } = useAppSelector(selectImportConflictModal);
  const existingCollection = useAppSelector(selectCollectionData);

  const mergeStats = useMemo(() => {
    if (!importedCollection) return { folders: 0, requests: 0 };
    return countMergeAdditions(existingCollection, importedCollection);
  }, [existingCollection, importedCollection]);

  const handleClose = () => {
    dispatch(uiActions.closeImportConflictModal());
  };

  const handleImport = (mode: ImportMode) => {
    if (importedCollection) {
      dispatch(collectionActions.importCollection({ collection: importedCollection, mode }));
      dispatch(uiActions.setSidebarActiveTab('collections'));
      dispatch(uiActions.setRecentlyImportedFolderNames(importedCollection.item.map((f) => f.name)));
    }
    handleClose();
  };

  if (!isOpen || !conflictSummary || !importedCollection) return null;

  const totalImportedFolders = importedCollection.item.length;
  const totalImportedRequests = importedCollection.item.reduce((acc, folder) => acc + folder.item.length, 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text dark:text-dark-text m-0">Import Conflicts Detected</h2>

        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
          <p className="m-0 mb-2">
            The imported collection &quot;{importedCollection.info.name}&quot; has conflicts with your existing
            collection:
          </p>

          {conflictSummary.collectionNameMatch && <p className="m-0 mb-1 text-xs">- Collection names match</p>}

          {conflictSummary.folderConflicts.length > 0 && (
            <p className="m-0 mb-1 text-xs">- {conflictSummary.folderConflicts.length} folder(s) with matching names</p>
          )}

          {conflictSummary.requestConflicts.length > 0 && (
            <p className="m-0 mb-1 text-xs">
              - {conflictSummary.requestConflicts.length} request(s) with matching URL+Method or name
            </p>
          )}

          {warnings.length > 0 && (
            <p className="m-0 mt-2 text-xs text-button-danger">Import warnings: {warnings.length}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {/* Replace Option */}
          <div className="p-3 border border-border dark:border-dark-border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="m-0 text-sm font-bold text-text dark:text-dark-text">Replace</h4>
                <p className="m-0 text-xs text-text-secondary dark:text-dark-text-secondary">
                  Replace entire existing collection ({totalImportedFolders} folders, {totalImportedRequests} requests)
                </p>
              </div>
              <Button buttonType={ButtonType.DANGER} onClick={() => handleImport('replace')}>
                Replace
              </Button>
            </div>
          </div>

          {/* Merge Option */}
          <div className="p-3 border border-border dark:border-dark-border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="m-0 text-sm font-bold text-text dark:text-dark-text">Merge</h4>
                <p className="m-0 text-xs text-text-secondary dark:text-dark-text-secondary">
                  Add unique items only (skips duplicates by URL+Method or name)
                  {mergeStats.folders > 0 && ` - ${mergeStats.folders} new folder(s)`}
                  {mergeStats.requests > 0 && ` - ${mergeStats.requests} new request(s)`}
                  {mergeStats.folders === 0 && mergeStats.requests === 0 && ' - No new items to add'}
                </p>
              </div>
              <Button
                buttonType={ButtonType.SECONDARY}
                disabled={mergeStats.folders === 0 && mergeStats.requests === 0}
                onClick={() => handleImport('merge')}
              >
                Merge
              </Button>
            </div>
          </div>

          {/* Import as Copy Option */}
          <div className="p-3 border border-border dark:border-dark-border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="m-0 text-sm font-bold text-text dark:text-dark-text">Import as Copy</h4>
                <p className="m-0 text-xs text-text-secondary dark:text-dark-text-secondary">
                  Add all folders with &quot;(copy)&quot; suffix ({totalImportedFolders} folders,{' '}
                  {totalImportedRequests} requests)
                </p>
              </div>
              <Button buttonType={ButtonType.SECONDARY} onClick={() => handleImport('copy')}>
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button buttonType={ButtonType.SECONDARY} onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
