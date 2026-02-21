import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';
import { ORIGINAL_REQUEST_TEST_PARAMETER_NAME } from '../../tests';
import { HttpResponse, TestResult, TestResults } from '../../types';
import { extractBodyFromResponse } from '../../utils';
import TestRunningLoader from '../loaders/TestRunningLoader';
import { rentgenDarkTheme, rentgenLightTheme } from '../monaco/themes';
import Panel, { Props as PanelProps } from './Panel';

interface Props extends PanelProps {
  items: TestResults[];
  response: HttpResponse;
}

export default function TestResultsComparisonPanel({ items, title, response, ...otherProps }: Props) {
  const theme = useAppSelector(selectTheme);
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const [diffReady, setDiffReady] = useState<boolean>(false);
  const [showNoise, setShowNoise] = useState<boolean>(false);
  const [statistics, setStatistics] = useState({
    percent: 0,
    added: 0,
    removed: 0,
    unchanged: 0,
  });
  const isDark = theme === 'dark';

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

  const calculateStatistics = () => {
    const editor = diffEditorRef.current;
    if (!editor) return;

    const changes = editor.getLineChanges() || [];
    const originalLines = editor.getOriginalEditor().getModel().getLineCount();
    const modifiedLines = editor.getModifiedEditor().getModel().getLineCount();

    let added = 0;
    let removed = 0;

    changes.forEach((change) => {
      if (change.originalEndLineNumber === 0)
        added += change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
      else if (change.modifiedEndLineNumber === 0)
        removed += change.originalEndLineNumber - change.originalStartLineNumber + 1;
      else {
        added += change.modifiedEndLineNumber - change.modifiedStartLineNumber + 1;
        removed += change.originalEndLineNumber - change.originalStartLineNumber + 1;
      }
    });

    const unchanged = Math.max(originalLines, modifiedLines) - Math.max(added, removed);
    const percent = Number((((added + removed) / (originalLines + modifiedLines)) * 100).toFixed(2));

    setStatistics({ percent, added, removed, unchanged });
  };

  const onMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;

    monaco.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monaco.editor.defineTheme('rentgen-dark', rentgenDarkTheme);
    monaco.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');

    editor.onDidUpdateDiff(() => {
      calculateStatistics();
      setDiffReady(true);
    });
  };

  useEffect(() => {
    return () => {
      if (diffEditorRef.current) {
        diffEditorRef.current.dispose();
        diffEditorRef.current = null;
      }
    };
  }, []);

  return (
    <Panel className="flex flex-col h-[calc(100vh-2.5rem)] box-border" title={title} {...otherProps}>
      {filteredItems.length < 2 ? (
        <p className="p-4 m-0">No test results to compare</p>
      ) : (
        <>
          <div className="shrink-0 flex flex-col p-4 gap-4 text-sm bg-body dark:bg-dark-body border-y border-border dark:border-dark-body">
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
          <div className="relative flex-1 p-4">
            <DiffEditor
              height="100%"
              language="json"
              modified={JSON.stringify(filteredItems[1], null, 2)}
              original={JSON.stringify(filteredItems[0], null, 2)}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                folding: true,
                foldingHighlight: false,
                stickyScroll: { enabled: false },
                renderLineHighlight: 'none',
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
                fontSize: 13,
                fontFamily: 'monospace',
                automaticLayout: true,
                contextmenu: false,
                selectionHighlight: false,
                occurrencesHighlight: 'off',
                renderWhitespace: 'none',
                guides: {
                  indentation: true,
                  bracketPairs: false,
                },
              }}
              theme={isDark ? 'rentgen-dark' : 'rentgen-light'}
              onMount={onMount}
            />
            {!diffReady && (
              <div className="absolute inset-0 flex z-90">
                <TestRunningLoader
                  className="justify-center bg-white dark:bg-dark-input"
                  text="Computing differences…"
                />
              </div>
            )}
          </div>
        </>
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
