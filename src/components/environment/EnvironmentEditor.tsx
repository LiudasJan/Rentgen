import cn from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectCollectionData,
  selectDynamicVariables,
  selectSelectedEnvironmentId,
  selectTheme,
} from '../../store/selectors';
import { environmentActions } from '../../store/slices/environmentSlice';
import { DataType, DynamicVariable, Environment, EnvironmentVariable } from '../../types';
import { generateEnvironmentId } from '../../utils';
import { findRequestWithFolder } from '../../utils/collection';
import { extractMultipleDynamicVariablesFromResponse } from '../../utils/dynamicVariable';
import Button, { ButtonType } from '../buttons/Button';
import Input from '../inputs/Input';
import Select, { SelectOption } from '../inputs/Select';
import Panel from '../panels/Panel';

const COLOR_OPTIONS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

const valueOptions: SelectOption<DataType>[] = [
  { value: 'randomEmail', label: 'Random email' },
  { value: 'randomInt', label: 'Random integer' },
  { value: 'random32', label: 'Random string 32' },
];

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
  const theme = useAppSelector(selectTheme);

  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[4]); // Default blue
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Filter dynamic variables applicable to current environment
  const dynamicVariables = useMemo(() => {
    return allDynamicVariables.filter((dv) => dv.environmentId === null || dv.environmentId === selectedEnvironmentId);
  }, [allDynamicVariables, selectedEnvironmentId]);

  const allVariables = useMemo(() => {
    return [
      ...dynamicVariables.map((dynamicVariable, index) => ({ ...dynamicVariable, type: 'dynamic', index })),
      ...variables.map((variable, index) => ({ ...variable, type: 'static', index })),
    ];
  }, [dynamicVariables, variables]);

  const isDark = theme === 'dark';

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
          <div className="border border-border dark:border-dark-body rounded-md overflow-hidden">
            <DataTable
              className="rounded-none!"
              columns={[
                {
                  name: 'Variable Name',
                  cell: (row) => (
                    <Input
                      className="w-full border-0 bg-transparent"
                      placeholder="Add variable"
                      value={row.key}
                      onChange={(e) =>
                        row.type === 'static'
                          ? handleVariableChange(row.index, 'key', e.target.value)
                          : handleDynamicVariableKeyChange(row as DynamicVariable, e.target.value)
                      }
                    />
                  ),
                },
                {
                  name: 'Value',
                  cell: (row) => {
                    if (row.type === 'static')
                      return (
                        <Select
                          classNames={{
                            container: () => 'w-full text-xs',
                            control: () =>
                              'min-h-auto! border-none! bg-white! dark:bg-dark-input! shadow-none! transition-none!',
                          }}
                          isCreatable={true}
                          menuPosition="fixed"
                          options={valueOptions}
                          placeholder="value"
                          value={
                            valueOptions.find((option) => option.value == (row as EnvironmentVariable).value) || {
                              value: (row as EnvironmentVariable).value,
                              label: (row as EnvironmentVariable).value,
                            }
                          }
                          onChange={(option: SelectOption<DataType>) =>
                            handleVariableChange(row.index, 'value', option.value)
                          }
                        />
                      );

                    return (
                      <span className="px-2 text-xs font-monospace text-text-secondary dark:text-dark-text-secondary truncate block">
                        {(row as DynamicVariable).currentValue || '—'}
                      </span>
                    );
                  },
                },
                {
                  name: '',
                  cell: (row) => {
                    if (row.type === 'static') return null;

                    return (
                      <button
                        className="p-1 hover:bg-body dark:hover:bg-dark-body rounded text-text-secondary hover:text-text dark:text-dark-text-secondary dark:hover:text-dark-text"
                        onClick={() => handleRefreshDynamicVariable(row as DynamicVariable)}
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
                    );
                  },
                  width: '10%',
                  style: { justifyContent: 'center' },
                },
              ]}
              customStyles={{
                headRow: {
                  style: {
                    minHeight: 'auto',
                    color: isDark ? 'white' : 'black',
                    backgroundColor: isDark ? '#23272f' : '#fafafa',
                  },
                },
                headCells: {
                  style: {
                    padding: '8px 12px',
                  },
                },
                cells: {
                  style: {
                    padding: '4px',
                    '&:not(:last-of-type)': {
                      borderRight: isDark ? '1px solid #23272f' : '1px solid #cccccc',
                    },
                  },
                },
                rows: {
                  style: {
                    minHeight: 'auto',
                    backgroundColor: 'transparent',
                    '&:not(:last-of-type)': {
                      borderBottomColor: isDark ? '#23272f' : '#cccccc',
                    },
                  },
                },
                table: {
                  style: {
                    backgroundColor: 'transparent',
                  },
                },
              }}
              data={allVariables}
              fixedHeader={true}
              fixedHeaderScrollHeight="440px"
            />

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
  );
}
