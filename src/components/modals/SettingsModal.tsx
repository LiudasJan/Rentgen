import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectOpenSettingsModal } from '../../store/selectors';
import { uiActions } from '../../store/slices/uiSlice';
import { IconButton } from '../buttons/IconButton';
import { CliSettings } from '../settings/CliSettings';
import { GeneralSettings } from '../settings/GeneralSettings';
import { LanguageSettings } from '../settings/LanguageSettings';
import { MappingSettings } from '../settings/MappingSettings';
import { SecurityTestsSettings } from '../settings/SecurityTestsSettings';
import { ThemeSettings } from '../settings/ThemeSettings';
import Modal from './Modal';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';
import CliIcon from '../../assets/icons/cli-icon.svg';
import EngineIcon from '../../assets/icons/engine-icon.svg';
import GearIcon from '../../assets/icons/gear-icon.svg';
import LanguageIcon from '../../assets/icons/environment-icon.svg';
import ThemeIcon from '../../assets/icons/theme-icon.svg';

export default function SettingsModal() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectOpenSettingsModal);

  const settingsTabs = [
    {
      name: t('settings.testEngine'),
      icon: <EngineIcon className="w-4 h-4" />,
      component: (
        <div className="flex flex-col gap-8">
          <MappingSettings />
          <SecurityTestsSettings />
        </div>
      ),
    },
    {
      name: t('settings.general'),
      icon: <GearIcon className="w-4 h-4" />,
      component: <GeneralSettings />,
    },
    {
      name: t('settings.themes'),
      icon: <ThemeIcon className="w-4 h-4" />,
      component: (
        <>
          <p className="m-0 text-xs text-text-secondary">{t('settings.themesDescription')}</p>
          <ThemeSettings />
        </>
      ),
    },
    {
      name: t('settings.language'),
      icon: <LanguageIcon className="w-4 h-4" />,
      component: <LanguageSettings />,
    },
    {
      name: t('settings.cli.name'),
      icon: <CliIcon className="w-4 h-4" />,
      component: <CliSettings />,
    },
  ];

  const onClose = () => dispatch(uiActions.closeSettingsModal());

  return (
    <Modal
      className="[&>div]:h-[84vh] [&>div]:max-h-210 [&>div]:w-full! [&>div]:max-w-211.5! [&>div]:p-0! [&>div]:overflow-hidden"
      isOpen={isOpen}
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
        {settingsTabs.map(({ name, component }) => (
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
