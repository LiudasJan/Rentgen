import ReactJson, { ReactJsonViewProps } from '@microlink/react-json-view';

interface Props extends Omit<ReactJsonViewProps, 'src'> {
  source: string | object;
}

export function JsonViewer({ source, ...otherProps }: Props) {
  if (!source || typeof source === 'string')
    return <pre className="m-0! text-[#0451a5] whitespace-pre-wrap break-all">{String(source)}</pre>;

  return (
    <ReactJson
      displayArrayKey={false}
      displayDataTypes={false}
      displayObjectSize={false}
      enableClipboard={false}
      name={false}
      src={source as object}
      {...otherProps}
    />
  );
}
