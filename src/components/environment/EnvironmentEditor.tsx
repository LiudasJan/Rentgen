import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Environment, EnvironmentVariable } from '../../types';
import { generateEnvironmentId } from '../../utils';
import Button, { ButtonType } from '../buttons/Button';
import Input from '../inputs/Input';
import ResponsePanel from '../panels/ResponsePanel';

const COLOR_OPTIONS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

// Generate 30 empty variable rows
const EMPTY_VARIABLES_COUNT = 30;

interface Props {
  environment: Environment | null;
  isNew: boolean;
  onSave: (environment: Environment) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

export default function EnvironmentEditor({ environment, isNew, onSave, onDelete, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[4]); // Default blue
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Initialize form when environment changes
  useEffect(() => {
    if (environment) {
      setTitle(environment.title);
      setColor(environment.color);
      // Pad variables to ensure 30 rows
      const paddedVariables = [...environment.variables];
      while (paddedVariables.length < EMPTY_VARIABLES_COUNT) {
        paddedVariables.push({ key: '', value: '' });
      }
      setVariables(paddedVariables);
    } else {
      // New environment
      setTitle('');
      setColor(COLOR_OPTIONS[4]);
      setVariables(
        Array(EMPTY_VARIABLES_COUNT)
          .fill(null)
          .map(() => ({ key: '', value: '' })),
      );
    }
  }, [environment]);

  const handleVariableChange = (index: number, field: 'key' | 'value', newValue: string) => {
    setVariables((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: newValue };
      return updated;
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
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleDelete = () => {
    if (environment && window.confirm('Are you sure you want to delete this environment?')) {
      onDelete(environment.id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ResponsePanel title={isNew ? 'New Environment' : 'Edit Environment'}>
        <div className="p-4 border-t border-border dark:border-dark-body">
          {/* Title Input */}
          <div className="mb-4">
            <label className="block mb-1 font-bold text-sm">Environment Name</label>
            <Input
              className="w-full"
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
            <div className="border border-border dark:border-dark-border rounded-md overflow-hidden">
              {/* Table Header */}
              <div className="flex bg-body dark:bg-dark-body border-b border-border dark:border-dark-border">
                <div className="flex-1 px-3 py-2 font-bold text-xs">Variable Name</div>
                <div className="flex-1 px-3 py-2 font-bold text-xs">Value</div>
              </div>
              {/* Table Body - scrollable */}
              <div className="max-h-[400px] overflow-y-auto">
                {variables.map((variable, index) => (
                  <div key={index} className="flex border-b border-border dark:border-dark-border last:border-b-0">
                    <div className="flex-1 p-1">
                      <Input
                        className="w-full border-0 bg-transparent"
                        placeholder="variable_name"
                        value={variable.key}
                        onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 p-1 border-l border-border dark:border-dark-border">
                      <Input
                        className="w-full border-0 bg-transparent"
                        placeholder="value"
                        value={variable.value}
                        onChange={(e) => handleVariableChange(index, 'value', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div>
              {!isNew && (
                <Button buttonType={ButtonType.DANGER} onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button buttonType={ButtonType.SECONDARY} onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{isNew ? 'Create' : saved ? 'Saved ✅' : 'Save'}</Button>
            </div>
          </div>
        </div>
      </ResponsePanel>
    </div>
  );
}
