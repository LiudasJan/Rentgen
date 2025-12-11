import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Environment } from '../../types';

interface EnvironmentState {
  environments: Environment[];
  selectedEnvironmentId: string | null;
  isEditing: boolean;
  editingEnvironmentId: string | null;
  environmentToDelete: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: EnvironmentState = {
  environments: [],
  selectedEnvironmentId: null,
  isEditing: false,
  editingEnvironmentId: null,
  environmentToDelete: null,
  loading: false,
  error: null,
};

export const loadEnvironments = createAsyncThunk('environment/load', async () => {
  return await window.electronAPI.loadEnvironments();
});

export const environmentSlice = createSlice({
  name: 'environment',
  initialState,
  reducers: {
    setEnvironments: (state, action: PayloadAction<Environment[]>) => {
      state.environments = action.payload;
    },
    selectEnvironment: (state, action: PayloadAction<string | null>) => {
      state.selectedEnvironmentId = action.payload;
    },
    startEditing: (state, action: PayloadAction<string | null>) => {
      state.editingEnvironmentId = action.payload;
      state.isEditing = action.payload !== null;
    },
    stopEditing: (state) => {
      state.isEditing = false;
      state.editingEnvironmentId = null;
    },
    startAddEnvironment: (state) => {
      state.selectedEnvironmentId = null;
      state.editingEnvironmentId = null;
      state.isEditing = true;
    },
    setEnvironmentToDelete: (state, action: PayloadAction<string | null>) => {
      state.environmentToDelete = action.payload;
    },
    addEnvironment: (state, action: PayloadAction<Environment>) => {
      state.environments.push(action.payload);
      state.selectedEnvironmentId = action.payload.id;
      state.editingEnvironmentId = action.payload.id;
    },
    updateEnvironment: (state, action: PayloadAction<Environment>) => {
      const index = state.environments.findIndex((e) => e.id === action.payload.id);
      if (index >= 0) {
        state.environments[index] = action.payload;
      } else {
        // New environment
        state.environments.push(action.payload);
        state.selectedEnvironmentId = action.payload.id;
        state.editingEnvironmentId = action.payload.id;
      }
    },
    deleteEnvironment: (state, action: PayloadAction<string>) => {
      state.environments = state.environments.filter((e) => e.id !== action.payload);
      if (state.selectedEnvironmentId === action.payload) {
        state.selectedEnvironmentId = null;
      }
      if (state.editingEnvironmentId === action.payload) {
        state.isEditing = false;
        state.editingEnvironmentId = null;
      }
      state.environmentToDelete = null;
    },
    reorderEnvironments: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      const oldIndex = state.environments.findIndex((e) => e.id === activeId);
      const newIndex = state.environments.findIndex((e) => e.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const [moved] = state.environments.splice(oldIndex, 1);
        state.environments.splice(newIndex, 0, moved);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadEnvironments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEnvironments.fulfilled, (state, action) => {
        state.environments = action.payload;
        state.loading = false;
      })
      .addCase(loadEnvironments.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load environments';
        state.loading = false;
      });
  },
});

export const environmentActions = environmentSlice.actions;
export default environmentSlice.reducer;
