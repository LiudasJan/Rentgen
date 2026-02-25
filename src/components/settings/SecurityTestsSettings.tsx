import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectDisabledSecurityTests } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';
import {
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  CORS_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  MIME_SNIFFING_PROTECTION_TEST_NAME,
  NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
  NOT_FOUND_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
  UNSUPPORTED_METHOD_TEST_NAME,
  UPPERCASE_DOMAIN_TEST_NAME,
  UPPERCASE_PATH_TEST_NAME,
} from '../../tests/SecurityTests';
import Toggle from '../inputs/Toggle';

const securityTests: string[] = [
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  CORS_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
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

  return (
    <div className="flex flex-col gap-4">
      <h5 className="flex items-center justify-between gap-4 m-0 pb-1.5 border-b border-b-border dark:border-b-dark-border">
        <span>Security Tests</span>
        <span className="font-normal text-xs text-text-secondary">
          {securityTests.length - disabledSecurityTests.length}/{securityTests.length} enabled
        </span>
      </h5>
      <p className="m-0 text-xs text-text-secondary">
        Toggle individual security tests on or off to customize your testing experience.
      </p>
      <div className="flex flex-col gap-2">
        {securityTests.sort().map((test) => (
          <Toggle
            key={test}
            className="text-xs justify-between"
            label={<span className={cn({ 'opacity-50': disabledSecurityTests.includes(test) })}>{test}</span>}
            checked={!disabledSecurityTests.includes(test)}
            onChange={() => dispatch(settingsActions.toggleSecurityTest(test))}
          />
        ))}
      </div>
    </div>
  );
}
