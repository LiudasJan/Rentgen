import { HTMLAttributes } from 'react';
import { FieldType } from '../../types';
import { SelectOption } from '../inputs/Select';
import SimpleSelect from '../inputs/SimpleSelect';
import ResponsePanel from './ResponsePanel';

const parameterOptions: SelectOption<FieldType>[] = [
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

interface Props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  mappings: Record<string, FieldType>;
  onFieldTypeChange: (key: string, value: FieldType) => void;
  onRemoveClick: (key: string) => void;
}

export default function ParametersPanel({ title, mappings, onFieldTypeChange, onRemoveClick, ...otherProps }: Props) {
  return (
    <ResponsePanel title={title} {...otherProps}>
      {Object.entries(mappings).map(([key, type]) => (
        <div key={key} className="pb-4 first-of-type:pt-4 px-4 flex items-center justify-between gap-4">
          <span className="flex-1 font-monospace text-ellipsis text-nowrap overflow-hidden">{key}</span>
          <div className="flex items-center">
            <SimpleSelect
              className="rounded-none! p-1! outline-none"
              options={parameterOptions}
              value={type}
              onChange={(e) => onFieldTypeChange(key, e.target.value as FieldType)}
            />
            <svg
              className="h-3 w-3 p-2 cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              onClick={() => onRemoveClick(key)}
            >
              <path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z" />
            </svg>
          </div>
        </div>
      ))}
    </ResponsePanel>
  );
}
