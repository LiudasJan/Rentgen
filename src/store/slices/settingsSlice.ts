import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HistoryRetention = '1w' | '1m' | '3m' | '6m' | '1y' | 'none';

export interface SettingsState {
  cli: unknown;
  general: {
    historyEnabled: boolean;
    historySize: number;
    historyRetention: HistoryRetention;
  };
  testEngine: {
    securityTests: {
      disabled: string[];
    };
  };
  theme: 'light' | 'dark';
}

export const initialState: SettingsState = {
  cli: {},
  general: {
    historyEnabled: true,
    historySize: 1000,
    historyRetention: 'none',
  },
  testEngine: {
    securityTests: {
      disabled: [],
    },
  },
  theme: 'light',
};

export const loadSettings = createAsyncThunk('settings/load', async () => {
  return await window.electronAPI.loadSettings();
});

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHistoryEnabled: (state, action: PayloadAction<boolean>) => {
      state.general.historyEnabled = action.payload;
    },
    setHistorySize: (state, action: PayloadAction<number>) => {
      state.general.historySize = Math.max(1, Math.min(10000, action.payload));
    },
    setHistoryRetention: (state, action: PayloadAction<HistoryRetention>) => {
      state.general.historyRetention = action.payload;
    },
    toggleSecurityTest: (state, action: PayloadAction<string>) => {
      if (state.testEngine.securityTests.disabled.includes(action.payload))
        state.testEngine.securityTests.disabled = state.testEngine.securityTests.disabled.filter(
          (test) => test !== action.payload,
        );
      else state.testEngine.securityTests.disabled.push(action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(state);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      applyTheme(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action: PayloadAction<SettingsState>) => {
      state.cli = action.payload.cli;
      state.general = action.payload.general;
      state.testEngine = action.payload.testEngine;
      state.theme = action.payload.theme;

      if (action.payload.theme === 'dark') document.documentElement.classList.add('dark');
    });
  },
});

function applyTheme(state: SettingsState) {
  if (state.theme === 'light') document.documentElement.classList.remove('dark');
  else document.documentElement.classList.add('dark');
}

export const settingsActions = settingsSlice.actions;
export default settingsSlice.reducer;
