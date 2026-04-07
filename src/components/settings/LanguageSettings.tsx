import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectLanguage } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';

const languages = [
  { label: 'English', value: 'en' as const },
  { label: 'Lietuvių', value: 'lt' as const },
  { label: 'Polski', value: 'pl' as const },
  { label: 'Українська', value: 'uk' as const },
  { label: 'Español', value: 'es' as const },
];

export function LanguageSettings() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  const onLanguageChange = (value: 'en' | 'lt' | 'pl' | 'uk' | 'es') => {
    if (value === language) return;
    dispatch(settingsActions.setLanguage(value));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-xs text-text-secondary">{t('settings.languageSection.description')}</p>
      <div className="grid grid-cols-2 border border-border dark:border-dark-border rounded-md overflow-hidden">
        {languages.map(({ label, value }, index) => (
          <label
            key={value}
            className={cn(
              'flex items-center gap-2 p-3 hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer',
              'border-border dark:border-dark-border',
              { 'bg-button-secondary dark:bg-dark-input': value === language },
              index % 2 === 0 && 'border-r',
              index < languages.length - (languages.length % 2 === 0 ? 2 : languages.length % 2) && 'border-b',
            )}
          >
            <input
              className="m-0"
              type="radio"
              name="language"
              value={value}
              checked={value === language}
              onChange={() => onLanguageChange(value)}
            />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
      <p className="m-0 text-xs text-text-secondary">
        {t('settings.languageSection.feedback')}{' '}
        <a
          className="text-button-primary hover:underline cursor-pointer"
          onClick={() => window.electronAPI.openExternal('https://github.com/LiudasJan/Rentgen/issues/new')}
        >
          {t('settings.languageSection.feedbackLink')}
        </a>
      </p>
    </div>
  );
}
