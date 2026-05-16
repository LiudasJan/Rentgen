import { useTranslation } from 'react-i18next';
import { appConfig } from '../../constants/appConfig';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTestEngineConfiguration } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';
import { clamp } from '../../utils';
import Input from '../inputs/Input';

const MAX_INT32 = 2147483647;

export function MappingSettings() {
  const dispatch = useAppDispatch();
  const testEngineConfiguration = useAppSelector(selectTestEngineConfiguration);
  const randomEmailConfiguration = testEngineConfiguration.randomEmail;
  const randomIntConfiguration = testEngineConfiguration.randomInt;
  const randomStringConfiguration = testEngineConfiguration.randomString;
  const emailConfiguration = testEngineConfiguration.email;
  const enumConfiguration = testEngineConfiguration.enum;
  const numberConfiguration = testEngineConfiguration.number;
  const stringConfiguration = testEngineConfiguration.string;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <h5 className="m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border">
        {t('settings.configuration.title')}
      </h5>
      <p className="m-0 text-xs text-text-secondary">{t('settings.configuration.description')}</p>
      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden">
        <div className="flex flex-col gap-2 py-1.75 px-3 text-xs">
          <label className="m-0 font-bold">{t('settings.configuration.email')}</label>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.domain')}</span>
            <Input
              className="w-32 py-1.5"
              value={emailConfiguration.domain}
              onBlur={() => {
                if (/^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(emailConfiguration.domain)) return;
                dispatch(settingsActions.setEmailDomain(appConfig.domain));
              }}
              onChange={(event) => dispatch(settingsActions.setEmailDomain(event.target.value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.randomEmailLength')}</span>
            <Input
              className="w-32 py-1.5"
              type="number"
              value={randomEmailConfiguration.length ?? ''}
              onBlur={() => {
                if (randomEmailConfiguration.length) return;
                dispatch(settingsActions.setRandomEmailLength(1));
              }}
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), 1, 256);
                dispatch(settingsActions.setRandomEmailLength(isNaN(value) ? null : value));
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 py-1.75 px-3 text-xs">
          <label className="m-0 font-bold">{t('settings.configuration.enum')}</label>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.enumDescription')}</span>
            <Input
              className="w-32 py-1.5"
              value={enumConfiguration}
              onChange={(event) => dispatch(settingsActions.setEnum(event.target.value))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 py-1.75 px-3 text-xs">
          <label className="m-0 font-bold">{t('settings.configuration.number')}</label>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.minimumValue')}</span>
            <Input
              type="number"
              className="w-32 py-1.5"
              value={numberConfiguration.min ?? ''}
              onBlur={() =>
                dispatch(
                  settingsActions.setNumberMin(Math.min(numberConfiguration.min || -10000, numberConfiguration.max)),
                )
              }
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), -MAX_INT32, MAX_INT32);
                dispatch(settingsActions.setNumberMin(isNaN(value) ? null : value));
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.maximumValue')}</span>
            <Input
              type="number"
              className="w-32 py-1.5"
              value={numberConfiguration.max ?? ''}
              onBlur={() =>
                dispatch(
                  settingsActions.setNumberMax(Math.max(numberConfiguration.min, numberConfiguration.max || 10000)),
                )
              }
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), -MAX_INT32, MAX_INT32);
                dispatch(settingsActions.setNumberMax(isNaN(value) ? null : value));
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 py-1.75 px-3 text-xs">
          <label className="m-0 font-bold">{t('settings.configuration.string')}</label>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.maximumValueLength')}</span>
            <Input
              type="number"
              className="w-32 py-1.5"
              value={stringConfiguration.maxLength ?? ''}
              onBlur={() => {
                if (stringConfiguration.maxLength) return;
                dispatch(settingsActions.setStringMaxLength(1));
              }}
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), 1, 1000000);
                dispatch(settingsActions.setStringMaxLength(isNaN(value) ? null : value));
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 py-1.75 px-3 text-xs">
          <label className="m-0 font-bold">{t('settings.configuration.randomInteger')}</label>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.minimumValue')}</span>
            <Input
              type="number"
              className="w-32 py-1.5"
              value={randomIntConfiguration.min ?? ''}
              onBlur={() =>
                dispatch(
                  settingsActions.setRandomIntMin(
                    randomIntConfiguration.min ? Math.min(randomIntConfiguration.min, randomIntConfiguration.max) : 0,
                  ),
                )
              }
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), 0, MAX_INT32);
                dispatch(settingsActions.setRandomIntMin(isNaN(value) ? null : value));
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.maximumValue')}</span>
            <Input
              type="number"
              className="w-32 py-1.5"
              value={randomIntConfiguration.max ?? ''}
              onBlur={() =>
                dispatch(
                  settingsActions.setRandomIntMax(
                    randomIntConfiguration.max
                      ? Math.max(randomIntConfiguration.max, randomIntConfiguration.min)
                      : MAX_INT32,
                  ),
                )
              }
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), 0, MAX_INT32);
                dispatch(settingsActions.setRandomIntMax(isNaN(value) ? null : value));
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 py-1.75 px-3 text-xs">
          <label className="m-0 font-bold">{t('settings.configuration.randomString')}</label>
          <div className="flex items-center justify-between">
            <span>{t('settings.configuration.length')}</span>
            <Input
              type="number"
              className="w-32 py-1.5"
              value={randomStringConfiguration.length ?? ''}
              onBlur={() => {
                if (randomStringConfiguration.length) return;
                dispatch(settingsActions.setRandomStringLength(1));
              }}
              onChange={(event) => {
                const value = clamp(parseInt(event.target.value), 1, 4096);
                dispatch(settingsActions.setRandomStringLength(isNaN(value) ? null : value));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
