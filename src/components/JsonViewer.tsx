import MonacoEditor, { OnMount, loader } from '@monaco-editor/react';
import cn from 'classnames';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useMemo, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectTheme } from '../store/selectors';
import { extractValue, stringifyExtractedValue } from '../utils';
import { ResponsePanelContext, useContextMenu } from './context-menu';
import { rentgenDarkTheme, rentgenLightTheme } from './monaco/themes';

// Configure Monaco to use local ESM bundle instead of CDN (required for Electron)
loader.config({ monaco });

/**
 * Extract JSON path at a given offset in a formatted JSON string.
 * Returns the dot-notation path (e.g., "form.email" or "users[0].name")
 */
function getJsonPathAtOffset(jsonString: string, offset: number): string | null {
  try {
    // Use a stack-based approach to track context at each level
    interface StackFrame {
      type: 'object' | 'array';
      key?: string; // The key that led to this object/array
      arrayIndex?: number; // Current index if this is an array
    }

    const stack: StackFrame[] = [];
    let currentKey: string | null = null;
    let inString = false;
    let stringStart = -1;
    let escapeNext = false;
    let currentStringValue = '';
    let colonFound = false;

    const buildPath = (): string => {
      const parts: string[] = [];
      for (const frame of stack) {
        if (frame.key !== undefined) {
          parts.push(frame.key);
        }
        if (frame.type === 'array' && frame.arrayIndex !== undefined) {
          parts.push(`[${frame.arrayIndex}]`);
        }
      }
      return parts.join('.').replace(/\.\[/g, '[');
    };

    for (let i = 0; i < jsonString.length && i <= offset; i++) {
      const char = jsonString[i];

      if (escapeNext) {
        if (inString) currentStringValue += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        if (inString) currentStringValue += char;
        continue;
      }

      if (char === '"') {
        if (!inString) {
          inString = true;
          stringStart = i;
          currentStringValue = '';
        } else {
          inString = false;
          // Check if this string is a key (next non-whitespace is ':')
          let j = i + 1;
          while (j < jsonString.length && /\s/.test(jsonString[j])) j++;
          if (jsonString[j] === ':') {
            currentKey = currentStringValue;
            colonFound = false;
          } else {
            // This is a string value
            if (offset >= stringStart && offset <= i) {
              // Build the path including currentKey if we have one
              let path = buildPath();
              if (currentKey !== null && colonFound) {
                path = path ? `${path}.${currentKey}` : currentKey;
              }
              return path || null;
            }
          }
        }
        continue;
      }

      if (inString) {
        currentStringValue += char;
        continue;
      }

      if (char === ':') {
        colonFound = true;
        continue;
      }

      if (char === '{') {
        // Starting an object
        const frame: StackFrame = { type: 'object' };
        if (currentKey !== null && colonFound) {
          frame.key = currentKey;
          currentKey = null;
          colonFound = false;
        }
        // Check if parent is an array - need to set arrayIndex on parent
        const parent = stack[stack.length - 1];
        if (parent && parent.type === 'array' && parent.arrayIndex === undefined) {
          parent.arrayIndex = 0;
        }
        stack.push(frame);
        continue;
      }

      if (char === '}') {
        // Closing an object
        stack.pop();
        currentKey = null;
        colonFound = false;
        continue;
      }

      if (char === '[') {
        // Starting an array
        const frame: StackFrame = { type: 'array' };
        if (currentKey !== null && colonFound) {
          frame.key = currentKey;
          currentKey = null;
          colonFound = false;
        }
        stack.push(frame);
        continue;
      }

      if (char === ']') {
        // Closing an array
        stack.pop();
        continue;
      }

      if (char === ',') {
        // Comma - increment array index if in array context
        const current = stack[stack.length - 1];
        if (current && current.type === 'array') {
          current.arrayIndex = (current.arrayIndex ?? -1) + 1;
        }
        currentKey = null;
        colonFound = false;
        continue;
      }

      // Handle numbers, booleans, null (primitive values)
      if (/[0-9tfn-]/.test(char)) {
        let valueEnd = i;
        while (valueEnd < jsonString.length && /[0-9a-z.+eE-]/.test(jsonString[valueEnd])) {
          valueEnd++;
        }
        if (offset >= i && offset < valueEnd) {
          let path = buildPath();
          if (currentKey !== null && colonFound) {
            path = path ? `${path}.${currentKey}` : currentKey;
          }
          return path || null;
        }
        i = valueEnd - 1;
      }
    }

    // If we're at the offset and have a current key
    if (currentKey !== null && colonFound) {
      let path = buildPath();
      path = path ? `${path}.${currentKey}` : currentKey;
      return path;
    }

    return buildPath() || null;
  } catch {
    return null;
  }
}

interface Props {
  source: string | object;
  className?: string;
  responsePanelContext?: ResponsePanelContext;
}

export function JsonViewer({ source, className, responsePanelContext }: Props) {
  const theme = useAppSelector(selectTheme);
  const { showContextMenu } = useContextMenu();
  const isDark = useMemo(() => theme === 'dark', [theme]);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const responsePanelContextRef = useRef<ResponsePanelContext | undefined>(responsePanelContext);
  const sourceRef = useRef<string | object>(source);

  useEffect(() => {
    responsePanelContextRef.current = responsePanelContext;
  }, [responsePanelContext]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

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

      // Extract JSON path at cursor position
      let jsonPath: string | null = null;
      let jsonValue: string | null = null;
      if (model && selection) {
        const offset = model.getOffsetAt(selection.getStartPosition());
        const content = model.getValue();
        jsonPath = getJsonPathAtOffset(content, offset);

        // Extract the actual value at the JSON path
        if (jsonPath && sourceRef.current && typeof sourceRef.current === 'object') {
          const extracted = extractValue(sourceRef.current, jsonPath);
          jsonValue = stringifyExtractedValue(extracted);
        }
      }

      // Merge jsonPath and jsonValue into responsePanelContext
      const contextWithPath = responsePanelContextRef.current
        ? { ...responsePanelContextRef.current, jsonPath, jsonValue }
        : undefined;

      showContextMenu(browserEvent.clientX, browserEvent.clientY, selectedText, contextWithPath);
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
            alwaysConsumeMouseWheel: false,
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
