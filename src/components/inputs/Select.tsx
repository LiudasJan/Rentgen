import ReactSelect, { ClassNamesConfig, GroupBase, Props as SelectProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';

export interface SelectOption<T> {
  value: T;
  label: string;
  className?: string;
}

interface Props extends SelectProps {
  isCreatable?: boolean;
}

export default function Select({ classNames, isCreatable, ...otherProps }: Props) {
  const selectClassNames: ClassNamesConfig<unknown, boolean, GroupBase<unknown>> = {
    container: () => 'min-w-[110px] text-xs',
    control: () => 'min-h-auto! border! border-border! rounded-md! shadow-none!',
    dropdownIndicator: () => 'p-1.5! text-text!',
    indicatorSeparator: () => 'hidden',
    input: () => 'm-0! p-0!',
    menu: () => 'm-0! rounded-md!',
    menuList: () => 'p-0!',
    option: ({ data, isSelected }) =>
      `first:rounded-t-md! last:rounded-b-md! ${(data as SelectOption<unknown>).className ?? ''} ${isSelected ? 'text-white!' : ''}`,
    placeholder: () => 'm-0!',
    singleValue: ({ data }) => `m-0! ${(data as SelectOption<unknown>).className ?? ''}`,
    valueContainer: () => 'py-2! px-3!',
    ...classNames,
  };

  if (isCreatable)
    return <CreatableSelect {...otherProps} classNames={selectClassNames} formatCreateLabel={(value) => value} />;

  return <ReactSelect {...otherProps} classNames={selectClassNames} />;
}
