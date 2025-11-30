import cn from 'classnames';
import { ChangeEvent } from 'react';
import { initialNumberBounds } from '../../constants/datasets';
import { DataType, DynamicValue, Interval } from '../../types';
import { clamp, normalizeDecimal } from '../../utils';
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
    <div>
      {type === 'number' && (
        <div className="mb-1 text-xs text-text-secondary">Set Min/Max range for boundary test (integer or decimal)</div>
      )}
      <div className="flex items-center justify-end flex-wrap gap-2">
        {type === 'number' && (
          <div className="flex items-center justify-end flex-wrap gap-2">
            <Input
              className="max-w-28 p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="Min"
              max={initialNumberBounds.max}
              min={-initialNumberBounds.max}
              step={0.01}
              type="number"
              value={(dynamicValue as Interval).min}
              onBlur={(e) => onMinChange(normalizeDecimal(Number(e.target.value)))}
              onChange={(e) => onMinChange(!e.target.value ? null : Number(e.target.value))}
            />
            <Input
              className="max-w-28 p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="Max"
              max={initialNumberBounds.max}
              min={-initialNumberBounds.max}
              step={0.01}
              type="number"
              value={(dynamicValue as Interval).max}
              onBlur={(e) => onMaxChange(normalizeDecimal(Number(e.target.value)))}
              onChange={(e) => onMaxChange(!e.target.value ? null : Number(e.target.value))}
            />
          </div>
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

  function onMinChange(value: number | null) {
    if (value === null) {
      onChange({ type, value: { ...(dynamicValue as Interval), min: null } });
      return;
    }

    const min = clamp(value, -initialNumberBounds.max, initialNumberBounds.max);
    const max = min > (dynamicValue as Interval).max ? min : (dynamicValue as Interval).max;

    onChange({ type, value: { ...(dynamicValue as Interval), min, max: normalizeDecimal(max) } });
  }

  function onMaxChange(value: number | null) {
    if (value === null) {
      onChange({ type, value: { ...(dynamicValue as Interval), max: null } });
      return;
    }

    const max = clamp(value, -initialNumberBounds.max, initialNumberBounds.max);
    const min = max < (dynamicValue as Interval).min ? max : (dynamicValue as Interval).min;

    onChange({ type, value: { ...(dynamicValue as Interval), min: normalizeDecimal(min), max } });
  }

  function onSelectTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as DataType;
    onChange(type === 'number' ? { type, value: initialNumberBounds } : { type });
  }
}
