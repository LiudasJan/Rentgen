import cn from 'classnames';
import AutosizeTextarea, { TextareaAutosizeProps } from 'react-textarea-autosize';

export default function TextareaAutosize({ className, ...otherProps }: TextareaAutosizeProps) {
  return (
    <AutosizeTextarea
      className={cn(
        'w-full min-h-28 m-0 py-2 px-3 text-xs text-text border border-border rounded-md box-border resize-y outline-none',
        'dark:text-dark-text dark:bg-dark-input dark:border-dark-input dark:placeholder:text-text-secondary',
        className,
      )}
      {...otherProps}
    />
  );
}
