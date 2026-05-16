import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectLanguage } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';
import { LANGUAGES, Language } from '../../i18n/languages';

export function LanguageSettings() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);

  const onLanguageChange = (value: Language) => {
    if (value === language) return;
    dispatch(settingsActions.setLanguage(value));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-xs text-text-secondary">{t('settings.languageSection.description')}</p>
      <div className="grid grid-cols-2 border border-border dark:border-dark-border rounded-md overflow-hidden">
        {LANGUAGES.map(({ label, code }, index) => (
          <label
            key={code}
            className={cn(
              'flex items-center gap-2 p-3 hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer',
              'border-border dark:border-dark-border',
              { 'bg-button-secondary dark:bg-dark-input': code === language },
              index % 2 === 0 && 'border-r',
              index < LANGUAGES.length - (LANGUAGES.length % 2 === 0 ? 2 : LANGUAGES.length % 2) && 'border-b',
            )}
          >
            <input
              className="m-0"
              type="radio"
              name="language"
              value={code}
              checked={code === language}
              onChange={() => onLanguageChange(code)}
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
