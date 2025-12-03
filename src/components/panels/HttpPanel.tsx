import cn from 'classnames';
import { HttpRequest, HttpResponse } from '../../types';
import { CopyButton } from '../buttons/CopyButton';
import { JsonViewer } from '../JsonViewer';
import { Props as ResponsePanelProps } from './ResponsePanel';

interface Props extends ResponsePanelProps {
  source: HttpRequest | HttpResponse | string;
}

export function HttpPanel({ className, children, source, title, ...otherProps }: Props) {
  return (
    <div className={cn('relative flex flex-col gap-2.5', className)} {...otherProps}>
      <h4 className="m-0 text-text">{title}</h4>
      {source && (
        <CopyButton className="absolute top-0 right-0" textToCopy={JSON.stringify(source, null, 2)}>
          Copy
        </CopyButton>
      )}
      <div
        className={cn('max-h-80 flex-auto m-0 p-2.5', {
          'bg-input-bg border border-border rounded overflow-y-auto': source,
          'pl-0': !source,
        })}
      >
        <JsonViewer source={source} />
      </div>
      {children}
    </div>
  );
}
