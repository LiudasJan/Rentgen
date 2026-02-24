import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  general: {
    securityTests: {
      disabled: string[];
    };
  };
  theme: 'light' | 'dark';
}

export const initialState: SettingsState = {
  general: {
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
    toggleSecurityTest: (state, action: PayloadAction<string>) => {
      if (state.general.securityTests.disabled.includes(action.payload))
        state.general.securityTests.disabled = state.general.securityTests.disabled.filter(
          (test) => test !== action.payload,
        );
      else state.general.securityTests.disabled.push(action.payload);
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
      state.general = action.payload.general;
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
