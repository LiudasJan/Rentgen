import { Environment } from '../../types';
import Select, { SelectOption } from '../inputs/Select';

interface Props {
  environments: Environment[];
  selectedEnvironmentId: string | null;
  onSelect: (id: string | null) => void;
}

export default function EnvironmentSelector({ environments, selectedEnvironmentId, onSelect }: Props) {
  const selectedEnvironment = environments.find((env) => env.id === selectedEnvironmentId);

  const options: SelectOption<string | null>[] = [
    { value: null, label: 'No Environment' },
    ...environments.map((env) => ({
      value: env.id,
      label: env.title,
    })),
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Color indicator for selected environment */}
      {selectedEnvironment && (
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: selectedEnvironment.color }} />
      )}
      <Select
        className="min-w-[150px]"
        isSearchable={false}
        options={options}
        placeholder="Select Environment"
        value={options.find((opt) => opt.value === selectedEnvironmentId) || options[0]}
        onChange={(option: unknown) => onSelect((option as SelectOption<string | null>).value)}
      />
    </div>
  );
}
