import cn from 'classnames';
import { FieldType } from '../../types';
import { SelectOption } from '../inputs/Select';
import SimpleSelect from '../inputs/SimpleSelect';
import ResponsePanel, { Props as ResponsePanelProps } from './ResponsePanel';

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

interface Props extends ResponsePanelProps {
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
              className={cn(
                'h-[18px] w-[18px] p-[5px] text-button-text-secondary hover:text-button-text-secondary-hover',
                'dark:text-text-secondary dark:hover:text-dark-text cursor-pointer',
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              onClick={() => onRemoveClick(key)}
            >
              <path
                d="M7.29289 7.29289C7.68342 6.90237 8.31658 6.90237 8.70711 7.29289L12 10.5858L15.2929 7.29289C15.6834 6.90237 16.3166 6.90237 16.7071 7.29289C17.0976 7.68342 17.0976 8.31658 16.7071 8.70711L13.4142 12L16.7071 15.2929C17.0976 15.6834 17.0976 16.3166 16.7071 16.7071C16.3166 17.0976 15.6834 17.0976 15.2929 16.7071L12 13.4142L8.70711 16.7071C8.31658 17.0976 7.68342 17.0976 7.29289 16.7071C6.90237 16.3166 6.90237 15.6834 7.29289 15.2929L10.5858 12L7.29289 8.70711C6.90237 8.31658 6.90237 7.68342 7.29289 7.29289Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>
      ))}
    </ResponsePanel>
  );
}
