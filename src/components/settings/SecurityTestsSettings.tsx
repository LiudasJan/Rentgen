import cn from 'classnames';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectDisabledSecurityTests } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';
import {
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  CORS_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  INVALID_AUTHORIZATION_TEST_NAME,
  MIME_SNIFFING_PROTECTION_TEST_NAME,
  NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
  NOT_FOUND_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
  UNSUPPORTED_METHOD_TEST_NAME,
  UPPERCASE_DOMAIN_TEST_NAME,
  UPPERCASE_PATH_TEST_NAME,
} from '../../tests';
import Toggle from '../inputs/Toggle';

const securityTests: string[] = [
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  CORS_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  INVALID_AUTHORIZATION_TEST_NAME,
  MIME_SNIFFING_PROTECTION_TEST_NAME,
  NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
  NOT_FOUND_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
  UNSUPPORTED_METHOD_TEST_NAME,
  UPPERCASE_DOMAIN_TEST_NAME,
  UPPERCASE_PATH_TEST_NAME,
];

export function SecurityTestsSettings() {
  const dispatch = useAppDispatch();
  const disabledSecurityTests = useAppSelector(selectDisabledSecurityTests);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <h5 className="flex items-center justify-between gap-4 m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border">
        <span>{t('settings.securityTests.title')}</span>
        <span className="font-normal text-xs text-text-secondary">
          {t('settings.securityTests.enabledCount', {
            enabled: securityTests.length - disabledSecurityTests.length,
            total: securityTests.length,
          })}
        </span>
      </h5>
      <p className="m-0 text-xs text-text-secondary">{t('settings.securityTests.description')}</p>
      <div className="flex flex-col border border-border dark:border-dark-border rounded-md divide-y divide-border dark:divide-dark-border overflow-hidden">
        {securityTests.sort().map((test) => (
          <Toggle
            key={test}
            className="p-3 text-xs justify-between hover:bg-button-secondary dark:hover:bg-dark-input"
            label={<span className={cn({ 'opacity-50': disabledSecurityTests.includes(test) })}>{test}</span>}
            checked={!disabledSecurityTests.includes(test)}
            onChange={() => dispatch(settingsActions.toggleSecurityTest(test))}
          />
        ))}
      </div>
    </div>
  );
}
