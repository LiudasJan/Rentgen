import { useMemo, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { ORIGINAL_REQUEST_TEST_PARAMETER_NAME } from '../../tests';
import { HttpResponse, TestResult, TestResults } from '../../types';
import { detectObjectType, extractBodyFromResponse, truncateValue } from '../../utils';
import Button from '../buttons/Button';
import PotentialBugsTable, { PotentialBug } from '../tables/PotentialBugsTable';
import { JsonDiffViewer } from '../viewers/JsonDiffViewer';
import Panel, { Props as PanelProps } from './Panel';

import 'react-tabs/style/react-tabs.css';

interface Props extends PanelProps {
  items: TestResults[];
  response: HttpResponse;
}

export default function TestResultsComparisonPanel({ items, title, response, ...otherProps }: Props) {
  const [diffReady, setDiffReady] = useState<boolean>(false);
  const [showNoise, setShowNoise] = useState<boolean>(false);
  const [statistics, setStatistics] = useState({
    percent: 0,
    added: 0,
    removed: 0,
    unchanged: 0,
  });
  const [tabIndex, setTabIndex] = useState<number>(0);

  const noisePaths = useMemo(() => {
    if (items.length < 2) return null;

    const originalResponse = items[0].dataDrivenTests.find(
      (test) => test.name === ORIGINAL_REQUEST_TEST_PARAMETER_NAME,
    )?.response;
    if (!originalResponse) return null;

    return findNoiseFields(normalizeResponse(originalResponse), normalizeResponse(response));
  }, [items, response]);

  const filteredItems = useMemo(() => {
    const filterTestArray = (tests: TestResult[]) =>
      tests.map((test) => {
        const updatedTest = { ...test };
        delete updatedTest.responseTime;
        delete updatedTest.request;

        const normalizedResponse = normalizeResponse(updatedTest.response);
        return {
          ...updatedTest,
          response:
            !noisePaths || noisePaths.length === 0 || !normalizedResponse || showNoise
              ? normalizedResponse
              : removeNoiseFields(normalizedResponse, noisePaths),
        };
      });

    return items.map((item) => ({
      crudTests: filterTestArray(item.crudTests),
      dataDrivenTests: filterTestArray(item.dataDrivenTests),
      performanceTests: filterTestArray(item.performanceTests),
      securityTests: filterTestArray(item.securityTests),
    }));
  }, [items, noisePaths, showNoise]);

  const potentialBugs = useMemo(() => {
    if (items.length < 2) return null;

    const collectPotentialBugs = (
      originalTests: TestResult[],
      modifiedTests: TestResult[],
      showValue?: boolean,
    ): PotentialBug[] =>
      originalTests.flatMap((originalTest, index) => {
        const modifiedTest = modifiedTests[index];
        const originalResponse = normalizeResponse(originalTest?.response);
        const modifiedResponse = normalizeResponse(modifiedTest?.response);
        const issues = compareHttpResponses(originalResponse, modifiedResponse);

        if (issues.length === 0) return [];

        return [
          {
            name: `⚠️ ${originalTest.name}` + (showValue ? ` (value: ${truncateValue(originalTest.value)})` : ''),
            issue: transformIssues(issues),
            originalResponse,
            modifiedResponse,
          },
        ];
      });

    return [
      ...collectPotentialBugs(items[0].securityTests, items[1].securityTests),
      ...collectPotentialBugs(items[0].performanceTests, items[1].performanceTests),
      ...collectPotentialBugs(items[0].dataDrivenTests, items[1].dataDrivenTests, true),
    ];
  }, [items]);

  return (
    <Panel className="flex flex-col h-[calc(100vh-2.5rem)] box-border" title={title} {...otherProps}>
      {items.length < 2 ? (
        <p className="p-4 m-0">No test results to compare</p>
      ) : (
        <Tabs
          className="react-tabs h-full flex flex-col overflow-hidden"
          forceRenderTabPanel={true}
          selectedIndex={tabIndex}
          selectedTabClassName="react-tabs__tab--selected bg-body! border-border! text-text! dark:bg-dark-body! dark:border-dark-body! dark:text-dark-text! after:content-none!"
          selectedTabPanelClassName="react-tabs__tab-panel--selected h-full"
          onSelect={(index) => setTabIndex(index)}
        >
          <TabList className="react-tabs__tab-list m-0! px-2.5! border-border! dark:border-dark-body!">
            <Tab className="react-tabs__tab text-sm">Potential Bugs</Tab>
            <Tab className="react-tabs__tab text-sm">Full Behavior Changes</Tab>
          </TabList>

          <TabPanel className="react-tabs__tab-panel p-4 bg-body dark:bg-dark-body overflow-hidden">
            <div className="h-full flex flex-col gap-4">
              {!potentialBugs || potentialBugs.length === 0 ? (
                <p className="m-0 p-2.5 text-sm text-white text-center rounded-md bg-green-600">
                  No potential bugs detected ✅
                </p>
              ) : (
                <PotentialBugsTable data={potentialBugs} />
              )}
              <div>
                <Button onClick={() => setTabIndex(1)}>Show Full Behavior Changes</Button>
              </div>
            </div>
          </TabPanel>
          <TabPanel className="react-tabs__tab-panel bg-body dark:bg-dark-body">
            <div className="h-full flex flex-col">
              <div className="shrink-0 flex flex-col p-4 gap-4 text-sm border-b border-border dark:border-dark-body">
                <div className="flex items-center gap-2">
                  <span>
                    Behavior Change: <b>{statistics.percent}%</b>
                  </span>
                  <span className="text-green-500">+{statistics.added}</span>
                  <span className="text-red-500">-{statistics.removed}</span>
                  <span>={statistics.unchanged}</span>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    className="m-0"
                    disabled={!diffReady}
                    type="checkbox"
                    onChange={(e) => {
                      setShowNoise(e.target.checked);
                      setDiffReady(false);
                    }}
                  />
                  Show noise
                </label>
              </div>
              <JsonDiffViewer
                className="flex-1 py-4"
                data={filteredItems}
                calculateStatistics={setStatistics}
                isDiffReady={setDiffReady}
              />
            </div>
          </TabPanel>
        </Tabs>
      )}
    </Panel>
  );
}

function normalizeResponse(response: HttpResponse): HttpResponse | null {
  if (!response) return null;

  return {
    ...response,
    body: response.body ? (extractBodyFromResponse(response) as any) : response.body,
  };
}

function findNoiseFields(firstObject: Record<string, any>, secondObject: Record<string, any>, path = ''): string[] {
  if (!firstObject || !secondObject) return [];

  const result: string[] = [];
  const keys = new Set<string>([...Object.keys(firstObject), ...Object.keys(secondObject)]);

  for (const key of keys) {
    const currentPath = path ? `${path}.${key}` : key;
    const firstValue = firstObject[key];
    const secondValue = secondObject[key];
    const bothObjects =
      typeof firstValue === 'object' &&
      typeof secondValue === 'object' &&
      firstValue !== null &&
      secondValue !== null &&
      !Array.isArray(firstValue) &&
      !Array.isArray(secondValue);

    if (bothObjects) result.push(...findNoiseFields(firstValue, secondValue, currentPath));
    else if (firstValue !== secondValue) result.push(currentPath);
  }

  return result;
}

function removeNoiseFields<T extends object>(object: T, noisePaths: string[]): T {
  const clone = structuredClone(object);

  for (const path of noisePaths) {
    const keys = path.split('.');
    let current: any = clone;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current || typeof current !== 'object') {
        current = null;
        break;
      }
      current = current[keys[i]];
    }

    const lastKey = keys[keys.length - 1];
    if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, lastKey))
      delete current[lastKey];
  }

  return clone;
}

export function compareHttpResponses(
  originalResponse: HttpResponse | null,
  modifiedResponse: HttpResponse | null,
): string[] {
  const issues: string[] = [];

  if (originalResponse == null && modifiedResponse == null) return issues;
  if (originalResponse != null && modifiedResponse == null) return ['Entire response disappeared'];
  if (originalResponse == null && modifiedResponse != null) return ['Entire response appeared'];

  if (originalResponse.status !== modifiedResponse.status)
    issues.push(`Status changed: '${originalResponse.status}' → '${modifiedResponse.status}'`);

  issues.push(...compareHttpResponseBodies(originalResponse.body, modifiedResponse.body));

  return issues;
}

export function compareHttpResponseBodies(originalValue: any, modifiedValue: any, path: string = 'body'): string[] {
  const issues: string[] = [];

  const hasOwnKey = (record: Record<string, unknown>, key: string): boolean =>
    Object.prototype.hasOwnProperty.call(record, key);

  const compare = (
    previous: unknown,
    current: unknown,
    currentPath: string,
    previousExists: boolean,
    currentExists: boolean,
  ): void => {
    if (previousExists && !currentExists) {
      issues.push(`'${currentPath}' disappeared`);
      return;
    }

    if (!previousExists && currentExists) {
      issues.push(`'${currentPath}' appeared`);
      return;
    }

    if (!previousExists && !currentExists) return;

    const previousType = detectObjectType(previous);
    const currentType = detectObjectType(current);

    if (previousType !== currentType) {
      issues.push(`Type changed at '${currentPath}': '${previousType}' → '${currentType}'`);
      return;
    }

    if (previousType === 'object') {
      const previousObject =
        previous !== null && typeof previous === 'object' && !Array.isArray(previous)
          ? (previous as Record<string, unknown>)
          : {};
      const currentObject =
        current !== null && typeof current === 'object' && !Array.isArray(current)
          ? (current as Record<string, unknown>)
          : {};
      const allKeys = new Set([...Object.keys(previousObject), ...Object.keys(currentObject)]);

      for (const key of allKeys) {
        compare(
          previousObject[key],
          currentObject[key],
          `${currentPath}.${key}`,
          hasOwnKey(previousObject, key),
          hasOwnKey(currentObject, key),
        );
      }

      return;
    }

    if (previousType === 'array') {
      const previousArray = Array.isArray(previous) ? previous : [];
      const currentArray = Array.isArray(current) ? current : [];
      const maxLength = Math.max(previousArray.length, currentArray.length);

      for (let index = 0; index < maxLength; index++) {
        compare(
          previousArray[index],
          currentArray[index],
          `${currentPath}[${index}]`,
          index < previousArray.length,
          index < currentArray.length,
        );
      }

      return;
    }
  };

  compare(originalValue, modifiedValue, path, originalValue !== undefined, modifiedValue !== undefined);

  return issues;
}

function transformIssues(issues: string[]): string {
  const appeared: string[] = [];
  const disappeared: string[] = [];
  const otherLines: string[] = [];

  for (const issue of issues) {
    const match = issue.trim().match(/^'([^']+)'\s+(appeared|disappeared)$/);

    if (match) {
      const [, field, status] = match;

      if (status === 'appeared') appeared.push(`'${field}'`);
      else disappeared.push(`'${field}'`);
    } else otherLines.push(issue);
  }

  const summary: string[] = [];
  if (appeared.length) summary.push(`Appeared: ${appeared.join(', ')}.`);
  if (disappeared.length) summary.push(`Disappeared: ${disappeared.join(', ')}.`);

  return [...otherLines, ...summary].join('\n');
}
