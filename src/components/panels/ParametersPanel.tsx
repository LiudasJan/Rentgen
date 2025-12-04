import { RequestParameters } from '../../types';
import { ParameterControls } from '../controls/ParameterControls';
import ResponsePanel, { Props as ResponsePanelProps } from './ResponsePanel';

interface Props extends Omit<ResponsePanelProps, 'onChange'> {
  parameters: RequestParameters;
  onChange: (parameters: RequestParameters) => void;
}

export default function ParametersPanel({ title, parameters, onChange, ...otherProps }: Props) {
  return (
    <ResponsePanel title={title} {...otherProps}>
      {Object.entries(parameters).map(([key, value]) => (
        <div key={key} className="pb-4 first-of-type:pt-4 px-4 flex items-end justify-between gap-4">
          <span className="flex-1 min-w-1/5 mb-2 font-monospace truncate" title={key}>
            {key}
          </span>
          <ParameterControls dynamicValue={value} onChange={(value) => onChange({ ...parameters, [key]: value })} />
        </div>
      ))}
    </ResponsePanel>
  );
}
