import { useEffect, useRef, useState } from 'react';
import MonacoEditor, { Monaco, OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { rentgenLightTheme, rentgenDarkTheme } from './monaco/themes';
import { useContextMenu } from './context-menu';
import cn from "classnames";

// Configure Monaco to use local ESM bundle instead of CDN (required for Electron)
loader.config({ monaco });

interface Props {
  source: string | object;
  className?: string;
}

const getInitialTheme = () => document.documentElement.classList.contains('dark');

export function JsonViewer({ source, className }: Props) {
  const [isDark, setIsDark] = useState(getInitialTheme);
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { showContextMenu } = useContextMenu() ?? {};
  const showContextMenuRef = useRef(showContextMenu);

  useEffect(() => {
    showContextMenuRef.current = showContextMenu;
  }, [showContextMenu]);

  useEffect(() => {
    const checkTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');
    }
  }, [isDark]);

  if (!source || typeof source === 'string') {
    return (
      <pre className="m-0! text-[#0451a5] dark:text-[#c3612f] whitespace-pre-wrap break-all">{String(source)}</pre>
    );
  }

  const jsonString = JSON.stringify(source, null, 2);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    monacoInstance.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monacoInstance.editor.defineTheme('rentgen-dark', rentgenDarkTheme);

    monacoInstance.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');

    editor.onContextMenu((e) => {
      e.event.preventDefault();
      e.event.stopPropagation();

      const selection = editor.getSelection();
      const model = editor.getModel();
      const selectedText = selection && model ? model.getValueInRange(selection) : '';
      const browserEvent = e.event.browserEvent as MouseEvent;

      showContextMenuRef.current?.(browserEvent.clientX, browserEvent.clientY, selectedText);
    });
  };

  return (
    <div
        className={cn('h-[360px]', className)}>
      <MonacoEditor
        height="100%"
        language="json"
        value={jsonString}
        theme={isDark ? 'rentgen-dark' : 'rentgen-light'}
        onMount={handleEditorDidMount}
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
      />
    </div>
  );
}
