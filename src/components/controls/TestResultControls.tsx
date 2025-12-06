import cn from 'classnames';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
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
  const templates: Record<string, Record<string, string>> = {
    security: securityTemplates,
    performance: performanceTemplates,
  };
  const template = templates[testType]?.[name];
  if (!template) return null;

  let filledTemplate = '';
  if (testType === 'security')
    filledTemplate = fillTemplate(template, {
      CURL: request ? generateCurl(request) : '',
      RESPONSE_HEADERS_BLOCK: response?.headers ? JSON.stringify(response.headers, null, 2) : '',
    });

  if (testType === 'performance')
    filledTemplate = fillTemplate(template, {
      MEDIAN_MS: actual || '',
      YELLOW_OR_RED: status === TestStatus.Warning ? 'YELLOW' : 'RED',
      PING: value && Array.isArray(value) ? (value as number[]).join(', ') : '',
    });

  if (!filledTemplate) return null;

  switch (status) {
    case TestStatus.Bug:
    case TestStatus.Fail:
    case TestStatus.Warning:
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
    default:
      return null;
  }
}

function fillTemplate(template: string, data: Record<string, string>): string {
  return template ? template.replace(/{{(.*?)}}/g, (_, key) => (key in data ? data[key] : `{{${key}}}`)) : '';
}
