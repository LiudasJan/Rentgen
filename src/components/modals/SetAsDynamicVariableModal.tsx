import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectDynamicVariables, selectEnvironments, selectSetAsDynamicVariableModal } from '../../store/selectors';
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

export default function SetAsDynamicVariableModal() {
  const dispatch = useAppDispatch();
  const modalState = useAppSelector(selectSetAsDynamicVariableModal);
  const environments = useAppSelector(selectEnvironments);
  const dynamicVariables = useAppSelector(selectDynamicVariables);

  const [name, setName] = useState('');
  const [selector, setSelector] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentOption | null>(null);
  const [duplicateToOverwrite, setDuplicateToOverwrite] = useState<string | null>(null); // ID of dynamic var to overwrite
  const [error, setError] = useState('');

  const isEditing = !!modalState.editingVariableId;

  // Reset form when modal opens
  useEffect(() => {
    if (modalState.isOpen) {
      // When editing, use the existing variable name
      if (modalState.editingVariableName) {
        setName(modalState.editingVariableName);
      } else {
        setName(sanitizeToVariableName(modalState.initialSelector));
      }
      setSelector(modalState.initialSelector);
      setSelectedEnvironment({ value: ALL_ENVIRONMENTS_VALUE, label: 'All Environments' });
      setDuplicateToOverwrite(null);
      setError('');
    }
  }, [modalState.isOpen, modalState.initialSelector, modalState.editingVariableName]);

  const environmentOptions: EnvironmentOption[] = useMemo(() => {
    const options: EnvironmentOption[] = [{ value: ALL_ENVIRONMENTS_VALUE, label: 'All Environments' }];
    environments.forEach((env) => {
      options.push({ value: env.id, label: env.title || 'Untitled Environment' });
    });
    return options;
  }, [environments]);

  const handleClose = () => {
    dispatch(uiActions.closeSetAsDynamicVariableModal());
  };

  // Check for existing dynamic variable with same name and return its ID for overwriting
  const findDuplicateDynamicVariable = (): string | null => {
    const sanitizedName = name.trim();
    if (!selectedEnvironment) return null;

    // When editing and name hasn't changed, no duplicate
    if (isEditing && sanitizedName === modalState.editingVariableName) {
      return null;
    }

    const envId = selectedEnvironment.value === ALL_ENVIRONMENTS_VALUE ? null : selectedEnvironment.value;

    // Find existing dynamic variable with same name (excluding the one being edited)
    const existingDynamic = dynamicVariables.find((dv) => {
      if (isEditing && dv.id === modalState.editingVariableId) return false;
      // Match if either is global (null) or same environment
      if (envId !== null && dv.environmentId !== null && dv.environmentId !== envId) return false;
      return dv.key === sanitizedName;
    });

    return existingDynamic?.id || null;
  };

  const handleSave = () => {
    const sanitizedName = name.trim();
    const sanitizedSelector = selector.trim();

    // Validation
    if (!sanitizedName) {
      setError('Variable name is required');
      return;
    }

    if (!sanitizedSelector) {
      setError('Selector is required');
      return;
    }

    if (!selectedEnvironment) {
      setError('Please select an environment');
      return;
    }

    const envId = selectedEnvironment.value === ALL_ENVIRONMENTS_VALUE ? null : selectedEnvironment.value;

    // Check for existing variable to overwrite
    const existingId = findDuplicateDynamicVariable();
    if (existingId && !duplicateToOverwrite) {
      // Show overwrite message and set the ID to overwrite on next save
      setDuplicateToOverwrite(existingId);
      return;
    }

    if (isEditing && modalState.editingVariableId) {
      // Update existing dynamic variable
      dispatch(
        environmentActions.updateDynamicVariable({
          id: modalState.editingVariableId,
          updates: {
            key: sanitizedName,
            selector: sanitizedSelector,
            source: 'body',
            environmentId: envId,
          },
        }),
      );
    } else if (duplicateToOverwrite) {
      // Overwrite existing dynamic variable
      dispatch(
        environmentActions.updateDynamicVariable({
          id: duplicateToOverwrite,
          updates: {
            key: sanitizedName,
            selector: sanitizedSelector,
            source: 'body',
            collectionId: modalState.collectionId,
            requestId: modalState.requestId,
            environmentId: envId,
            currentValue: modalState.initialValue || null,
            lastUpdated: modalState.initialValue ? Date.now() : null,
          },
        }),
      );
    } else {
      // Save new dynamic variable
      dispatch(
        environmentActions.addDynamicVariable({
          key: sanitizedName,
          selector: sanitizedSelector,
          source: 'body',
          collectionId: modalState.collectionId,
          requestId: modalState.requestId,
          environmentId: envId,
          initialValue: modalState.initialValue || null,
        }),
      );
    }

    handleClose();
  };

  return (
    <Modal isOpen={modalState.isOpen} onClose={handleClose}>
      <div className="flex flex-col gap-4 min-w-[400px]">
        <h2 className="text-lg font-bold text-text dark:text-dark-text m-0">
          {isEditing ? 'Edit Dynamic Variable' : 'Set as Dynamic Variable'}
        </h2>

        {/* Variable Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text dark:text-dark-text">Variable Name</label>
          <Input
            placeholder="variable_name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
              setDuplicateToOverwrite(null);
            }}
            autoFocus
          />
        </div>

        {/* Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text dark:text-dark-text">Selector (dot notation)</label>
          <Input
            placeholder="data.user.id"
            value={selector}
            onChange={(e) => {
              setSelector(e.target.value);
              setError('');
            }}
          />
          {modalState.initialValue && (
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary m-0">
              Preview: &quot;
              {modalState.initialValue.length > 50
                ? modalState.initialValue.substring(0, 47) + '...'
                : modalState.initialValue}
              &quot;
            </p>
          )}
        </div>

        {/* Environment */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text dark:text-dark-text">Environment</label>
          <Select
            options={environmentOptions}
            value={selectedEnvironment}
            onChange={(option) => {
              setSelectedEnvironment(option as EnvironmentOption);
              setError('');
              setDuplicateToOverwrite(null);
            }}
            placeholder="Select environment..."
          />
        </div>

        {/* Linked Request (read-only) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text dark:text-dark-text">Linked Request</label>
          <div className="px-3 py-2 bg-body dark:bg-dark-body rounded-md text-sm text-text-secondary dark:text-dark-text-secondary">
            <span className="mr-1">📁</span>
            {modalState.collectionName} → {modalState.requestName}
          </div>
        </div>

        {error && <p className="text-xs text-button-danger m-0">{error}</p>}

        {duplicateToOverwrite && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 m-0">
            A variable with this name already exists. It will be overwritten.
          </p>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button buttonType={ButtonType.SECONDARY} onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {duplicateToOverwrite ? 'Overwrite' : isEditing ? 'Update Variable' : 'Save Variable'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
