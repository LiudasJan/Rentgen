import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';
import { TestResults } from '../../types';
import { rentgenDarkTheme, rentgenLightTheme } from '../monaco/themes';
import Panel, { Props as PanelProps } from './Panel';

interface Props extends PanelProps {
  items: TestResults[];
}

export default function TestResultsComparisonPanel({ title, items, ...otherProps }: Props) {
  const theme = useAppSelector(selectTheme);
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const [statistics, setStatistics] = useState({
    percent: 0,
    added: 0,
    removed: 0,
    unchanged: 0,
  });
  const isDark = useMemo(() => theme === 'dark', [theme]);

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
    const percent = Math.round(((added + removed) / (originalLines + modifiedLines)) * 100);

    setStatistics({ percent, added, removed, unchanged });
  };

  const onMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;

    monaco.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monaco.editor.defineTheme('rentgen-dark', rentgenDarkTheme);
    monaco.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');

    editor.onDidUpdateDiff(() => calculateStatistics());
  };

  useEffect(() => {
    return () => {
      diffEditorRef.current.dispose();
      diffEditorRef.current = null;
    };
  }, []);

  return (
    <Panel className="flex flex-col h-[calc(100vh-2.5rem)] box-border" title={title} {...otherProps}>
      {items.length < 2 ? (
        <p className="p-4 m-0">No test results to compare</p>
      ) : (
        <>
          <div className="shrink-0 flex p-4 gap-2 text-sm bg-body dark:bg-dark-body border-y border-border dark:border-dark-body">
            <span>
              Behavior Change: <b>{statistics.percent}%</b>
            </span>
            <span className="text-green-500">+{statistics.added}</span>
            <span className="text-red-500">-{statistics.removed}</span>
            <span>={statistics.unchanged}</span>
          </div>
          <div className="flex-1 p-4">
            <DiffEditor
              height="100%"
              language="json"
              modified={JSON.stringify(items[1], null, 2)}
              original={JSON.stringify(items[0], null, 2)}
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
          </div>
        </>
      )}
    </Panel>
  );
}
