import cn from 'classnames';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import {
  LOAD_TEST_NAME,
  MEDIAN_RESPONSE_TIME_TEST_NAME,
  NETWORK_SHARE_TEST_NAME,
  PING_LATENCY_TEST_NAME,
  RESPONSE_SIZE_CHECK_TEST_NAME,
} from '../../tests';
import { performanceTemplates, securityTemplates } from '../../tests/reports';
import { TestResult, TestStatus } from '../../types';
import { generateCurl } from '../../utils';
import { CopyButton } from '../buttons/CopyButton';

import BugIcon from '../../assets/icons/bug-icon.svg';

type TestType = 'security' | 'performance';

interface Props extends HTMLAttributes<HTMLDivElement> {
  testResult: TestResult;
  testType: TestType;
}

export function TestResultControls({ children, className, testResult, testType, ...otherProps }: Props) {
  return (
    <div className={twMerge(cn('w-full flex items-center justify-between flex-wrap gap-1', className))} {...otherProps}>
      {children}
      {renderControl(testResult, testType)}
    </div>
  );
}

function renderControl({ actual, name, request, response, status, value }: TestResult, testType: TestType) {
  switch (status) {
    case TestStatus.Bug:
    case TestStatus.Fail:
    case TestStatus.Warning: {
      const templates: Record<string, Record<string, string>> = {
        security: securityTemplates,
        performance: performanceTemplates,
      };
      const template = templates[testType]?.[name];
      if (!template) return null;

      let filledTemplate = '';
      if (testType === 'security')
        filledTemplate = fillTemplate(template, {
          CURL: request ? generateCurl(request) : '-',
          RESPONSE_HEADERS_BLOCK: response?.headers ? JSON.stringify(response.headers, null, 2) : '-',
        });

      if (testType === 'performance') {
        if (name === LOAD_TEST_NAME)
          filledTemplate = fillTemplate(template, {
            threads: value && typeof value === 'object' && 'threads' in value ? value.threads : '-',
            requests: value && typeof value === 'object' && 'requests' in value ? value.requests : '-',
            CURL: request ? generateCurl(request) : '-',
            RESPONSE_PERF_BLOCK: actual || '-',
          });

        if (name === MEDIAN_RESPONSE_TIME_TEST_NAME)
          filledTemplate = fillTemplate(template, {
            MEDIAN_MS: actual || '-',
            YELLOW_OR_RED: status === TestStatus.Warning ? 'YELLOW' : 'RED',
          });

        if (name === NETWORK_SHARE_TEST_NAME)
          filledTemplate = fillTemplate(template, {
            BEST_PING_MS: value && typeof value === 'object' && 'pingTime' in value ? value.pingTime : '-',
            CURL: value && typeof value === 'object' && 'hostname' in value ? `ping ${value.hostname}` : '-',
            MEDIAN_RESPONSE_MS:
              value && typeof value === 'object' && 'medianResponseTime' in value
                ? value.medianResponseTime.toFixed(0)
                : '-',
            RATIO_PERCENT:
              value && typeof value === 'object' && 'ratioPercent' in value ? value.ratioPercent.toFixed(2) : '-',
            PING_RESULTS_BLOCK: actual || '-',
          });

        if (name === PING_LATENCY_TEST_NAME)
          filledTemplate = fillTemplate(template, {
            PING: value && Array.isArray(value) ? (value as number[]).join(', ') : '-',
          });

        if (name === RESPONSE_SIZE_CHECK_TEST_NAME)
          filledTemplate = fillTemplate(template, {
            CURL: request ? generateCurl(request) : '-',
            RESPONSE_SIZE: value || '-',
          });
      }

      if (!filledTemplate) return null;

      return (
        <CopyButton
          className="h-6 w-6 p-0 leading-0 text-button-text-secondary! hover:text-button-text-secondary-hover! bg-transparent! border-0"
          copiedFallback="✅"
          textToCopy={filledTemplate}
          title="Copy Bug Report"
        >
          <BugIcon className="h-4 w-4" />
        </CopyButton>
      );
    }
    default:
      return null;
  }
}

function fillTemplate(template: string, data: Record<string, string>): string {
  return template ? template.replace(/{{(.*?)}}/g, (_, key) => (key in data ? data[key] : `{{${key}}}`)) : '';
}
