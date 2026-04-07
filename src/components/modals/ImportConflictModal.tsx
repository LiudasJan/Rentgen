import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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
    }
    handleClose();
  };

  if (!isOpen || !conflictSummary || !importedCollection) return null;

  const totalImportedFolders = importedCollection.item.length;
  const totalImportedRequests = importedCollection.item.reduce((acc, folder) => acc + folder.item.length, 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text dark:text-dark-text m-0">{t('modals.importConflict.title')}</h2>

        <div className="text-sm text-text-secondary dark:text-dark-text-secondary">
          <p className="m-0 mb-2">
            {t('modals.importConflict.conflictDescription', { name: importedCollection.info.name })}
          </p>

          {conflictSummary.collectionNameMatch && (
            <p className="m-0 mb-1 text-xs">- {t('modals.importConflict.collectionNamesMatch')}</p>
          )}

          {conflictSummary.folderConflicts.length > 0 && (
            <p className="m-0 mb-1 text-xs">
              - {t('modals.importConflict.folderConflicts', { count: conflictSummary.folderConflicts.length })}
            </p>
          )}

          {conflictSummary.requestConflicts.length > 0 && (
            <p className="m-0 mb-1 text-xs">
              - {t('modals.importConflict.requestConflicts', { count: conflictSummary.requestConflicts.length })}
            </p>
          )}

          {warnings.length > 0 && (
            <p className="m-0 mt-2 text-xs text-button-danger">
              {t('modals.importConflict.importWarnings', { count: warnings.length })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {/* Replace Option */}
          <div className="p-3 border border-border dark:border-dark-border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="m-0 text-sm font-bold text-text dark:text-dark-text">{t('common.replace')}</h4>
                <p className="m-0 text-xs text-text-secondary dark:text-dark-text-secondary">
                  {t('modals.importConflict.replaceDescription', {
                    folders: totalImportedFolders,
                    requests: totalImportedRequests,
                  })}
                </p>
              </div>
              <Button buttonType={ButtonType.DANGER} onClick={() => handleImport('replace')}>
                {t('common.replace')}
              </Button>
            </div>
          </div>

          {/* Merge Option */}
          <div className="p-3 border border-border dark:border-dark-border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="m-0 text-sm font-bold text-text dark:text-dark-text">{t('common.merge')}</h4>
                <p className="m-0 text-xs text-text-secondary dark:text-dark-text-secondary">
                  {t('modals.importConflict.mergeDescription')}
                  {mergeStats.folders > 0 &&
                    ` - ${t('modals.importConflict.newFolders', { count: mergeStats.folders })}`}
                  {mergeStats.requests > 0 &&
                    ` - ${t('modals.importConflict.newRequests', { count: mergeStats.requests })}`}
                  {mergeStats.folders === 0 &&
                    mergeStats.requests === 0 &&
                    ' - ' + t('modals.importConflict.noNewItems')}
                </p>
              </div>
              <Button
                buttonType={ButtonType.SECONDARY}
                disabled={mergeStats.folders === 0 && mergeStats.requests === 0}
                onClick={() => handleImport('merge')}
              >
                {t('common.merge')}
              </Button>
            </div>
          </div>

          {/* Import as Copy Option */}
          <div className="p-3 border border-border dark:border-dark-border rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="m-0 text-sm font-bold text-text dark:text-dark-text">
                  {t('modals.importConflict.importAsCopy')}
                </h4>
                <p className="m-0 text-xs text-text-secondary dark:text-dark-text-secondary">
                  {t('modals.importConflict.copyDescription', {
                    folders: totalImportedFolders,
                    requests: totalImportedRequests,
                  })}
                </p>
              </div>
              <Button buttonType={ButtonType.SECONDARY} onClick={() => handleImport('copy')}>
                {t('common.copy')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <Button buttonType={ButtonType.SECONDARY} onClick={handleClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
