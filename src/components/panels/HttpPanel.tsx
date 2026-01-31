import cn from 'classnames';
import { HttpRequest, HttpResponse } from '../../types';
import { CopyButton } from '../buttons/CopyButton';
import { JsonViewer } from '../JsonViewer';
import { Props as PanelProps } from './Panel';

interface Props extends PanelProps {
  source: HttpRequest | HttpResponse | string;
}

export function HttpPanel({ className, children, source, title, ...otherProps }: Props) {
  return (
    <div className={cn('relative flex flex-col gap-2.5', className)} {...otherProps}>
      <h4 className="m-0 text-text dark:text-dark-text">{title}</h4>
      {source && (
        <CopyButton className="absolute top-0 right-0" textToCopy={JSON.stringify(source, null, 2)}>
          Copy
        </CopyButton>
      )}
      <div
        className={cn(
          'flex-auto m-0 p-2.5 bg-white border border-border rounded dark:bg-dark-input dark:border-dark-border',
        )}
      >
        <JsonViewer source={source} />
      </div>
      {children}
    </div>
  );
}
