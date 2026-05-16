import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18n from '../../i18n';
import { Language } from '../../i18n/languages';
import { appConfig } from '../../constants/appConfig';
import { Interval } from '../../types';

export type HistoryRetention = '1w' | '1m' | '3m' | '6m' | '1y' | 'none';

export interface SettingsState {
  cli: unknown;
  general: {
    history: {
      enabled: boolean;
      size: number;
      retention: HistoryRetention;
    };
  };
  testEngine: {
    configuration: {
      email: {
        domain: string;
      };
      randomEmail: {
        length: number;
      };
      randomInt: Interval;
      randomString: {
        length: number;
      };
      enum: string;
      number: Interval;
      string: {
        maxLength: number;
      };
    };
    securityTests: {
      disabled: string[];
    };
  };
  theme: 'light' | 'dark';
  language: Language;
}

export const initialState: SettingsState = {
  cli: {},
  general: {
    history: {
      enabled: true,
      size: 1000,
      retention: 'none',
    },
  },
  testEngine: {
    configuration: {
      email: {
        domain: appConfig.domain,
      },
      randomEmail: {
        length: 8,
      },
      randomInt: {
        min: 0,
        max: 2147483647,
      },
      randomString: {
        length: 32,
      },
      enum: '',
      number: {
        min: -10000,
        max: 10000,
      },
      string: {
        maxLength: 128,
      },
    },
    securityTests: {
      disabled: [],
    },
  },
  theme: 'light',
  language: 'en',
};

export const loadSettings = createAsyncThunk('settings/load', async () => {
  return await window.electronAPI.loadSettings();
});

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setHistoryEnabled: (state, action: PayloadAction<boolean>) => {
      state.general.history.enabled = action.payload;
    },
    setHistorySize: (state, action: PayloadAction<number>) => {
      state.general.history.size = Math.max(1, Math.min(10000, action.payload));
    },
    setHistoryRetention: (state, action: PayloadAction<HistoryRetention>) => {
      state.general.history.retention = action.payload;
    },
    setEmailDomain: (state, action: PayloadAction<string>) => {
      state.testEngine.configuration.email.domain = action.payload;
    },
    setRandomEmailLength: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.randomEmail.length = action.payload;
    },
    setRandomIntMin: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.randomInt.min = action.payload;
    },
    setRandomIntMax: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.randomInt.max = action.payload;
    },
    setRandomStringLength: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.randomString.length = action.payload;
    },
    setEnum: (state, action: PayloadAction<string>) => {
      state.testEngine.configuration.enum = action.payload;
    },
    setNumberMin: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.number.min = action.payload;
    },
    setNumberMax: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.number.max = action.payload;
    },
    setStringMaxLength: (state, action: PayloadAction<number>) => {
      state.testEngine.configuration.string.maxLength = action.payload;
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
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      i18n.changeLanguage(action.payload);
    },
    replaceSettings: (state, action: PayloadAction<SettingsState>) => {
      Object.assign(state, action.payload);
      applyTheme(state);
      if (action.payload.language) i18n.changeLanguage(action.payload.language);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadSettings.fulfilled, (state, action: PayloadAction<SettingsState>) => {
      state.cli = action.payload.cli;
      state.testEngine = { ...state.testEngine, ...action.payload.testEngine };
      state.theme = action.payload.theme;
      state.language = action.payload.language || 'en';

      if (action.payload.language) i18n.changeLanguage(action.payload.language);
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
