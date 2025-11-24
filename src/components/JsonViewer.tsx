import ReactJson, { ReactJsonViewProps } from '@microlink/react-json-view';
import cn from 'classnames';

interface Props extends Omit<ReactJsonViewProps, 'src'> {
  source: string | object;
}

export function JsonViewer({ source, ...otherProps }: Props) {
  if (!source || typeof source === 'string')
    return <pre className="m-0! text-[#0451a5] whitespace-pre-wrap break-all">{String(source)}</pre>;

  return (
    <div
      className={cn(
        '[&_.node-ellipsis]:text-xs! [&_.node-ellipsis]:text-black! [&_.node-ellipsis]:-translate-y-0.5! [&_.node-ellipsis+.brace-row]:block!',
        '[&_.object-key]:text-[#a31515]! [&_.object-key+span]:ml-0! [&_.object-key+span]:text-black!',
        '[&_.string-value]:text-[#0451a5]!',
        '[&_.variable-row]:pr-0! [&_.object-key-val]:pr-0! [&_.variable-value]:pr-0!',
        '[&_.variable-value>:first-child]:text-[#098658]! [&_.variable-value>:first-child]:bg-transparent! [&_.variable-value>:first-child]:text-[13px]! [&_.variable-value>:first-child]:font-normal!',
        '[&_.icon-container_svg]:text-black/40!',
      )}
    >
      <ReactJson
        displayArrayKey={false}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={false}
        name={false}
        src={source as object}
        {...otherProps}
      />
    </div>
  );
}
