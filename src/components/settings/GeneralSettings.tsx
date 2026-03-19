import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectHistoryEnabled, selectHistoryRetention, selectHistorySize } from '../../store/selectors';
import { HistoryRetention, settingsActions } from '../../store/slices/settingsSlice';
import { uiActions } from '../../store/slices/uiSlice';
import Input from '../inputs/Input';
import SimpleSelect from '../inputs/SimpleSelect';
import Toggle from '../inputs/Toggle';

const retentionOptions = [
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'none', label: 'No Retention' },
];

export function GeneralSettings() {
  const dispatch = useAppDispatch();
  const historyEnabled = useAppSelector(selectHistoryEnabled);
  const historySize = useAppSelector(selectHistorySize);
  const historyRetention = useAppSelector(selectHistoryRetention);

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
        <span>History</span>
        <span className="font-normal text-xs text-text-secondary">{historyEnabled ? 'Enabled' : 'Disabled'}</span>
      </h5>
      <p className="m-0 text-xs text-text-secondary">Configure how request history is collected and retained.</p>

      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden">
        <Toggle
          className="p-3 text-xs justify-between hover:bg-button-secondary dark:hover:bg-dark-input"
          label={<span className={cn({ 'opacity-50': !historyEnabled })}>Enable History</span>}
          checked={historyEnabled}
          onChange={(e) => dispatch(settingsActions.setHistoryEnabled(e.target.checked))}
        />

        <div className="flex items-center justify-between py-1.75 px-3">
          <span className={cn({ 'opacity-50': !historyEnabled }, 'text-xs')}>Maximum Size</span>
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
          <span className={cn({ 'opacity-50': !historyEnabled }, 'text-xs')}>Retention Period</span>
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
        <span>Project</span>
      </h5>
      <p className="m-0 text-xs text-text-secondary">
        Export or import your entire project including collections, environments, variables, history, and settings.
      </p>

      <div className="flex gap-3">
        <button
          className="flex-1 py-2 px-4 text-xs font-medium rounded-md border border-border dark:border-dark-border hover:bg-button-secondary dark:hover:bg-dark-input transition-colors cursor-pointer"
          onClick={handleExportProject}
        >
          Export Project
        </button>
        <button
          className="flex-1 py-2 px-4 text-xs font-medium rounded-md border border-border dark:border-dark-border hover:bg-button-secondary dark:hover:bg-dark-input transition-colors cursor-pointer"
          onClick={handleImportProject}
        >
          Import Project
        </button>
      </div>
    </div>
  );
}
