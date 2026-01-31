import type { editor } from 'monaco-editor';

export const rentgenLightTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {},
};

export const rentgenDarkTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#343a46',
  },
};

//text-[#0451a5] dark:text-[#ce9178]
export const rentgenLightPlaintextTheme: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.foreground': '#0451a5',
  },
};

export const rentgenDarkPlaintextTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#343a46',
    'editor.foreground': '#ce9178',
  },
};
