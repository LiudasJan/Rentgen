import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DynamicVariable, Environment, EnvironmentVariable } from '../../types';

interface EnvironmentState {
  environments: Environment[];
  selectedEnvironmentId: string | null;
  isEditing: boolean;
  editingEnvironmentId: string | null;
  environmentToDelete: string | null;
  loading: boolean;
  error: string | null;
  // Dynamic variables stored at root level
  dynamicVariables: DynamicVariable[];
}

const initialState: EnvironmentState = {
  environments: [],
  selectedEnvironmentId: null,
  isEditing: false,
  editingEnvironmentId: null,
  environmentToDelete: null,
  loading: false,
  error: null,
  dynamicVariables: [],
};

/**
 * Generate a unique ID for dynamic variables
 */
function generateDynamicVariableId(): string {
  return `dvar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const loadEnvironments = createAsyncThunk('environment/load', async () => {
  return await window.electronAPI.loadEnvironments();
});

export const loadDynamicVariables = createAsyncThunk('environment/loadDynamicVariables', async () => {
  return await window.electronAPI.loadDynamicVariables();
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
    addVariableToEnvironment: (
      state,
      action: PayloadAction<{ variable: EnvironmentVariable; environmentId: string | 'all' }>,
    ) => {
      const { variable, environmentId } = action.payload;

      const addOrUpdateVariable = (env: Environment) => {
        const existingIndex = env.variables.findIndex((v) => v.key === variable.key);
        if (existingIndex >= 0) {
          env.variables[existingIndex] = variable;
        } else {
          env.variables.push(variable);
        }
      };

      if (environmentId === 'all') {
        state.environments.forEach(addOrUpdateVariable);
      } else {
        const env = state.environments.find((e) => e.id === environmentId);
        if (env) {
          addOrUpdateVariable(env);
        }
      }
    },

    // Dynamic Variables CRUD actions
    addDynamicVariable: (
      state,
      action: PayloadAction<
        Omit<DynamicVariable, 'id' | 'currentValue' | 'lastUpdated'> & { initialValue?: string | null }
      >,
    ) => {
      const { initialValue, ...rest } = action.payload;
      const newVariable: DynamicVariable = {
        ...rest,
        id: generateDynamicVariableId(),
        currentValue: initialValue || null,
        lastUpdated: initialValue ? Date.now() : null,
      };
      state.dynamicVariables.push(newVariable);
    },
    updateDynamicVariable: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<DynamicVariable, 'id'>> }>,
    ) => {
      const { id, updates } = action.payload;
      const index = state.dynamicVariables.findIndex((v) => v.id === id);
      if (index >= 0) {
        state.dynamicVariables[index] = { ...state.dynamicVariables[index], ...updates };
      }
    },
    removeDynamicVariable: (state, action: PayloadAction<{ id: string }>) => {
      state.dynamicVariables = state.dynamicVariables.filter((v) => v.id !== action.payload.id);
    },
    updateDynamicVariableValue: (state, action: PayloadAction<{ id: string; value: string }>) => {
      const { id, value } = action.payload;
      const variable = state.dynamicVariables.find((v) => v.id === id);
      if (variable) {
        variable.currentValue = value;
        variable.lastUpdated = Date.now();
      }
    },
    setDynamicVariables: (state, action: PayloadAction<DynamicVariable[]>) => {
      state.dynamicVariables = action.payload;
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
      })
      .addCase(loadDynamicVariables.fulfilled, (state, action) => {
        state.dynamicVariables = action.payload || [];
      });
  },
});

export const environmentActions = environmentSlice.actions;
export default environmentSlice.reducer;
