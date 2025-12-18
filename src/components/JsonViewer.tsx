import { useEffect, useRef, useState } from 'react';
import MonacoEditor, { Monaco, OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { rentgenLightTheme, rentgenDarkTheme } from './monaco/themes';

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

  if (!source || typeof source === 'string') {
    return (
      <pre className="m-0! text-[#0451a5] dark:text-[#c3612f] whitespace-pre-wrap break-all">{String(source)}</pre>
    );
  }

  const jsonString = JSON.stringify(source, null, 2);
  const lineCount = jsonString.split('\n').length;
  const height = Math.min(Math.max(lineCount * 19 + 16, 100), 600);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;

    monaco.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monaco.editor.defineTheme('rentgen-dark', rentgenDarkTheme);

    monaco.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');
    }
  }, [isDark]);

  return (
    <div className={className} style={{ height }}>
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
            indentation: false,
          },
        }}
      />
    </div>
  );
}
