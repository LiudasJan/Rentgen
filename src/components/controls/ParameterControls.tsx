import cn from 'classnames';
import { ChangeEvent } from 'react';
import { initialNumberBounds, MAX_STRING_LENGTH } from '../../constants/datasets';
import { DataType, DynamicValue, Interval } from '../../types';
import { clamp, getInitialParameterValue, normalizeDecimal } from '../../utils';
import Input from '../inputs/Input';
import { SelectOption } from '../inputs/Select';
import SimpleSelect from '../inputs/SimpleSelect';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';

const MAX_INT32 = 2147483647;
const TRAILING_ZEROS_PATTERN = /^-?\d+[.,]0+$/;

const parameterOptions: SelectOption<DataType>[] = [
  { value: 'do-not-test', label: 'Do not test' },
  { value: 'randomEmail', label: 'Random email' },
  { value: 'randomInt', label: 'Random integer' },
  { value: 'random32', label: 'Random string 32' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'currency', label: 'Currency' },
  { value: 'date_yyyy_mm_dd', label: 'Date (YYYY-MM-DD)' },
  { value: 'email', label: 'Email' },
  { value: 'enum', label: 'Enum' },
  { value: 'number', label: 'Number' },
  { value: 'phone', label: 'Phone' },
  { value: 'string', label: 'String' },
  { value: 'url', label: 'Url' },
];

interface Props {
  value: DynamicValue;
  onChange: (value: DynamicValue) => void;
}

export function ParameterControls({ value, onChange }: Props) {
  const { type, value: dynamicValue } = value;

  return (
    <div>
      {renderLabel()}
      <div className="flex items-center justify-end flex-wrap gap-2">
        {type === 'enum' && (
          <Input
            className="min-w-[232px] p-[5px]! rounded-none! dark:border-border/20!"
            value={dynamicValue as string}
            onChange={(event) => onChange({ type, value: event.target.value.toUpperCase() })}
          />
        )}
        {type === 'number' && (
          <div className="flex items-center justify-end flex-wrap gap-2">
            <Input
              className="max-w-28 p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="Min"
              step={0.01}
              type="number"
              value={normalizeDecimal((dynamicValue as Interval).min) ?? ''}
              onBlur={(event) => {
                if (event.target.value) return;

                onChange({ type, value: { ...(dynamicValue as Interval), min: initialNumberBounds.min } });
              }}
              onChange={(event) => onMinChange(event.target.value)}
            />
            <Input
              className="max-w-28 p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="Max"
              step={0.01}
              type="number"
              value={normalizeDecimal((dynamicValue as Interval).max) ?? ''}
              onBlur={(event) => {
                if (event.target.value) return;

                onChange({ type, value: { ...(dynamicValue as Interval), max: initialNumberBounds.max } });
              }}
              onChange={(event) => onMaxChange(event.target.value)}
            />
          </div>
        )}
        {type === 'string' && (
          <Input
            className="min-w-[232px] p-[5px]! rounded-none! dark:border-border/20!"
            step={1}
            type="number"
            value={dynamicValue as number}
            onChange={(event) => onChange({ type, value: clamp(Number(event.target.value), 1, MAX_STRING_LENGTH) })}
          />
        )}
        <div className="flex items-center justify-end gap-2">
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
      </div>
    </div>
  );

  function renderLabel() {
    let label: string | null = null;
    switch (type) {
      case 'enum':
        label = 'Enter all valid values separated by ","';
        break;
      case 'number':
        label = 'Set Min/Max range for boundary test. 0 - integer, 0.00 - decimal';
        break;
      case 'string':
        label = 'Value max length';
        break;
    }

    if (!label) return null;

    return <div className="mb-1 text-xs text-text-secondary">{label}</div>;
  }

  function onMinChange(value: string) {
    if (!value) {
      onChange({ type, value: { ...(dynamicValue as Interval), min: null } });
      return;
    }

    let min = clamp(Number(value), -MAX_INT32, MAX_INT32);
    if (TRAILING_ZEROS_PATTERN.test(value)) min += 0.001; // to preserve trailing zeros in decimals

    const max = Math.max(min, (dynamicValue as Interval).max);
    onChange({ type, value: { min, max } });
  }

  function onMaxChange(value: string) {
    if (!value) {
      onChange({ type, value: { ...(dynamicValue as Interval), max: null } });
      return;
    }

    let max = clamp(Number(value), -MAX_INT32, MAX_INT32);
    if (TRAILING_ZEROS_PATTERN.test(value)) max += 0.001; // to preserve trailing zeros in decimals

    const min = Math.min(max, (dynamicValue as Interval).min);
    onChange({ type, value: { min, max } });
  }

  function onSelectTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as DataType;
    onChange(getInitialParameterValue(type, ''));
  }
}
