import cn from 'classnames';
import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { securityTemplates } from '../../tests/reports/security-templates';
import { TestResult, TestStatus } from '../../types';
import { generateCurl } from '../../utils';
import { CopyButton } from '../buttons/CopyButton';

import BugIcon from '../../assets/icons/bug-icon.svg';

interface Props extends HTMLAttributes<HTMLDivElement> {
  testResult: TestResult;
}

export function TestResultControls({ children, className, testResult, ...otherProps }: Props) {
  return (
    <div className={twMerge(cn('w-full flex items-center justify-between flex-wrap gap-1', className))} {...otherProps}>
      {children}
      {renderControl(testResult)}
    </div>
  );
}

function renderControl({ name, request, response, status }: TestResult) {
  switch (status) {
    case TestStatus.Bug:
    case TestStatus.Fail:
    case TestStatus.Warning:
      return (
        <CopyButton
          className="h-6 w-6 p-0 leading-0 text-button-text-secondary hover:text-button-text-secondary-hover bg-transparent hover:bg-transparent  border-0"
          copiedFallback="✅"
          textToCopy={fillTemplate(securityTemplates[name], {
            CURL: generateCurl(request),
            RESPONSE_HEADERS_BLOCK: JSON.stringify(response.headers, null, 2),
          })}
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
  return template.replace(/{{(.*?)}}/g, (_, key) => (key in data ? data[key] : `{{${key}}}`));
}
