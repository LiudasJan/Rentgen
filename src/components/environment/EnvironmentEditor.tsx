import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCollectionData, selectDynamicVariables, selectSelectedEnvironmentId } from '../../store/selectors';
import { environmentActions } from '../../store/slices/environmentSlice';
import { DynamicVariable, Environment, EnvironmentVariable } from '../../types';
import { generateEnvironmentId } from '../../utils';
import { findRequestWithFolder } from '../../utils/collection';
import { extractMultipleDynamicVariablesFromResponse } from '../../utils/dynamicVariable';
import Button, { ButtonType } from '../buttons/Button';
import Input from '../inputs/Input';
import Panel from '../panels/Panel';

const COLOR_OPTIONS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

interface Props {
  environment: Environment | null;
  isNew: boolean;
  onSave: (environment: Environment) => void;
}

export default function EnvironmentEditor({ environment, isNew, onSave }: Props) {
  const dispatch = useAppDispatch();
  const collection = useAppSelector(selectCollectionData);
  const allDynamicVariables = useAppSelector(selectDynamicVariables);
  const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);

  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[4]); // Default blue
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Filter dynamic variables applicable to current environment
  const dynamicVariables = useMemo(() => {
    return allDynamicVariables.filter((dv) => dv.environmentId === null || dv.environmentId === selectedEnvironmentId);
  }, [allDynamicVariables, selectedEnvironmentId]);

  // Check if current state differs from environment prop
  const hasChanges = () => {
    if (!environment) return false;
    if (title !== environment.title) return true;
    if (color !== environment.color) return true;

    const nonEmptyVars = variables.filter((v) => v.key.trim() !== '');
    if (nonEmptyVars.length !== environment.variables.length) return true;

    return nonEmptyVars.some((v, i) => {
      const envVar = environment.variables[i];
      return !envVar || v.key !== envVar.key || v.value !== envVar.value;
    });
  };

  // Autosave for existing environments only
  useEffect(() => {
    if (isNew) return;
    if (!environment?.id) return;
    if (!hasChanges()) return;

    const timeoutId = setTimeout(() => {
      const nonEmptyVariables = variables.filter((v) => v.key.trim() !== '');
      onSave({
        id: environment.id,
        title: title.trim() || 'Untitled',
        color,
        variables: nonEmptyVariables,
      });
      setSaved(true);
      clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 1000);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [title, color, variables, isNew, environment, onSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (environment) {
      setTitle(environment.title);
      setColor(environment.color);
      setVariables([...environment.variables, { key: '', value: '' }]);
    } else {
      setTitle('');
      setColor(COLOR_OPTIONS[4]);
      setVariables([{ key: '', value: '' }]);
    }
  }, [environment]);

  const handleVariableChange = (index: number, field: 'key' | 'value', newValue: string) => {
    setVariables((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: newValue };

      const result = updated.filter((v, i) => {
        const isEmpty = v.key.trim() === '' && v.value.trim() === '';
        if (!isEmpty) {
          return true;
        }

        return i === index;
      });

      const lastRow = result[result.length - 1];
      const lastIsEmpty = lastRow && lastRow.key.trim() === '' && lastRow.value.trim() === '';
      if (!lastIsEmpty) {
        result.push({ key: '', value: '' });
      }

      return result;
    });
  };

  const handleSave = () => {
    const nonEmptyVariables = variables.filter((v) => v.key.trim() !== '');

    const savedEnvironment: Environment = {
      id: environment?.id || generateEnvironmentId(),
      title: title.trim() || 'Untitled',
      color,
      variables: nonEmptyVariables,
    };

    onSave(savedEnvironment);

    if (!isNew) {
      clearTimeout(savedTimeoutRef.current);
      setSaved(true);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 1000);
    }
  };

  // Dynamic variable handlers
  const handleDynamicVariableKeyChange = useCallback(
    (dv: DynamicVariable, newKey: string) => {
      if (newKey.trim() === '') {
        // Delete by clearing name
        dispatch(environmentActions.removeDynamicVariable({ id: dv.id }));
      } else {
        dispatch(
          environmentActions.updateDynamicVariable({
            id: dv.id,
            updates: { key: newKey },
          }),
        );
      }
    },
    [dispatch],
  );

  const handleRefreshDynamicVariable = useCallback(
    async (dv: DynamicVariable) => {
      const result = findRequestWithFolder(collection, dv.requestId);
      if (!result) return;

      try {
        const response = await window.electronAPI.sendHttp({
          method: result.request.request.method,
          url: result.request.request.url,
          headers: Object.fromEntries((result.request.request.header || []).map((h) => [h.key, h.value])),
          body: result.request.request.body?.raw || null,
        });

        const extractedValues = extractMultipleDynamicVariablesFromResponse([dv], response);
        for (const [variableId, value] of extractedValues) {
          dispatch(
            environmentActions.updateDynamicVariableValue({
              id: variableId,
              value,
            }),
          );
        }
      } catch (error) {
        console.error('Failed to refresh dynamic variable:', error);
      }
    },
    [collection, dispatch],
  );

  const handleRefreshAllDynamicVariables = useCallback(async () => {
    // Group variables by request to avoid duplicate HTTP calls
    const variablesByRequest = new Map<string, DynamicVariable[]>();
    for (const dv of dynamicVariables) {
      const existing = variablesByRequest.get(dv.requestId) || [];
      existing.push(dv);
      variablesByRequest.set(dv.requestId, existing);
    }

    for (const [requestId, vars] of variablesByRequest) {
      const result = findRequestWithFolder(collection, requestId);
      if (!result) continue;

      try {
        const response = await window.electronAPI.sendHttp({
          method: result.request.request.method,
          url: result.request.request.url,
          headers: Object.fromEntries((result.request.request.header || []).map((h) => [h.key, h.value])),
          body: result.request.request.body?.raw || null,
        });

        const extractedValues = extractMultipleDynamicVariablesFromResponse(vars, response);
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
    }
  }, [dynamicVariables, collection, dispatch]);

  return (
    <div className="flex flex-col gap-4">
      <Panel title={isNew ? 'New Environment' : 'Edit Environment'}>
        <div className="p-4 border-t border-border dark:border-dark-body">
          {/* Title Input */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-sm">Environment Name</label>
            <Input
              className="w-full dark:bg-dark-body"
              placeholder="e.g., Production, Staging, Local"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Color Picker */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-sm">Color</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    'w-8 h-8 rounded-md border-2 cursor-pointer',
                    color === c ? 'border-text dark:border-dark-text' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  type="button"
                />
              ))}
              {/* Custom color input */}
              <input
                className="w-10 h-8 cursor-pointer border-0 p-0 rounded-md"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          {/* Variables Table */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-sm">Variables</label>
            <div className="border border-border dark:border-dark-body rounded-md">
              <div className="max-h-[440px] overflow-y-auto overflow-x-hidden">
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-body dark:bg-dark-body border-b border-border dark:border-dark-border">
                      <th className="w-[30%] px-3 py-2 font-bold text-xs text-left">Variable Name</th>
                      <th className="w-[30%] px-3 py-2 font-bold text-xs text-left">Value</th>
                      <th className="w-[10%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Dynamic variables */}
                    {dynamicVariables.map((dv) => (
                      <tr key={dv.id} className="last:[&>td]:border-b-0">
                        <td className="w-[40%] p-1 border-b border-border dark:border-dark-body">
                          <Input
                            className="w-full border-0 bg-transparent"
                            placeholder="variable_name"
                            value={dv.key}
                            onChange={(e) => handleDynamicVariableKeyChange(dv, e.target.value)}
                          />
                        </td>
                        <td className="w-[40%] p-1 border-l border-b border-border dark:border-dark-body">
                          <span className="px-2 text-xs font-monospace text-text-secondary dark:text-dark-text-secondary truncate block">
                            {dv.currentValue || '—'}
                          </span>
                        </td>
                        <td className="w-[20%] p-1 border-l border-b border-border dark:border-dark-body text-center">
                          <button
                            className="p-1 hover:bg-body dark:hover:bg-dark-body rounded text-text-secondary hover:text-text dark:text-dark-text-secondary dark:hover:text-dark-text"
                            onClick={() => handleRefreshDynamicVariable(dv)}
                            title="Refresh value"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Static variables */}
                    {variables.map((variable, index) => (
                      <tr key={`static-${index}`} className="last:[&>td]:border-b-0">
                        <td className="w-[40%] p-1 border-b border-border dark:border-dark-body">
                          <Input
                            className="w-full border-0 bg-transparent"
                            placeholder="variable_name"
                            value={variable.key}
                            onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                          />
                        </td>
                        <td className="w-[40%] p-1 border-l border-b border-border dark:border-dark-body">
                          <Input
                            className="w-full border-0 bg-transparent"
                            placeholder="value"
                            value={variable.value}
                            onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                          />
                        </td>
                        <td className="w-[20%] p-1 border-l border-b border-border dark:border-dark-body"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Footer with Refresh All button */}
              {dynamicVariables.length > 0 && (
                <div className="flex justify-end p-2 border-t border-border dark:border-dark-body bg-body dark:bg-dark-body">
                  <Button buttonType={ButtonType.SECONDARY} onClick={handleRefreshAllDynamicVariables}>
                    Refresh All
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - only show Create for new environments */}
          {isNew && (
            <div className="flex items-center justify-end gap-2">
              <Button onClick={handleSave}>Create</Button>
            </div>
          )}

          {/* Saved indicator for existing environments */}
          {!isNew && saved && (
            <div className="flex items-center justify-end">
              <span className="text-xs text-green-500">Saved</span>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
