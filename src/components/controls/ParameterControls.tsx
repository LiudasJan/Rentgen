import cn from 'classnames';
import { ChangeEvent } from 'react';
import { initialNumberBounds } from '../../constants/datasets';
import { isParameterTestSkipped } from '../../tests';
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
  dynamicValue: DynamicValue;
  onChange: (value: DynamicValue) => void;
}

export function ParameterControls({ dynamicValue, onChange }: Props) {
  const { mandatory, type, value } = dynamicValue;

  return (
    <div className="w-full max-w-[440px]">
      {renderLabel()}
      <div className="grid grid-cols-2 gap-2">
        {type === 'enum' && (
          <Input
            className="w-full p-[5px]! rounded-none! dark:border-border/20!"
            value={value as string}
            onChange={(event) => onChange({ ...dynamicValue, value: event.target.value })}
          />
        )}
        {type === 'number' && (
          <div className="flex items-center gap-2">
            <Input
              className="w-full p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="Min"
              step={0.01}
              type="number"
              value={normalizeDecimal((value as Interval).min) ?? ''}
              onBlur={(event) => {
                if (event.target.value) return;

                onChange({ ...dynamicValue, value: { ...(value as Interval), min: initialNumberBounds.min } });
              }}
              onChange={(event) => onMinChange(event.target.value)}
            />
            <Input
              className="w-full p-[5px]! rounded-none! dark:border-border/20!"
              placeholder="Max"
              step={0.01}
              type="number"
              value={normalizeDecimal((value as Interval).max) ?? ''}
              onBlur={(event) => {
                if (event.target.value) return;

                onChange({ ...dynamicValue, value: { ...(value as Interval), max: initialNumberBounds.max } });
              }}
              onChange={(event) => onMaxChange(event.target.value)}
            />
          </div>
        )}
        {type === 'string' && (
          <Input
            className="w-full p-[5px]! rounded-none! dark:border-border/20!"
            step={1}
            type="number"
            value={value as number}
            onChange={(event) => onChange({ ...dynamicValue, value: clamp(Number(event.target.value), 1, 1000000) })}
          />
        )}
        <div className="col-start-2 flex items-center gap-1">
          <SimpleSelect
            className="w-full p-1! rounded-none! outline-none dark:border-border/20!"
            options={parameterOptions}
            value={type}
            onChange={onSelectTypeChange}
          />
          <ClearCrossIcon
            className={cn(
              'h-4.5 w-4.5 shrink-0 text-button-text-secondary hover:text-button-text-secondary-hover',
              'dark:text-text-secondary dark:hover:text-dark-text cursor-pointer',
            )}
            onClick={() => onChange({ type: 'do-not-test' })}
          />
          <input
            checked={mandatory}
            disabled={isParameterTestSkipped(type)}
            title={
              !isParameterTestSkipped(type)
                ? 'Checked = Mandatory → Rentgen generates tests based on this setting'
                : undefined
            }
            type="checkbox"
            onChange={(e) => onChange({ ...dynamicValue, mandatory: e.target.checked })}
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
      onChange({ ...dynamicValue, value: { ...(dynamicValue.value as Interval), min: null } });
      return;
    }

    let min = clamp(Number(value), -MAX_INT32, MAX_INT32);
    if (TRAILING_ZEROS_PATTERN.test(value)) min += 0.001; // to preserve trailing zeros in decimals

    const max = Math.max(min, (dynamicValue.value as Interval).max);
    onChange({ type, value: { min, max } });
  }

  function onMaxChange(value: string) {
    if (!value) {
      onChange({ ...dynamicValue, value: { ...(dynamicValue.value as Interval), max: null } });
      return;
    }

    let max = clamp(Number(value), -MAX_INT32, MAX_INT32);
    if (TRAILING_ZEROS_PATTERN.test(value)) max += 0.001; // to preserve trailing zeros in decimals

    const min = Math.min(max, (dynamicValue.value as Interval).min);
    onChange({ type, value: { min, max } });
  }

  function onSelectTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as DataType;
    onChange(getInitialParameterValue(type, ''));
  }
}
