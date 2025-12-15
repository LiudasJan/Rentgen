import { Middleware, AnyAction } from '@reduxjs/toolkit';

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
  'environment/selectEnvironment',
  'environment/startEditing',
  'environment/stopEditing',
  'environment/startAddEnvironment',
  'environment/setEnvironmentToDelete',
];

export const electronMiddleware: Middleware = (store) => (next) => (action: AnyAction) => {
  const result = next(action);

  const actionType = action.type as string;

  // Auto-save collection after mutation actions
  if (actionType && actionType.startsWith('collection/') && !collectionReadOnlyActions.includes(actionType)) {
    const state = store.getState();
    window.electronAPI.saveCollection(state.collection.data);
  }

  // Auto-save environments after mutation actions
  if (actionType && actionType.startsWith('environment/') && !environmentReadOnlyActions.includes(actionType)) {
    const state = store.getState();
    window.electronAPI.saveEnvironments(state.environment.environments);
  }

  return result;
};

export default electronMiddleware;
