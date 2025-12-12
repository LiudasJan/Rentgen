import cn from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Environment, EnvironmentVariable } from '../../types';
import { generateEnvironmentId } from '../../utils';
import Button from '../buttons/Button';
import Input from '../inputs/Input';
import ResponsePanel from '../panels/ResponsePanel';

const COLOR_OPTIONS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

interface Props {
  environment: Environment | null;
  isNew: boolean;
  onSave: (environment: Environment) => void;
}

export default function EnvironmentEditor({ environment, isNew, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[4]); // Default blue
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  return (
    <div className="flex flex-col gap-4">
      <ResponsePanel title={isNew ? 'New Environment' : 'Edit Environment'}>
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
              {/* Table Header */}
              <div className="flex bg-body dark:bg-dark-body border-b border-border dark:border-dark-border">
                <div className="flex-1 px-3 py-2 font-bold text-xs">Variable Name</div>
                <div className="flex-1 px-3 py-2 font-bold text-xs">Value</div>
              </div>
              {/* Table Body - scrollable */}
              <div className="max-h-[400px] overflow-y-auto">
                {variables.map((variable, index) => (
                  <div key={index} className="flex border-b border-border dark:border-dark-body last:border-b-0">
                    <div className="flex-1 p-1">
                      <Input
                        className="w-full border-0 bg-transparent"
                        placeholder="variable_name"
                        value={variable.key}
                        onChange={(e) => handleVariableChange(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="flex-1 p-1 border-l border-border dark:border-dark-body">
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
      </ResponsePanel>
    </div>
  );
}
