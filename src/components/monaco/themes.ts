import type { editor } from 'monaco-editor';

export const rentgenLightTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'string.key.json', foreground: 'a31515' },
    { token: 'string.value.json', foreground: '0451a5' },
    { token: 'number', foreground: '098658' },
    { token: 'keyword.json', foreground: '098658' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000',
    'editorLineNumber.foreground': '#999999',
    'editorLineNumber.activeForeground': '#000000',
    'editor.selectionBackground': '#add6ff',
    'editor.lineHighlightBackground': '#ffffff',
    'editorIndentGuide.background': '#d0d0d0',
    'editorIndentGuide.activeBackground': '#a0a0a0',
    'editorBracketPairGuide.background1': '#d0d0d0',
    'editorBracketPairGuide.activeBackground1': '#a0a0a0',
  },
};

export const rentgenDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'string.key.json', foreground: '9cdcfe' },
    { token: 'string.value.json', foreground: 'c3612f' },
    { token: 'number', foreground: '81c09b' },
    { token: 'keyword.json', foreground: '81c09b' },
  ],
  colors: {
    'editor.background': '#343a46',
    'editor.foreground': '#ffffff',
    'editorLineNumber.foreground': '#858d99',
    'editorLineNumber.activeForeground': '#ffffff',
    'editor.selectionBackground': '#264f78',
    'editor.lineHighlightBackground': '#343a46',
    'editorIndentGuide.background': '#4a5263',
    'editorIndentGuide.activeBackground': '#6a7285',
    'editorBracketPairGuide.background1': '#4a5263',
    'editorBracketPairGuide.activeBackground1': '#6a7285',
  },
};
