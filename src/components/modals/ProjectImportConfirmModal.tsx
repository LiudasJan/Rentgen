import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectProjectImportConfirmModal } from '../../store/selectors';
import { collectionActions } from '../../store/slices/collectionSlice';
import { environmentActions } from '../../store/slices/environmentSlice';
import { historyActions } from '../../store/slices/historySlice';
import { settingsActions } from '../../store/slices/settingsSlice';
import { uiActions } from '../../store/slices/uiSlice';
import { IntegrityStatus } from '../../types';
import Modal from './Modal';
import Button, { ButtonType } from '../buttons/Button';

function IntegrityBadge({ status }: { status: IntegrityStatus }) {
  switch (status) {
    case 'verified':
      return <span className="text-green-600 dark:text-green-400 text-xs font-medium">Verified</span>;
    case 'modified':
      return <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">Modified</span>;
    case 'missing':
      return <span className="text-text-secondary text-xs font-medium">No checksum</span>;
  }
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return isoString;
  }
}

export default function ProjectImportConfirmModal() {
  const dispatch = useAppDispatch();
  const { isOpen, data, meta, integrityStatus, fileName } = useAppSelector(selectProjectImportConfirmModal);

  if (!isOpen || !data || !meta || !integrityStatus) return null;

  const folderCount = data.collection?.item?.length ?? 0;
  const requestCount = data.collection?.item?.reduce((acc, folder) => acc + (folder.item?.length ?? 0), 0) ?? 0;
  const environmentCount = data.environments?.length ?? 0;
  const dynamicVariableCount = data.dynamicVariables?.length ?? 0;
  const historyCount = data.history?.length ?? 0;

  const handleClose = () => {
    dispatch(uiActions.closeProjectImportConfirmModal());
  };

  const handleConfirmImport = () => {
    dispatch(collectionActions.setCollection(data.collection));
    dispatch(environmentActions.setEnvironments(data.environments));
    dispatch(environmentActions.replaceDynamicVariables(data.dynamicVariables));
    dispatch(historyActions.setEntries(data.history));
    dispatch(settingsActions.replaceSettings(data.settings));
    dispatch(uiActions.closeProjectImportConfirmModal());

    dispatch(collectionActions.selectRequest(null));
    dispatch(collectionActions.selectFolder('default'));
    dispatch(environmentActions.selectEnvironment(null));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <h4 className="m-0">Import Project</h4>

        <div className="flex flex-col gap-2 text-xs text-text-secondary dark:text-dark-text-secondary">
          <div className="flex justify-between">
            <span>File</span>
            <span className="text-text dark:text-dark-text font-medium">{fileName}</span>
          </div>
          <div className="flex justify-between">
            <span>Exported</span>
            <span className="text-text dark:text-dark-text">{formatDate(meta.exportedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>App Version</span>
            <span className="text-text dark:text-dark-text">{meta.appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>Integrity</span>
            <IntegrityBadge status={integrityStatus} />
          </div>
        </div>

        {integrityStatus === 'modified' && (
          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="m-0 text-xs text-yellow-700 dark:text-yellow-400">
              File integrity check failed. This file may have been modified outside of Rentgen. Proceed with caution.
            </p>
          </div>
        )}

        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="m-0 text-xs text-red-700 dark:text-red-400 font-medium mb-2">
            This will overwrite ALL your current data:
          </p>
          <ul className="m-0 pl-4 text-xs text-red-600 dark:text-red-400 flex flex-col gap-1">
            <li>
              Collections ({folderCount} folders, {requestCount} requests)
            </li>
            <li>Environments ({environmentCount} environments)</li>
            <li>Dynamic Variables ({dynamicVariableCount} variables)</li>
            <li>History ({historyCount} entries)</li>
            <li>Settings (theme, test engine, history config)</li>
          </ul>
          <p className="m-0 mt-2 text-xs text-red-700 dark:text-red-400 font-medium">This action cannot be undone.</p>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button buttonType={ButtonType.DANGER} onClick={handleConfirmImport}>
            Import Project
          </Button>
          <Button buttonType={ButtonType.SECONDARY} onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
