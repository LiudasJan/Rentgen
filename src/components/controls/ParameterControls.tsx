import cn from 'classnames';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { selectTestEngineConfiguration } from '../../store/selectors';
import { isParameterTestSkipped } from '../../tests';
import { DataType, DynamicValue, Interval } from '../../types';
import { clamp, getInitialParameterValue, normalizeDecimal } from '../../utils';
import Input from '../inputs/Input';
import { SelectOption } from '../inputs/Select';
import SimpleSelect from '../inputs/SimpleSelect';
import Toggle from '../inputs/Toggle';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';

const MAX_INT32 = 2147483647;
const TRAILING_ZEROS_PATTERN = /^-?\d+[.,]0+$/;

interface Props {
  dynamicValue: DynamicValue;
  onChange: (value: DynamicValue) => void;
}

export function ParameterControls({ dynamicValue, onChange }: Props) {
  const testEngineConfiguration = useAppSelector(selectTestEngineConfiguration);
  const { t } = useTranslation();

  const parameterOptions: SelectOption<DataType>[] = [
    { value: 'do-not-test', label: t('parameterTypes.doNotTest') },
    { value: 'randomEmail', label: t('parameterTypes.randomEmail') },
    { value: 'randomInt', label: t('parameterTypes.randomInteger') },
    { value: 'randomString', label: t('parameterTypes.randomString') },
    { value: 'boolean', label: t('parameterTypes.boolean') },
    { value: 'currency', label: t('parameterTypes.currency') },
    { value: 'date_yyyy_mm_dd', label: t('parameterTypes.dateYYYYMMDD') },
    { value: 'email', label: t('parameterTypes.email') },
    { value: 'enum', label: t('parameterTypes.enum') },
    { value: 'number', label: t('parameterTypes.number') },
    { value: 'phone', label: t('parameterTypes.phone') },
    { value: 'string', label: t('parameterTypes.string') },
    { value: 'url', label: t('parameterTypes.url') },
  ];
  const { mandatory, type, value } = dynamicValue;
  const inputClassName = 'w-full p-[5px] rounded-none dark:border-border/20';

  return (
    <div className="w-full max-w-110">
      {renderLabel()}
      <div className="grid grid-cols-2 gap-2">
        {type === 'enum' && (
          <Input
            className={inputClassName}
            value={value as string}
            onChange={(event) => onChange({ ...dynamicValue, value: event.target.value })}
          />
        )}
        {type === 'number' && (
          <div className="flex items-center gap-2">
            <Input
              className={inputClassName}
              placeholder="Min"
              step={0.01}
              type="number"
              value={normalizeDecimal((value as Interval).min) ?? ''}
              onBlur={() => {
                const min = (value as Interval).min;
                const max = (value as Interval).max;

                onChange({
                  ...dynamicValue,
                  value: { ...(value as Interval), min: Math.min(min || testEngineConfiguration.number.min, max) },
                });
              }}
              onChange={(event) => onMinChange(event.target.value)}
            />
            <Input
              className={inputClassName}
              placeholder="Max"
              step={0.01}
              type="number"
              value={normalizeDecimal((value as Interval).max) ?? ''}
              onBlur={() => {
                const min = (value as Interval).min;
                const max = (value as Interval).max;

                onChange({
                  ...dynamicValue,
                  value: { ...(value as Interval), max: Math.max(min, max || testEngineConfiguration.number.max) },
                });
              }}
              onChange={(event) => onMaxChange(event.target.value)}
            />
          </div>
        )}
        {type === 'string' && (
          <Input
            className={inputClassName}
            step={1}
            type="number"
            value={value as number}
            onChange={(event) => onChange({ ...dynamicValue, value: clamp(Number(event.target.value), 1, 1000000) })}
          />
        )}
        <div className="col-start-2 flex items-center gap-1">
          <SimpleSelect
            className="w-full p-1 rounded-none dark:border-border/20"
            options={parameterOptions}
            value={type}
            onChange={onSelectTypeChange}
          />
          <ClearCrossIcon
            className={cn(
              'h-4.5 w-4.5 shrink-0 text-button-text-secondary hover:text-button-text-secondary-hover',
              'dark:text-text-secondary dark:hover:text-dark-text cursor-pointer',
            )}
            onClick={() => onChange({ type: 'do-not-test', value: '', mandatory: false })}
          />
          <Toggle
            checked={mandatory}
            disabled={isParameterTestSkipped(type)}
            title={!isParameterTestSkipped(type) ? t('controls.mandatoryToggle') : undefined}
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
        label = t('controls.enumLabel');
        break;
      case 'number':
        label = t('controls.numberLabel');
        break;
      case 'string':
        label = t('controls.stringLabel');
        break;
    }

    if (!label) return null;

    return <div className="mb-1 text-xs text-text-secondary">{label}</div>;
  }

  function onMinChange(value: string) {
    let min = clamp(Number(value), -MAX_INT32, MAX_INT32) || null;
    if (TRAILING_ZEROS_PATTERN.test(value)) min += 0.001; // to preserve trailing zeros in decimals

    onChange({ ...dynamicValue, value: { ...(dynamicValue.value as Interval), min } });
  }

  function onMaxChange(value: string) {
    let max = clamp(Number(value), -MAX_INT32, MAX_INT32) || null;
    if (TRAILING_ZEROS_PATTERN.test(value)) max += 0.001; // to preserve trailing zeros in decimals

    onChange({ ...dynamicValue, value: { ...(dynamicValue.value as Interval), max } });
  }

  function onSelectTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const type = event.target.value as DataType;
    if (isParameterTestSkipped(type)) onChange(getInitialParameterValue(type, '', false));
    else onChange(getInitialParameterValue(type));
  }
}
