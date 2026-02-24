import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectSecurityTestsSettings } from '../../store/selectors';
import { settingsActions } from '../../store/slices/settingsSlice';
import {
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  LARGE_PAYLOAD_TEST_NAME,
  MIME_SNIFFING_PROTECTION_TEST_NAME,
  NO_SENSITIVE_SERVER_HEADERS_TEST_NAME,
  NOT_FOUND_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  REFLECTED_PAYLOAD_SAFETY_TEST_NAME,
  UNSUPPORTED_METHOD_TEST_NAME,
  UPPERCASE_DOMAIN_TEST_NAME,
  UPPERCASE_PATH_TEST_NAME,
} from '../../tests/SecurityTests';

const securityTests: string[] = [
  AUTHORIZATION_TEST_NAME,
  CACHE_CONTROL_PRIVATE_API_TEST_NAME,
  CLICKJACKING_PROTECTION_TEST_NAME,
  HSTS_STRICT_TRANSPORT_SECURITY_TEST_NAME,
  LARGE_PAYLOAD_TEST_NAME,
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
  const settings = useAppSelector(selectSecurityTestsSettings);

  return (
    <div className="flex flex-col gap-4">
      <h5 className="m-0 pb-1 border-b border-b-border dark:border-b-dark-border">Security Tests</h5>
      <p className="m-0 text-xs text-text-secondary">
        Enable or disable specific security tests to customize your testing experience. To disable a test, simply
        uncheck the corresponding option.
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 font-bold text-xs">
          <span>Name</span>
          <span>Enabled</span>
        </div>
        {securityTests.sort().map((test) => (
          <label key={test} className="flex items-center justify-between gap-2 text-xs cursor-pointer">
            {test}
            <span className="w-11.25 text-center">
              <input
                className="m-0"
                type="checkbox"
                value={test}
                checked={!settings.includes(test)}
                onChange={() => dispatch(settingsActions.toggleSecurityTest(test))}
              />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
