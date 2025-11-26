import cn from 'classnames';
import AutosizeTextarea, { TextareaAutosizeProps } from 'react-textarea-autosize';

export default function TextareaAutosize({ className, ...otherProps }: TextareaAutosizeProps) {
  return (
    <AutosizeTextarea
      className={cn(
        'w-full min-h-28 m-0 py-2 px-3 text-xs border border-border rounded-md box-border resize-y outline-none',
        'dark:text-white dark:bg-[#343a46] dark:border-[#343a46] dark:placeholder:text-[#99a1b3]',
        className,
      )}
      {...otherProps}
    />
  );
}
