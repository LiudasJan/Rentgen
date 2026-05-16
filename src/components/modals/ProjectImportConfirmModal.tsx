import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectProjectImportConfirmModal } from '../../store/selectors';
import { collectionActions } from '../../store/slices/collectionSlice';
import { environmentActions } from '../../store/slices/environmentSlice';
import { historyActions } from '../../store/slices/historySlice';
import { settingsActions, SettingsState } from '../../store/slices/settingsSlice';
import { uiActions } from '../../store/slices/uiSlice';
import { HistoryEntry } from '../../types/history';
import IntegrityBadge from '../badges/IntegrityBadge';
import Modal from './Modal';
import Button, { ButtonSize, ButtonType } from '../buttons/Button';

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
  const [exported, setExported] = useState(false);
  const { t } = useTranslation();

  if (!isOpen || !data || !meta || !integrityStatus) return null;

  const folderCount = data.collection?.item?.length ?? 0;
  const requestCount = data.collection?.item?.reduce((acc, folder) => acc + (folder.item?.length ?? 0), 0) ?? 0;
  const environmentCount = data.environments?.length ?? 0;
  const dynamicVariableCount = data.dynamicVariables?.length ?? 0;
  const historyCount = data.history?.length ?? 0;

  const handleClose = () => {
    dispatch(uiActions.closeProjectImportConfirmModal());
  };

  const handleExportFirst = async () => {
    const result = await window.electronAPI.exportProject();
    if (result) {
      setExported(true);
    }
  };

  const handleConfirmImport = () => {
    dispatch(collectionActions.setCollection(data.collection));
    dispatch(environmentActions.setEnvironments(data.environments));
    dispatch(environmentActions.replaceDynamicVariables(data.dynamicVariables));
    dispatch(historyActions.setEntries(data.history as HistoryEntry[]));
    dispatch(settingsActions.replaceSettings(data.settings as unknown as SettingsState));
    dispatch(uiActions.closeProjectImportConfirmModal());

    dispatch(collectionActions.selectRequest(null));
    dispatch(collectionActions.selectFolder('default'));
    dispatch(environmentActions.selectEnvironment(null));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <h4 className="m-0">{t('modals.projectImport.title')}</h4>

        <div className="flex flex-col gap-2 text-xs text-text-secondary dark:text-dark-text-secondary">
          <div className="flex justify-between">
            <span>{t('modals.projectImport.file')}</span>
            <span className="text-text dark:text-dark-text font-medium">{fileName}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('modals.projectImport.exported')}</span>
            <span className="text-text dark:text-dark-text">{formatDate(meta.exportedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('modals.projectImport.appVersion')}</span>
            <span className="text-text dark:text-dark-text">{meta.appVersion}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('modals.projectImport.integrity')}</span>
            <IntegrityBadge status={integrityStatus} />
          </div>
        </div>

        {integrityStatus === 'modified' && (
          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="m-0 text-xs text-yellow-700 dark:text-yellow-400">
              {t('modals.projectImport.integrityWarning')}
            </p>
          </div>
        )}

        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="m-0 text-xs text-red-700 dark:text-red-400 font-medium mb-2">
            {t('modals.projectImport.overwriteWarning')}
          </p>
          <ul className="m-0 pl-4 text-xs text-red-600 dark:text-red-400 flex flex-col gap-1">
            <li>{t('modals.projectImport.collectionsCount', { folders: folderCount, requests: requestCount })}</li>
            <li>{t('modals.projectImport.environmentsCount', { count: environmentCount })}</li>
            <li>{t('modals.projectImport.dynamicVariablesCount', { count: dynamicVariableCount })}</li>
            <li>{t('modals.projectImport.historyCount', { count: historyCount })}</li>
            <li>{t('modals.projectImport.settingsInfo')}</li>
          </ul>
          <p className="m-0 mt-2 text-xs text-red-700 dark:text-red-400 font-medium">
            {t('modals.projectImport.cannotBeUndone')}
          </p>
        </div>

        <div className="flex items-center gap-2 pb-6">
          <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
            {t('modals.projectImport.backupBefore')}
          </span>
          {exported ? (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {t('modals.projectImport.exportedCheck')}
            </span>
          ) : (
            <Button buttonType={ButtonType.SECONDARY} buttonSize={ButtonSize.SMALL} onClick={handleExportFirst}>
              {t('modals.projectImport.exportCurrentProject')}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button buttonType={ButtonType.DANGER} onClick={handleConfirmImport}>
            {t('modals.projectImport.importProject')}
          </Button>
          <Button buttonType={ButtonType.SECONDARY} onClick={handleClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
