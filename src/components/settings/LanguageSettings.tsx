import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectLanguage } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';

const languages = [
  { label: 'English', value: 'en' as const },
  { label: 'Lietuvių', value: 'lt' as const },
];

export function LanguageSettings() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  const onLanguageChange = (value: 'en' | 'lt') => {
    if (value === language) return;
    dispatch(settingsActions.setLanguage(value));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-xs text-text-secondary">{t('settings.languageSection.description')}</p>
      <div className="flex border border-border dark:border-dark-border rounded-md divide-x divide-border dark:divide-dark-border overflow-hidden">
        {languages.map(({ label, value }) => (
          <label
            key={value}
            className={cn(
              'flex-1 flex items-center gap-2 p-3 hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer',
              { 'bg-button-secondary': value === language, 'dark:bg-dark-input': value === language },
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
