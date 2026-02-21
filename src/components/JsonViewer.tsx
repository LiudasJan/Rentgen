import MonacoEditor, { OnMount, loader } from '@monaco-editor/react';
import cn from 'classnames';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectTheme } from '../store/selectors';
import { extractValue, stringifyExtractedValue } from '../utils';
import { ResponsePanelContext, useContextMenu } from './context-menu';
import {
  rentgenDarkPlaintextTheme,
  rentgenDarkTheme,
  rentgenLightPlaintextTheme,
  rentgenLightTheme,
} from './monaco/themes';

// Configure Monaco to use local ESM bundle instead of CDN (required for Electron)
loader.config({ monaco });

/**
 * Stack frame for JSON parsing context
 */
interface StackFrame {
  type: 'object' | 'array';
  key?: string;
  arrayIndex?: number;
}

/**
 * Parser state for JSON traversal
 */
interface JsonParserState {
  stack: StackFrame[];
  currentKey: string | null;
  colonFound: boolean;
}

/**
 * Build dot-notation path from parser state
 */
function buildPathFromState(state: JsonParserState): string {
  const parts: string[] = [];
  for (const frame of state.stack) {
    if (frame.key !== undefined) {
      parts.push(frame.key);
    }
    if (frame.type === 'array' && frame.arrayIndex !== undefined) {
      parts.push(`[${frame.arrayIndex}]`);
    }
  }
  let path = parts.join('.').replace(/\.\[/g, '[');
  if (state.currentKey !== null && state.colonFound) {
    path = path ? `${path}.${state.currentKey}` : state.currentKey;
  }
  return path;
}

/**
 * Callback types for JSON parser events
 */
interface JsonParserCallbacks {
  onStringValue?: (path: string, startOffset: number, endOffset: number, line: number, endColumn: number) => boolean;
  onPrimitiveValue?: (path: string, startOffset: number, endOffset: number, line: number, endColumn: number) => boolean;
}

/**
 * Generic JSON parser that traverses formatted JSON and calls callbacks for values.
 * Returns early if any callback returns true (for optimization).
 */
function parseJsonWithCallbacks(jsonString: string, callbacks: JsonParserCallbacks, stopAtOffset?: number): void {
  const state: JsonParserState = {
    stack: [],
    currentKey: null,
    colonFound: false,
  };

  let inString = false;
  let stringStart = -1;
  let escapeNext = false;
  let currentStringValue = '';
  let line = 1;
  let column = 1;

  const maxOffset = stopAtOffset !== undefined ? stopAtOffset : jsonString.length - 1;

  for (let i = 0; i < jsonString.length && i <= maxOffset; i++) {
    const char = jsonString[i];

    if (escapeNext) {
      if (inString) currentStringValue += char;
      escapeNext = false;
      column++;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      if (inString) currentStringValue += char;
      column++;
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
          state.currentKey = currentStringValue;
          state.colonFound = false;
        } else {
          // This is a string value
          const path = buildPathFromState(state);
          if (path && callbacks.onStringValue?.(path, stringStart, i, line, column + 1)) {
            return;
          }
        }
      }
      column++;
      continue;
    }

    if (char === '\n') {
      line++;
      column = 1;
      continue;
    }

    if (inString) {
      currentStringValue += char;
      column++;
      continue;
    }

    if (char === ':') {
      state.colonFound = true;
      column++;
      continue;
    }

    if (char === '{') {
      const frame: StackFrame = { type: 'object' };
      if (state.currentKey !== null && state.colonFound) {
        frame.key = state.currentKey;
        state.currentKey = null;
        state.colonFound = false;
      }
      const parent = state.stack[state.stack.length - 1];
      if (parent && parent.type === 'array' && parent.arrayIndex === undefined) {
        parent.arrayIndex = 0;
      }
      state.stack.push(frame);
      column++;
      continue;
    }

    if (char === '}') {
      state.stack.pop();
      state.currentKey = null;
      state.colonFound = false;
      column++;
      continue;
    }

    if (char === '[') {
      const frame: StackFrame = { type: 'array' };
      if (state.currentKey !== null && state.colonFound) {
        frame.key = state.currentKey;
        state.currentKey = null;
        state.colonFound = false;
      }
      state.stack.push(frame);
      column++;
      continue;
    }

    if (char === ']') {
      state.stack.pop();
      column++;
      continue;
    }

    if (char === ',') {
      const current = state.stack[state.stack.length - 1];
      if (current && current.type === 'array') {
        current.arrayIndex = (current.arrayIndex ?? -1) + 1;
      }
      state.currentKey = null;
      state.colonFound = false;
      column++;
      continue;
    }

    // Handle numbers, booleans, null (primitive values)
    if (/[0-9tfn-]/.test(char)) {
      const valueStart = i;
      let valueEnd = i;
      while (valueEnd < jsonString.length && /[0-9a-z.+eE-]/.test(jsonString[valueEnd])) {
        valueEnd++;
      }
      const endCol = column + (valueEnd - i);
      const path = buildPathFromState(state);

      if (path && callbacks.onPrimitiveValue?.(path, valueStart, valueEnd, line, endCol)) {
        return;
      }

      column += valueEnd - i;
      i = valueEnd - 1;
      continue;
    }

    column++;
  }
}

/**
 * Extract JSON path at a given offset in a formatted JSON string.
 * Returns the dot-notation path (e.g., "form.email" or "users[0].name")
 */
function getJsonPathAtOffset(jsonString: string, offset: number): string | null {
  let result: string | null = null;

  try {
    parseJsonWithCallbacks(
      jsonString,
      {
        onStringValue: (path, startOffset, endOffset) => {
          if (offset >= startOffset && offset <= endOffset) {
            result = path;
            return true; // Stop parsing
          }
          return false;
        },
        onPrimitiveValue: (path, startOffset, endOffset) => {
          if (offset >= startOffset && offset < endOffset) {
            result = path;
            return true; // Stop parsing
          }
          return false;
        },
      },
      offset,
    );
  } catch {
    return null;
  }

  return result;
}

/**
 * Represents a JSON primitive value position in formatted JSON string
 */
interface JsonValuePosition {
  path: string;
  value: unknown;
  line: number;
  endColumn: number;
}

/**
 * Get all primitive JSON value positions from a formatted JSON string.
 * Returns positions for strings, numbers, booleans, and null values (not objects/arrays).
 */
function getAllJsonValuePositions(jsonString: string, sourceObject: object): JsonValuePosition[] {
  const positions: JsonValuePosition[] = [];

  try {
    parseJsonWithCallbacks(jsonString, {
      onStringValue: (path, _startOffset, _endOffset, line, endColumn) => {
        const value = extractValue(sourceObject, path);
        positions.push({ path, value, line, endColumn });
        return false; // Continue parsing
      },
      onPrimitiveValue: (path, _startOffset, _endOffset, line, endColumn) => {
        const value = extractValue(sourceObject, path);
        positions.push({ path, value, line, endColumn });
        return false; // Continue parsing
      },
    });
  } catch {
    // Return whatever positions we've collected so far
  }

  return positions;
}

interface Props {
  source: string | object;
  className?: string;
  responsePanelContext?: ResponsePanelContext;
  showVariableButtons?: boolean;
  onSetVariable?: (path: string, value: string) => void;
}

export function JsonViewer({ source, className, responsePanelContext, showVariableButtons, onSetVariable }: Props) {
  const theme = useAppSelector(selectTheme);
  const { showContextMenu } = useContextMenu();
  const isDark = theme === 'dark';
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const responsePanelContextRef = useRef<ResponsePanelContext | undefined>(responsePanelContext);
  const sourceRef = useRef<string | object>(source);
  const widgetsRef = useRef<Map<string, monaco.editor.IContentWidget>>(new Map());
  const widgetDomNodesRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const onSetVariableRef = useRef(onSetVariable);

  useEffect(() => {
    onSetVariableRef.current = onSetVariable;
  }, [onSetVariable]);

  useEffect(() => {
    responsePanelContextRef.current = responsePanelContext;
  }, [responsePanelContext]);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  // Update widget visibility based on hovered line
  useEffect(() => {
    widgetDomNodesRef.current.forEach((domNode, id) => {
      const linePart = id.split('-')[1];
      const widgetLine = parseInt(linePart, 10);
      if (widgetLine === hoveredLine) {
        domNode.classList.add('line-hovered');
      } else {
        domNode.classList.remove('line-hovered');
      }
    });
  }, [hoveredLine]);

  // Create content widget for a JSON value position
  const createPlusWidget = useCallback(
    (_: monaco.editor.IStandaloneCodeEditor, position: JsonValuePosition): monaco.editor.IContentWidget => {
      const domNode = document.createElement('button');
      domNode.className = 'json-plus-button';
      domNode.textContent = '+';
      domNode.title = `Set "${position.path}" as dynamic variable`;
      domNode.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const valueStr = stringifyExtractedValue(position.value);
        if (valueStr !== null && onSetVariableRef.current) {
          onSetVariableRef.current(position.path, valueStr);
        }
      };

      const widgetId = `plus-${position.line}-${position.endColumn}`;
      widgetDomNodesRef.current.set(widgetId, domNode);

      return {
        getId: () => widgetId,
        getDomNode: () => domNode,
        getPosition: () => ({
          position: { lineNumber: position.line, column: position.endColumn + 1 },
          preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
        }),
      };
    },
    [],
  );

  // Dispose all widgets
  const disposeAllWidgets = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    widgetsRef.current.forEach((widget) => {
      editor.removeContentWidget(widget);
    });
    widgetsRef.current.clear();
    widgetDomNodesRef.current.clear();
  }, []);

  // Create widgets when showVariableButtons is enabled
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !showVariableButtons || typeof source !== 'object') {
      disposeAllWidgets();
      return;
    }

    const jsonString = JSON.stringify(source, null, 2);
    const positions = getAllJsonValuePositions(jsonString, source);

    // Limit widgets for performance (cap at 500)
    const limitedPositions = positions.slice(0, 500);

    limitedPositions.forEach((pos) => {
      const widget = createPlusWidget(editor, pos);
      editor.addContentWidget(widget);
      widgetsRef.current.set(widget.getId(), widget);
    });

    return () => {
      disposeAllWidgets();
    };
  }, [source, showVariableButtons, createPlusWidget, disposeAllWidgets, isEditorMounted]);

  const isSourceObject = source != null && typeof source === 'object';
  const displayValue = isSourceObject ? JSON.stringify(source, null, 2) : String(source);
  const editorLanguage = isSourceObject ? 'json' : 'plaintext';

  const onMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    monacoInstance.editor.defineTheme('rentgen-light', rentgenLightTheme);
    monacoInstance.editor.defineTheme('rentgen-dark', rentgenDarkTheme);
    monacoInstance.editor.defineTheme('rentgen-light-plaintext', rentgenLightPlaintextTheme);
    monacoInstance.editor.defineTheme('rentgen-dark-plaintext', rentgenDarkPlaintextTheme);
    monacoInstance.editor.setTheme(isDark ? 'rentgen-dark' : 'rentgen-light');

    // Track hovered line for widget visibility
    editor.onMouseMove((e) => {
      if (e.target.position) {
        setHoveredLine(e.target.position.lineNumber);
      }
    });

    editor.onMouseLeave(() => {
      setHoveredLine(null);
    });

    setIsEditorMounted(true);

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
    <div className={cn('h-90', className)}>
      <MonacoEditor
        height="100%"
        language={editorLanguage}
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
        theme={
          isDark
            ? isSourceObject
              ? 'rentgen-dark'
              : 'rentgen-dark-plaintext'
            : isSourceObject
              ? 'rentgen-light'
              : 'rentgen-light-plaintext'
        }
        value={displayValue}
        onMount={onMount}
      />
    </div>
  );
}
