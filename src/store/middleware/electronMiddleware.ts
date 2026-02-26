import { Middleware, Action, PayloadAction } from '@reduxjs/toolkit';
import { DynamicVariable, HttpResponse } from '../../types';
import { extractDynamicVariableFromResponseWithDetails } from '../../utils/dynamicVariable';
import { environmentActions } from '../slices/environmentSlice';
import { historyActions } from '../slices/historySlice';

// History actions that should NOT trigger auto-save (read-only or loading actions)
const historyReadOnlyActions = [
  'history/load/pending',
  'history/load/fulfilled',
  'history/load/rejected',
  'history/enforceRetention',
];

// Settings actions that should NOT trigger auto-save (read-only or loading actions)
const settingsReadOnlyActions = ['settings/load/pending', 'settings/load/fulfilled', 'settings/load/rejected'];

// Actions that should NOT trigger auto-save (read-only or loading actions)
const collectionReadOnlyActions = [
  'collection/load/pending',
  'collection/load/fulfilled',
  'collection/load/rejected',
  'collection/selectRequest',
  'collection/selectFolder',
];

const environmentReadOnlyActions = [
  'environment/load/pending',
  'environment/load/fulfilled',
  'environment/load/rejected',
  'environment/loadDynamicVariables/pending',
  'environment/loadDynamicVariables/fulfilled',
  'environment/loadDynamicVariables/rejected',
  'environment/selectEnvironment',
  'environment/startEditing',
  'environment/stopEditing',
  'environment/startAddEnvironment',
  'environment/setEnvironmentToDelete',
  'environment/setDynamicVariables',
];

// Dynamic variable actions that should trigger auto-save of dynamic variables
const dynamicVariableActions = [
  'environment/addDynamicVariable',
  'environment/updateDynamicVariable',
  'environment/removeDynamicVariable',
  'environment/updateDynamicVariableValue',
];

export const electronMiddleware: Middleware = (store) => (next) => (action: Action) => {
  const actionType = action.type as string;

  // Gate history collection: skip adding entries when history is disabled
  if (actionType === 'history/addEntry') {
    const state = store.getState();
    if (!state.settings.general.historyEnabled) {
      return;
    }
  }

  const result = next(action);

  // Auto-save collection after mutation actions
  if (actionType && actionType.startsWith('collection/') && !collectionReadOnlyActions.includes(actionType)) {
    const state = store.getState();
    window.electronAPI.saveCollection(state.collection.data);
  }

  // Auto-save environments after mutation actions (excluding dynamic variable actions)
  if (
    actionType &&
    actionType.startsWith('environment/') &&
    !environmentReadOnlyActions.includes(actionType) &&
    !dynamicVariableActions.includes(actionType)
  ) {
    const state = store.getState();
    window.electronAPI.saveEnvironments(state.environment.environments);
  }

  // Auto-save dynamic variables after their mutation actions
  if (actionType && dynamicVariableActions.includes(actionType)) {
    const state = store.getState();
    window.electronAPI.saveDynamicVariables(state.environment.dynamicVariables);
  }

  // Auto-save history after mutation actions
  if (actionType && actionType.startsWith('history/') && !historyReadOnlyActions.includes(actionType)) {
    // Enforce retention limits after history mutations
    const stateAfterHistory = store.getState();
    const { historySize, historyRetention } = stateAfterHistory.settings.general;
    store.dispatch(historyActions.enforceRetention({ maxSize: historySize, retention: historyRetention }));

    const stateToSave = store.getState();
    window.electronAPI.saveHistory(stateToSave.history.entries);
  }

  // Auto-save settings after mutation actions
  if (actionType && actionType.startsWith('settings/') && !settingsReadOnlyActions.includes(actionType)) {
    const state = store.getState();
    window.electronAPI.saveSettings(state.settings);

    // Enforce retention when history size or retention settings change
    if (actionType === 'settings/setHistorySize' || actionType === 'settings/setHistoryRetention') {
      const { historySize, historyRetention } = state.settings.general;
      store.dispatch(historyActions.enforceRetention({ maxSize: historySize, retention: historyRetention }));
      const updatedState = store.getState();
      window.electronAPI.saveHistory(updatedState.history.entries);
    }
  }

  // Auto-update dynamic variables when a response is received
  if (actionType === 'response/setResponse') {
    const state = store.getState();
    const currentRequestId = state.collection.selectedRequestId;

    if (currentRequestId) {
      const dynamicVars = (state.environment.dynamicVariables as DynamicVariable[]).filter(
        (dv) => dv.requestId === currentRequestId,
      );

      const response = (action as PayloadAction<HttpResponse>).payload;

      for (const dvar of dynamicVars) {
        const extractionResult = extractDynamicVariableFromResponseWithDetails(dvar, response);

        if (extractionResult.success && extractionResult.value !== null) {
          store.dispatch(
            environmentActions.updateDynamicVariableValue({
              id: dvar.id,
              value: extractionResult.value,
            }),
          );
        }
        // Note: Extraction failures are tracked in collectionRunResult.warning
      }
    }
  }

  return result;
};

export default electronMiddleware;
