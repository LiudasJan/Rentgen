import cn from 'classnames';
import { DataType, RequestParameters } from '../../types';
import { SelectOption } from '../inputs/Select';
import SimpleSelect from '../inputs/SimpleSelect';
import ResponsePanel, { Props as ResponsePanelProps } from './ResponsePanel';

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

interface Props extends Omit<ResponsePanelProps, 'onChange'> {
  parameters: RequestParameters;
  onChange: (parameters: RequestParameters) => void;
}

export default function ParametersPanel({ title, parameters, onChange, ...otherProps }: Props) {
  return (
    <ResponsePanel title={title} {...otherProps}>
      {Object.entries(parameters).map(([key, { type }]) => (
        <div key={key} className="pb-4 first-of-type:pt-4 px-4 flex items-center justify-between gap-4">
          <span className="flex-1 font-monospace text-ellipsis text-nowrap overflow-hidden">{key}</span>
          <div className="flex items-center">
            <SimpleSelect
              className="rounded-none! p-1! outline-none"
              options={parameterOptions}
              value={type}
              onChange={(e) => onChange({ [key]: { type: e.target.value as DataType } })}
            />
            <ClearCrossIcon
              className={cn(
                'h-[18px] w-[18px] p-[5px] text-button-text-secondary hover:text-button-text-secondary-hover',
                'dark:text-text-secondary dark:hover:text-dark-text cursor-pointer',
              )}
              onClick={() => onChange({ [key]: { type: 'do-not-test' } })}
            />
          </div>
        </div>
      ))}
    </ResponsePanel>
  );
}
