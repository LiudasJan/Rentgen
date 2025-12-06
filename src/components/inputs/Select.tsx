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

export default function Select({ classNames, styles, isCreatable, ...otherProps }: Props) {
  const hasCustomControlStyle = !!styles?.control;

  const selectClassNames: ClassNamesConfig<unknown, boolean, GroupBase<unknown>> = {
    container: () => 'min-w-[110px] text-xs',
    control: () =>
      cn('min-h-auto! border! border-border! rounded-md! shadow-none!', 'dark:border-dark-border! transition-none!', {
        'bg-white! dark:bg-dark-input!': !hasCustomControlStyle,
      }),
    dropdownIndicator: () => 'w-7! p-1.5! text-text/40! dark:text-dark-text/40!',
    indicatorSeparator: () => 'hidden',
    input: () => 'm-0! p-0! text-text! dark:text-dark-text!',
    menu: () => 'm-0! rounded-md! dark:bg-dark-input! transition-none!',
    menuList: () => 'p-0!',
    option: ({ data, isSelected }) =>
      cn(
        'first:rounded-t-md! last:rounded-b-md! transition-none!',
        {
          'text-white!': isSelected,
          'dark:bg-dark-input! dark:hover:bg-dark-button-secondary!': !isSelected,
          'text-text! dark:text-dark-text!': !(data as SelectOption<unknown>).className,
        },
        !isSelected ? (data as SelectOption<unknown>).className : undefined,
      ),
    placeholder: () => 'm-0!',
    singleValue: ({ data, isDisabled }) =>
      cn(
        'm-0!',
        {
          'text-text/50! dark:text-dark-text/50!': isDisabled,
          'text-text! dark:text-dark-text!': !(data as SelectOption<unknown>).className,
        },
        (data as SelectOption<unknown>).className,
      ),
    valueContainer: () => 'py-2! px-3!',
    ...classNames,
  };

  if (isCreatable)
    return (
      <CreatableSelect
        {...otherProps}
        styles={styles}
        classNames={selectClassNames}
        formatCreateLabel={(value) => value}
      />
    );

  return <ReactSelect {...otherProps} styles={styles} classNames={selectClassNames} />;
}
