import cn from 'classnames';
import { useEffect, useState } from 'react';
import { appConfig } from '../../constants/appConfig';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectHistoryEnabled, selectSidebarActiveTab } from '../../store/selectors';
import { environmentActions } from '../../store/slices/environmentSlice';
import { uiActions } from '../../store/slices/uiSlice';
import CollectionsPanel from './colletion/CollectionsPanel';
import EnvironmentPanel from './environment/EnvironmentPanel';
import HistoryPanel from './history/HistoryPanel';
import SidebarButton from './SidebarButton';

import BugIcon from '../../assets/icons/bug-icon.svg';
import CollectionIcon from '../../assets/icons/collection-icon.svg';
import EnvironmentIcon from '../../assets/icons/environment-icon.svg';
import GearIcon from '../../assets/icons/gear-icon.svg';
import HistoryIcon from '../../assets/icons/history-icon.svg';
import UpgradeStarIcon from '../../assets/icons/upgrade-star-icon.svg';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectSidebarActiveTab);
  const historyEnabled = useAppSelector(selectHistoryEnabled);
  const [appVersion, setAppVersion] = useState<string>('');

  const isExpanded = activeTab !== null;

  useEffect(() => {
    if (!historyEnabled && activeTab === 'history') {
      dispatch(uiActions.toggleSidebarTab('history'));
    }
  }, [historyEnabled, activeTab, dispatch]);

  useEffect(() => {
    const fetchAppVersion = async () => setAppVersion(await window.electronAPI.getAppVersion());
    fetchAppVersion();
  }, []);

  const handleCollectionClick = () => {
    dispatch(uiActions.toggleSidebarTab('collections'));
    dispatch(environmentActions.stopEditing());
  };

  const handleEnvironmentClick = () => {
    dispatch(uiActions.toggleSidebarTab('environments'));
  };

  const handleHistoryClick = () => {
    dispatch(uiActions.toggleSidebarTab('history'));
    dispatch(environmentActions.stopEditing());
  };

  return (
    <div
      className={cn(
        'h-screen sticky top-0 flex border-r border-border dark:border-dark-border bg-body dark:bg-dark-body transition-[width] duration-300',
        { 'w-22': !isExpanded, 'w-100': isExpanded },
      )}
    >
      <div className="w-22 shrink-0 flex flex-col justify-between">
        <div>
          <SidebarButton
            label="Collections"
            className={activeTab === 'collections' ? 'bg-button-secondary dark:bg-dark-input' : ''}
            onClick={handleCollectionClick}
          >
            <CollectionIcon className="w-5 h-5" />
          </SidebarButton>
          <SidebarButton
            label="Environments"
            className={activeTab === 'environments' ? 'bg-button-secondary dark:bg-dark-input' : ''}
            onClick={handleEnvironmentClick}
          >
            <EnvironmentIcon className="w-5 h-5" />
          </SidebarButton>
          {historyEnabled && (
            <SidebarButton
              label="History"
              className={activeTab === 'history' ? 'bg-button-secondary dark:bg-dark-input' : ''}
              onClick={handleHistoryClick}
            >
              <HistoryIcon className="w-5 h-5" />
            </SidebarButton>
          )}
        </div>
        <div>
          <SidebarButton label="Settings" onClick={() => dispatch(uiActions.openSettingsModal())}>
            <GearIcon className="w-5 h-5" />
          </SidebarButton>
          <SidebarButton
            label="Check for updates"
            onClick={() =>
              window.electronAPI.openExternal(`${appConfig.origin}/check-for-update.html?current_version=${appVersion}`)
            }
          >
            <UpgradeStarIcon className="w-5 h-5" />
          </SidebarButton>
          <SidebarButton
            label="Report feedback"
            onClick={() => window.electronAPI.openExternal('https://github.com/LiudasJan/Rentgen/issues/new')}
          >
            <BugIcon className="w-5 h-5" />
          </SidebarButton>
        </div>
      </div>
      <div className="border-l border-border dark:border-dark-border overflow-hidden bg-body dark:bg-dark-body">
        <div className="max-h-screen h-full w-78 flex flex-col overflow-hidden">
          {activeTab === 'collections' && <CollectionsPanel />}
          {activeTab === 'environments' && <EnvironmentPanel />}
          {activeTab === 'history' && historyEnabled && <HistoryPanel />}
        </div>
      </div>
    </div>
  );
}
