import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCollectionData, selectDynamicVariables, selectSelectedEnvironmentId } from '../../store/selectors';
import { environmentActions } from '../../store/slices/environmentSlice';
import { uiActions } from '../../store/slices/uiSlice';
import { DynamicVariable } from '../../types';
import { findRequestWithFolder } from '../../utils/collection';
import { extractMultipleDynamicVariablesFromResponse } from '../../utils/dynamicVariable';
import Button, { ButtonType } from '../buttons/Button';
import DynamicVariableRow from './DynamicVariableRow';

export default function DynamicVariablesList() {
  const dispatch = useAppDispatch();
  const collection = useAppSelector(selectCollectionData);
  const dynamicVariables = useAppSelector(selectDynamicVariables);
  const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);

  // Filter variables applicable to current environment
  const applicableVariables = useMemo(() => {
    return dynamicVariables.filter((dv) => dv.environmentId === null || dv.environmentId === selectedEnvironmentId);
  }, [dynamicVariables, selectedEnvironmentId]);

  // Get request info for each variable
  const variablesWithInfo = useMemo(() => {
    return applicableVariables.map((variable) => {
      const result = findRequestWithFolder(collection, variable.requestId);
      if (result) {
        return {
          variable,
          collectionName: result.folder.name,
          requestName: result.request.name,
          isOrphaned: false,
        };
      }
      return {
        variable,
        collectionName: 'Unknown',
        requestName: 'Unknown',
        isOrphaned: true,
      };
    });
  }, [applicableVariables, collection]);

  /**
   * Refresh one or more dynamic variables by executing their linked request.
   * When multiple variables share the same request, the request is executed once
   * and all variables are updated from that single response.
   */
  const handleRefreshVariables = async (variables: DynamicVariable[]) => {
    if (variables.length === 0) return;

    const result = findRequestWithFolder(collection, variables[0].requestId);
    if (!result) return;

    try {
      const response = await window.electronAPI.sendHttp({
        method: result.request.request.method,
        url: result.request.request.url,
        headers: Object.fromEntries((result.request.request.header || []).map((h) => [h.key, h.value])),
        body: result.request.request.body?.raw || null,
      });

      // Extract all variables from this response using the utility
      const extractedValues = extractMultipleDynamicVariablesFromResponse(variables, response);

      // Update each successfully extracted variable
      for (const [variableId, value] of extractedValues) {
        dispatch(
          environmentActions.updateDynamicVariableValue({
            id: variableId,
            value,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to refresh dynamic variables:', error);
    }
  };

  const handleRefresh = async (variable: DynamicVariable) => {
    await handleRefreshVariables([variable]);
  };

  const handleRefreshAll = async () => {
    // Group variables by request to avoid duplicate HTTP calls
    const variablesByRequest = new Map<string, DynamicVariable[]>();
    for (const variable of applicableVariables) {
      const existing = variablesByRequest.get(variable.requestId) || [];
      existing.push(variable);
      variablesByRequest.set(variable.requestId, existing);
    }

    // Execute each unique request and update ALL its variables
    for (const [, variables] of variablesByRequest) {
      await handleRefreshVariables(variables);
    }
  };

  const handleEdit = (variable: DynamicVariable) => {
    const result = findRequestWithFolder(collection, variable.requestId);
    const collectionName = result?.folder.name || 'Unknown';
    const requestName = result?.request.name || 'Unknown';

    dispatch(
      uiActions.openSetAsDynamicVariableModal({
        initialSelector: variable.selector,
        initialValue: variable.currentValue || '',
        collectionId: variable.collectionId,
        requestId: variable.requestId,
        collectionName,
        requestName,
        editingVariableId: variable.id,
        editingVariableName: variable.key,
      }),
    );
  };

  const handleDelete = (variable: DynamicVariable) => {
    dispatch(environmentActions.removeDynamicVariable({ id: variable.id }));
  };

  if (applicableVariables.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary dark:text-dark-text-secondary">
        <p className="mb-2">No dynamic variables yet.</p>
        <p className="text-sm">
          Right-click on a response value and select &quot;Set as Dynamic Variable&quot; to create one.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-body dark:bg-dark-body border-b border-border dark:border-dark-border font-bold text-xs">
        <div className="flex-1">KEY</div>
        <div className="flex-1">VALUE</div>
        <div className="flex-1">SELECTOR</div>
        <div className="flex-1">SOURCE</div>
        <div className="w-16">TYPE</div>
        <div className="w-32 text-right">LAST UPDATED</div>
        <div className="w-20"></div>
      </div>

      {/* Rows */}
      <div className="max-h-[400px] overflow-y-auto">
        {variablesWithInfo.map(({ variable, collectionName, requestName, isOrphaned }) => (
          <DynamicVariableRow
            key={variable.id}
            variable={variable}
            collectionName={collectionName}
            requestName={requestName}
            isOrphaned={isOrphaned}
            onRefresh={() => handleRefresh(variable)}
            onEdit={() => handleEdit(variable)}
            onDelete={() => handleDelete(variable)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end p-3 border-t border-border dark:border-dark-body">
        <Button buttonType={ButtonType.SECONDARY} onClick={handleRefreshAll}>
          Refresh All
        </Button>
      </div>
    </div>
  );
}
