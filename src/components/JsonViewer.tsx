import ReactJson, { ReactJsonViewProps } from '@microlink/react-json-view';
import cn from 'classnames';

interface Props extends Omit<ReactJsonViewProps, 'src'> {
  source: string | object;
}

export function JsonViewer({ source, ...otherProps }: Props) {
  if (!source || typeof source === 'string')
    return <pre className="m-0! text-json-string whitespace-pre-wrap break-all">{String(source)}</pre>;

  return (
    <div
      className={cn(
        '[&_.node-ellipsis]:text-xs! [&_.node-ellipsis]:text-text! [&_.node-ellipsis]:-translate-y-0.5! [&_.node-ellipsis+.brace-row]:block!',
        '[&_.object-key]:text-json-key! [&_.object-key+span]:ml-0! [&_.object-key+span]:text-text!',
        '[&_.string-value]:text-json-string!',
        '[&_.variable-row]:pr-0! [&_.variable-row]:border-l-border/20! [&_.object-key-val]:pr-0! [&_.object-key-val]:border-l-border/20! [&_.variable-value]:pr-0! [&_.variable-value]:border-l-border/20!',
        '[&_.variable-value>:first-child]:text-json-number! [&_.variable-value>:first-child]:bg-transparent! [&_.variable-value>:first-child]:text-[13px]! [&_.variable-value>:first-child]:font-normal!',
        '[&_.icon-container_svg]:text-text/40!',
        '[&_.icon-container+span+span]:text-text! [&_.brace-row>span]:text-text! [&_.brace-row+span]:text-text! [&_.variable-value+span]:text-text!',
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
