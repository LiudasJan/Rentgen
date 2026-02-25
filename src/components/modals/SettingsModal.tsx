import cn from 'classnames';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectOpenSettingsModal } from '../../store/selectors';
import { uiActions } from '../../store/slices/uiSlice';
import { IconButton } from '../buttons/IconButton';
import { SecurityTestsSettings } from '../settings/SecurityTestsSettings';
import { ThemeSettings } from '../settings/ThemeSettings';
import Modal from './Modal';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';
import CliIcon from '../../assets/icons/cli-icon.svg';
import EngineIcon from '../../assets/icons/engine-icon.svg';
import GearIcon from '../../assets/icons/gear-icon.svg';
import ThemeIcon from '../../assets/icons/theme-icon.svg';

const settingsTabs = [
  { name: 'Test Engine', icon: <EngineIcon className="w-4 h-4" />, component: <SecurityTestsSettings /> },
  {
    name: 'General',
    icon: <GearIcon className="w-4 h-4" />,
    component: (
      <div className="flex flex-col gap-4">
        <h5 className="m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border">History Size</h5>
        <div className="flex items-center gap-2 text-sm">
          <GearIcon className="w-4 h-4" /> In Progress...
        </div>
      </div>
    ),
  },
  {
    name: 'Themes',
    icon: <ThemeIcon className="w-4 h-4" />,
    component: (
      <>
        <p className="m-0 text-xs text-text-secondary">
          Personalize your experience with themes that match your style.
        </p>
        <ThemeSettings />
      </>
    ),
  },
  {
    name: 'CLI',
    icon: <CliIcon className="w-4 h-4" />,
    component: (
      <p className="m-0 text-sm">
        <strong>Rentgen CLI is currently in active development.</strong>
        <br />
        <br />
        The Rentgen CLI will provide automation-ready execution for teams integrating structural testing into CI/CD
        workflows.
      </p>
    ),
  },
];

export default function SettingsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectOpenSettingsModal);

  const onClose = () => dispatch(uiActions.closeSettingsModal());

  return (
    <Modal
      className="[&>div]:h-[84vh] [&>div]:max-h-210 [&>div]:w-full! [&>div]:max-w-211.5! [&>div]:p-0! [&>div]:overflow-hidden"
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
          {settingsTabs.map(({ name, icon }, index) => (
            <Tab
              key={name}
              className={cn(
                'flex items-center gap-2 py-3 px-4 text-sm list-none outline-none cursor-pointer hover:bg-white dark:hover:bg-dark-body',
                { 'rounded-tl-md': index === 0 },
              )}
            >
              {icon}
              {name}
            </Tab>
          ))}
        </TabList>
        {settingsTabs.map(({ name, component }, index) => (
          <TabPanel key={name} className="flex-auto hidden p-4 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <h4 className="m-0">{name}</h4>
              {component}
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </Modal>
  );
}
