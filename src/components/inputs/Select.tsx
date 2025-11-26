import ReactSelect, { ClassNamesConfig, GroupBase, Props as SelectProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import cn from 'classnames';

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
    control: () =>
      cn(
        'min-h-auto! bg-white! border! border-border! rounded-md! shadow-none!',
        'dark:bg-[#343a46]! dark:border-[#343a46]!',
      ),
    dropdownIndicator: () => 'w-7! p-1.5! text-black/40! dark:text-white/40!',
    indicatorSeparator: () => 'hidden',
    input: () => 'm-0! p-0! text-black! dark:text-white!',
    menu: () => 'm-0! rounded-md! dark:bg-[#343a46]!',
    menuList: () => 'p-0!',
    option: ({ data, isSelected }) =>
      cn(
        'first:rounded-t-md! last:rounded-b-md!',
        {
          'text-white!': isSelected,
          'dark:bg-[#343a46]! dark:hover:bg-[#99a1b3]!': !isSelected,
          'text-black! dark:text-white!': !(data as SelectOption<unknown>).className,
        },
        (data as SelectOption<unknown>).className,
      ),
    placeholder: () => 'm-0!',
    singleValue: ({ data, isDisabled }) =>
      cn(
        'm-0!',
        {
          'text-black/50! dark:text-white/50!': isDisabled,
          'text-black! dark:text-white!': !(data as SelectOption<unknown>).className,
        },
        (data as SelectOption<unknown>).className,
      ),
    valueContainer: () => 'py-2! px-3!',
    ...classNames,
  };

  if (isCreatable)
    return <CreatableSelect {...otherProps} classNames={selectClassNames} formatCreateLabel={(value) => value} />;

  return <ReactSelect {...otherProps} classNames={selectClassNames} />;
}
