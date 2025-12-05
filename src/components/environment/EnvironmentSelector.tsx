import { Environment } from '../../types';
import Select, { SelectOption } from '../inputs/Select';

function isColorDark(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

interface Props {
  environments: Environment[];
  selectedEnvironmentId: string | null;
  onSelect: (id: string | null) => void;
}

export default function EnvironmentSelector({ environments, selectedEnvironmentId, onSelect }: Props) {
  const selectedEnvironment = environments.find((env) => env.id === selectedEnvironmentId);
  const hasColor = selectedEnvironment?.color;
  const needsLightText = hasColor && isColorDark(selectedEnvironment.color);

  const options: SelectOption<string | null>[] = [
    { value: null, label: 'No Environment' },
    ...environments.map((env) => ({
      value: env.id,
      label: env.title,
    })),
  ];

  return (
    <Select
      className="min-w-[150px]"
      isSearchable={false}
      options={options}
      placeholder="Select Environment"
      value={options.find((opt) => opt.value === selectedEnvironmentId) || options[0]}
      onChange={(option: unknown) => onSelect((option as SelectOption<string | null>).value)}
      styles={
        hasColor
          ? {
              control: (base) => ({
                ...base,
                backgroundColor: selectedEnvironment.color,
              }),
              singleValue: (base) => ({
                ...base,
                color: needsLightText ? '#ffffff' : '#000000',
              }),
              dropdownIndicator: (base) => ({
                ...base,
                color: needsLightText ? '#ffffff' : undefined,
              }),
            }
          : undefined
      }
    />
  );
}
