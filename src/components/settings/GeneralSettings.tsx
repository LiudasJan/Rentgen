import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectHistoryEnabled, selectHistoryRetention, selectHistorySize } from '../../store/selectors';
import { HistoryRetention, settingsActions } from '../../store/slices/settingsSlice';
import { uiActions } from '../../store/slices/uiSlice';
import Input from '../inputs/Input';
import SimpleSelect from '../inputs/SimpleSelect';
import Toggle from '../inputs/Toggle';
import Button, { ButtonType } from '../buttons/Button';

export function GeneralSettings() {
  const dispatch = useAppDispatch();
  const historyEnabled = useAppSelector(selectHistoryEnabled);
  const historySize = useAppSelector(selectHistorySize);
  const historyRetention = useAppSelector(selectHistoryRetention);
  const { t } = useTranslation();

  const retentionOptions = [
    { value: '1w', label: t('settings.history.week1') },
    { value: '1m', label: t('settings.history.month1') },
    { value: '3m', label: t('settings.history.months3') },
    { value: '6m', label: t('settings.history.months6') },
    { value: '1y', label: t('settings.history.year1') },
    { value: 'none', label: t('settings.history.noRetention') },
  ];

  const handleExportProject = async () => {
    const result = await window.electronAPI.exportProject();
    if (result.success) {
      dispatch(uiActions.setExported(true));
      setTimeout(() => dispatch(uiActions.setExported(false)), 2000);
    }
  };

  const handleImportProject = async () => {
    const result = await window.electronAPI.importProject();
    if (result.error) return;
    if (result.success && result.data && result.meta && result.integrityStatus) {
      dispatch(uiActions.closeSettingsModal());
      dispatch(
        uiActions.openProjectImportConfirmModal({
          data: result.data,
          meta: result.meta,
          integrityStatus: result.integrityStatus,
          fileName: result.fileName ?? 'unknown',
        }),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h5 className="flex items-center justify-between gap-4 m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border">
        <span>{t('settings.history.title')}</span>
        <span className="font-normal text-xs text-text-secondary">
          {historyEnabled ? t('common.enabled') : t('common.disabled')}
        </span>
      </h5>
      <p className="m-0 text-xs text-text-secondary">{t('settings.history.description')}</p>

      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden">
        <Toggle
          className="p-3 text-xs justify-between hover:bg-button-secondary dark:hover:bg-dark-input"
          label={<span className={cn({ 'opacity-50': !historyEnabled })}>{t('settings.history.enableHistory')}</span>}
          checked={historyEnabled}
          onChange={(e) => dispatch(settingsActions.setHistoryEnabled(e.target.checked))}
        />

        <div className="flex items-center justify-between py-1.75 px-3">
          <span className={cn({ 'opacity-50': !historyEnabled }, 'text-xs')}>{t('settings.history.maximumSize')}</span>
          <Input
            type="number"
            className="w-32 py-1.5"
            min={1}
            max={10000}
            value={historySize}
            disabled={!historyEnabled}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value)) dispatch(settingsActions.setHistorySize(value));
            }}
          />
        </div>

        <div className="flex items-center justify-between py-1.75 px-3">
          <span className={cn({ 'opacity-50': !historyEnabled }, 'text-xs')}>
            {t('settings.history.retentionPeriod')}
          </span>
          <SimpleSelect
            className="w-32 py-1.25"
            options={retentionOptions}
            value={historyRetention}
            disabled={!historyEnabled}
            onChange={(e) => dispatch(settingsActions.setHistoryRetention(e.target.value as HistoryRetention))}
          />
        </div>
      </div>

      <h5 className="flex items-center justify-between gap-4 m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border mt-4">
        <span>{t('settings.project.title')}</span>
      </h5>
      <p className="m-0 text-xs text-text-secondary">{t('settings.project.description')}</p>

      <div className="flex gap-3">
        <Button buttonType={ButtonType.SECONDARY} className="flex-1" onClick={handleExportProject}>
          {t('settings.project.exportProject')}
        </Button>
        <Button buttonType={ButtonType.SECONDARY} className="flex-1" onClick={handleImportProject}>
          {t('settings.project.importProject')}
        </Button>
      </div>
    </div>
  );
}
