import cn from 'classnames';
import { ChangeEvent } from 'react';
import { initialNumberBounds } from '../../constants/datasets';
import { DataType, DynamicValue } from '../../types';
import Input from '../inputs/Input';
import { SelectOption } from '../inputs/Select';
import SimpleSelect from '../inputs/SimpleSelect';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';

const parameterOptions: SelectOption<DataType>[] = [
  { value: 'do-not-test', label: 'Do not test' },
  { value: 'random32', label: 'Random string 32' },
  { value: 'randomInt', label: 'Random integer' },
  { value: 'randomEmail', label: 'Random email' },
  { value: 'string', label: 'String' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'currency', label: 'Currency' },
  { value: 'date_yyyy_mm_dd', label: 'Date (YYYY-MM-DD)' },
];

interface Props {
  value: DynamicValue;
  onChange: (value: DynamicValue) => void;
}

export function ParameterControls({ value, onChange }: Props) {
  const { type, value: dynamicValue } = value;

  return (
    <div className="flex items-center justify-end flex-wrap gap-2">
      {renderValueInput()}
      <SimpleSelect
        className="p-1! rounded-none! outline-none dark:border-border/20!"
        options={parameterOptions}
        value={type}
        onChange={onSelectTypeChange}
      />
      <ClearCrossIcon
        className={cn(
          'h-[18px] w-[18px] p-0.5 text-button-text-secondary hover:text-button-text-secondary-hover',
          'dark:text-text-secondary dark:hover:text-dark-text cursor-pointer',
        )}
        onClick={() => onChange({ type: 'do-not-test' })}
      />
    </div>
  );

  function renderValueInput() {
    switch (type) {
      case 'number':
        return (
          <div className="flex items-center justify-end flex-wrap gap-2">
            <Input
              className="max-w-28 p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="From"
              max={initialNumberBounds.to}
              min={-initialNumberBounds.to}
              step={0.01}
              type="number"
              value={dynamicValue.from}
              onChange={(e) => {
                const from = Math.min(
                  initialNumberBounds.to,
                  Math.max(-initialNumberBounds.to, Number(e.target.value)),
                );
                const to = from > dynamicValue.to ? from : dynamicValue.to;

                onChange({
                  type,
                  value: { ...dynamicValue, from, to },
                });
              }}
            />
            <Input
              className="max-w-28 p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="To"
              max={initialNumberBounds.to}
              min={-initialNumberBounds.to}
              step={0.01}
              type="number"
              value={dynamicValue.to}
              onChange={(e) => {
                const to = Math.min(initialNumberBounds.to, Math.max(-initialNumberBounds.to, Number(e.target.value)));
                const from = to < dynamicValue.from ? to : dynamicValue.from;

                onChange({
                  type,
                  value: { ...dynamicValue, from, to },
                });
              }}
            />
          </div>
        );
      default:
        return null;
    }
  }

  function onSelectTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as DataType;

    switch (type) {
      case 'number':
        onChange({ type, value: initialNumberBounds });
        break;
      default:
        onChange({ type });
    }
  }
}
