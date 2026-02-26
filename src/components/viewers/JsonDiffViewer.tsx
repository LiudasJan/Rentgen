import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import cn from 'classnames';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/selectors';
import TestRunningLoader from '../loaders/TestRunningLoader';
import { rentgenDarkTheme, rentgenLightTheme } from '../monaco/themes';

interface Props {
  className?: string;
  data: object[];
  calculateStatistics?(statistics: { percent: number; added: number; removed: number; unchanged: number }): void;
  isDiffReady?(ready: boolean): void;
}

export function JsonDiffViewer({ className, data, calculateStatistics, isDiffReady }: Props) {
  const theme = useAppSelector(selectTheme);
  const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const [diffReady, setDiffReady] = useState<boolean>(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (diffEditorRef.current && data.length >= 2) {
      setDiffReady(false);
      diffEditorRef.current
        .getOriginalEditor()
        .getModel()
        .setValue(JSON.stringify(data[0], null, 2));
      diffEditorRef.current
        .getModifiedEditor()
        .getModel()
        .setValue(JSON.stringify(data[1], null, 2));
    }
  }, [data]);

  useEffect(() => {
    if (diffReady && isDiffReady) isDiffReady(true);
  }, [diffReady, isDiffReady]);

  const computeStatistics = () => {
    if (!calculateStatistics) return;

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

    calculateStatistics({ percent, added, removed, unchanged });
  };

  const onMount: DiffOnMount = (editor, monaco) => {
    diffEditorRef.current = editor;

    monaco.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monaco.editor.defineTheme('rentgen-dark', rentgenDarkTheme);
    monaco.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');

    editor.onDidUpdateDiff(() => {
      computeStatistics();
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
    <div className={twMerge(cn('relative bg-white dark:bg-dark-input', className))}>
      <DiffEditor
        height="100%"
        language="json"
        modified={JSON.stringify(data[1], null, 2)}
        original={JSON.stringify(data[0], null, 2)}
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
            alwaysConsumeMouseWheel: false,
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
          <TestRunningLoader className="justify-center bg-white dark:bg-dark-input" text="Computing differences…" />
        </div>
      )}
    </div>
  );
}
