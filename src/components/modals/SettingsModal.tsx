import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectOpenSettingsModal } from '../../store/selectors';
import { uiActions } from '../../store/slices/uiSlice';
import { IconButton } from '../buttons/IconButton';
import { SecurityTestsSettings } from '../settings/SecurityTestsSettings';
import { ThemeSettings } from '../settings/ThemeSettings';
import Modal from './Modal';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';
import GearIcon from '../../assets/icons/gear-icon.svg';
import ThemeIcon from '../../assets/icons/theme-icon.svg';

export default function SettingsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectOpenSettingsModal);

  const onClose = () => {
    dispatch(uiActions.closeSettingsModal());
  };

  return (
    <Modal
      className="[&>div]:h-[84vh] [&>div]:max-h-210 [&>div]:w-full! [&>div]:max-w-211.5! [&>div]:p-0!"
      isOpen={isOpen}
      onClose={onClose}
    >
      <IconButton className="absolute top-3 right-3" onClick={onClose}>
        <ClearCrossIcon className="h-5 w-5" />
      </IconButton>
      <Tabs
        className="h-full flex"
        forceRenderTabPanel={true}
        selectedTabClassName="bg-white dark:bg-dark-body"
        selectedTabPanelClassName="block!"
      >
        <TabList className="min-w-40 flex flex-col m-0 p-0 bg-button-secondary dark:bg-dark-input rounded-l-md">
          <Tab className="flex items-center gap-2 py-3 px-4 text-sm rounded-tl-md list-none outline-none cursor-pointer hover:bg-white dark:hover:bg-dark-body">
            <GearIcon className="w-4 h-4" />
            General
          </Tab>
          <Tab className="flex items-center gap-2 py-3 px-4 text-sm list-none outline-none cursor-pointer hover:bg-white dark:hover:bg-dark-body">
            <ThemeIcon className="w-4 h-4" />
            Themes
          </Tab>
        </TabList>
        <TabPanel className="flex-auto hidden p-4">
          <div className="flex flex-col gap-4">
            <h4 className="m-0">General</h4>
            <SecurityTestsSettings />
          </div>
        </TabPanel>
        <TabPanel className="flex-auto hidden p-4">
          <div className="flex flex-col gap-4">
            <h4 className="m-0">Themes</h4>
            <p className="m-0 text-xs text-text-secondary">
              Personalize your experience with themes that match your style.
            </p>
            <ThemeSettings />
          </div>
        </TabPanel>
      </Tabs>
    </Modal>
  );
}
