import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectEnvironments, selectSetAsVariableModal } from '../../store/selectors';
import { uiActions } from '../../store/slices/uiSlice';
import { environmentActions } from '../../store/slices/environmentSlice';
import Modal from './Modal';
import Input from '../inputs/Input';
import Select from '../inputs/Select';
import Button, { ButtonType } from '../buttons/Button';

const ALL_ENVIRONMENTS_VALUE = 'all';

const sanitizeToVariableName = (val: string): string => {
  return val
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
};

interface EnvironmentOption {
  value: string;
  label: string;
}

export default function SetAsVariableModal() {
  const dispatch = useAppDispatch();
  const { isOpen, initialValue } = useAppSelector(selectSetAsVariableModal);
  const environments = useAppSelector(selectEnvironments);

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentOption | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(sanitizeToVariableName(initialValue));
      setValue(initialValue);
      setSelectedEnvironment({ value: ALL_ENVIRONMENTS_VALUE, label: 'All Environments' });
      setShowDuplicateWarning(false);
      setError('');
    }
  }, [isOpen, initialValue]);

  const environmentOptions: EnvironmentOption[] = useMemo(() => {
    const options: EnvironmentOption[] = [{ value: ALL_ENVIRONMENTS_VALUE, label: 'All Environments' }];
    environments.forEach((env) => {
      options.push({ value: env.id, label: env.title || 'Untitled Environment' });
    });
    return options;
  }, [environments]);

  const handleClose = () => {
    dispatch(uiActions.closeSetAsVariableModal());
  };

  const checkForDuplicates = (): boolean => {
    const sanitizedName = name.trim();
    if (!selectedEnvironment) return false;

    if (selectedEnvironment.value === ALL_ENVIRONMENTS_VALUE) {
      // Check if variable exists in any environment
      return environments.some((env) => env.variables.some((v) => v.key === sanitizedName));
    } else {
      // Check if variable exists in selected environment
      const env = environments.find((e) => e.id === selectedEnvironment.value);
      return env?.variables.some((v) => v.key === sanitizedName) || false;
    }
  };

  const handleSave = () => {
    const sanitizedName = name.trim();

    // Validation
    if (!sanitizedName) {
      setError('Variable name is required');
      return;
    }

    if (!selectedEnvironment) {
      setError('Please select an environment');
      return;
    }

    // Check for duplicates
    if (!showDuplicateWarning && checkForDuplicates()) {
      setShowDuplicateWarning(true);
      return;
    }

    // Save the variable
    dispatch(
      environmentActions.addVariableToEnvironment({
        variable: { key: sanitizedName, value: value.trim() },
        environmentId: selectedEnvironment.value as string | 'all',
      }),
    );

    handleClose();
  };

  const hasNoEnvironments = environments.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-text dark:text-dark-text m-0">Set as Variable</h2>

        {hasNoEnvironments ? (
          <p className="text-sm text-text dark:text-dark-text">
            No environments exist. Please create an environment first in the Environments panel.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text dark:text-dark-text">Name</label>
              <Input
                placeholder="variable_name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                  setShowDuplicateWarning(false);
                }}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-text dark:text-dark-text">Value</label>
              <Input
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-text dark:text-dark-text">Environment</label>
              <Select
                options={environmentOptions}
                value={selectedEnvironment}
                onChange={(option) => {
                  setSelectedEnvironment(option as EnvironmentOption);
                  setError('');
                  setShowDuplicateWarning(false);
                }}
                placeholder="Select environment..."
              />
            </div>

            {error && <p className="text-xs text-button-danger m-0">{error}</p>}

            {showDuplicateWarning && (
              <p className="text-xs text-button-danger m-0">
                A variable with this name already exists. Click again to overwrite.
              </p>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button buttonType={ButtonType.SECONDARY} onClick={handleClose}>
            Cancel
          </Button>
          {!hasNoEnvironments && (
            <Button onClick={handleSave}>{showDuplicateWarning ? 'Overwrite' : 'Save'}</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
