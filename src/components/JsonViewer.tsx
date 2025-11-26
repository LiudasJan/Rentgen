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
        'dark:[&_.node-ellipsis]:text-white!',
        '[&_.object-key]:text-[#a31515]! [&_.object-key+span]:ml-0! [&_.object-key+span]:text-black!',
        'dark:[&_.object-key]:text-[#9cdcfe]! dark:[&_.object-key+span]:text-white!',
        '[&_.string-value]:text-[#0451a5]!',
        'dark:[&_.string-value]:text-[#c3612f]!',
        '[&_.variable-row]:pr-0! [&_.variable-row]:border-l-[#d0dcdc]/20! [&_.object-key-val]:pr-0! [&_.object-key-val]:border-l-[#d0dcdc]/20! [&_.variable-value]:pr-0! [&_.variable-value]:border-l-[#d0dcdc]/20!',
        '[&_.variable-value>:first-child]:text-[#098658]! [&_.variable-value>:first-child]:bg-transparent! [&_.variable-value>:first-child]:text-[13px]! [&_.variable-value>:first-child]:font-normal!',
        'dark:[&_.variable-value>:first-child]:text-[#81c09b]!',
        '[&_.icon-container_svg]:text-black/40!',
        'dark:[&_.icon-container_svg]:text-[#d0dcdc]! dark:[&_.icon-container+span+span]:text-[#d0dcdc]!',
        'dark:[&_.brace-row>span]:text-[#d0dcdc]! dark:[&_.brace-row+span]:text-[#d0dcdc]!',
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
