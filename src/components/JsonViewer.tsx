import MonacoEditor, { OnMount, loader } from '@monaco-editor/react';
import cn from 'classnames';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useMemo, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectTheme } from '../store/selectors';
import { useContextMenu } from './context-menu';
import { rentgenDarkTheme, rentgenLightTheme } from './monaco/themes';

// Configure Monaco to use local ESM bundle instead of CDN (required for Electron)
loader.config({ monaco });

interface Props {
  source: string | object;
  className?: string;
}

export function JsonViewer({ source, className }: Props) {
  const theme = useAppSelector(selectTheme);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { showContextMenu } = useContextMenu();
  const isDark = useMemo(() => theme === 'dark', [theme]);

  if (!source || typeof source === 'string') {
    return (
      <pre className="m-0! text-[#0451a5] dark:text-[#ce9178] whitespace-pre-wrap break-all">{String(source)}</pre>
    );
  }

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monaco.editor.defineTheme('rentgen-dark', rentgenDarkTheme);
    monaco.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');

    editor.onContextMenu((e) => {
      e.event.preventDefault();
      e.event.stopPropagation();

      const selection = editor.getSelection();
      const model = editor.getModel();
      const selectedText = selection && model ? model.getValueInRange(selection) : '';
      const browserEvent = e.event.browserEvent as MouseEvent;

      showContextMenu(browserEvent.clientX, browserEvent.clientY, selectedText);
    });
  };

  return (
    <div className={cn('h-[360px]', className)}>
      <MonacoEditor
        height="100%"
        language="json"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
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
          wordWrap: 'on',
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
        value={JSON.stringify(source, null, 2)}
        onMount={onMount}
      />
    </div>
  );
}
