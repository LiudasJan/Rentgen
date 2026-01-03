import cn from 'classnames';
import { DynamicVariable } from '../../types';

import ClearCrossIcon from '../../assets/icons/clear-cross-icon.svg';
import EditIcon from '../../assets/icons/edit-icon.svg';
import ReloadIcon from '../../assets/icons/reload-icon.svg';

interface Props {
  variable: DynamicVariable;
  collectionName: string;
  requestName: string;
  isOrphaned: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DynamicVariableRow({
  variable,
  collectionName,
  requestName,
  isOrphaned,
  onRefresh,
  onEdit,
  onDelete,
}: Props) {
  const formatValue = (value: string | null): string => {
    if (value === null) return '—';
    if (value.length > 50) return value.substring(0, 47) + '...';
    return value;
  };

  const formatLastUpdated = (timestamp: number | null): string => {
    if (timestamp === null) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div
      className={cn('flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-body last:border-b-0', {
        'bg-orange-50 dark:bg-orange-900/20': isOrphaned,
      })}
    >
      {/* Key */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {isOrphaned && (
            <span className="text-orange-500" title="Linked request no longer exists">
              ⚠️
            </span>
          )}
          <span className="font-mono text-sm truncate" title={variable.key}>
            {variable.key}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex-1 min-w-0">
        <span
          className={cn('font-mono text-sm truncate block', {
            'text-text-secondary dark:text-dark-text-secondary': variable.currentValue === null,
          })}
          title={variable.currentValue || 'No value extracted yet'}
        >
          {formatValue(variable.currentValue)}
        </span>
      </div>

      {/* Selector */}
      <div className="flex-1 min-w-0">
        <span
          className="font-mono text-xs text-text-secondary dark:text-dark-text-secondary truncate block"
          title={variable.selector}
        >
          {variable.selector}
        </span>
      </div>

      {/* Source (Collection/Request) */}
      <div className="flex-1 min-w-0">
        <span
          className={cn('text-xs truncate block', {
            'text-red-500': isOrphaned,
            'text-text-secondary dark:text-dark-text-secondary': !isOrphaned,
          })}
          title={isOrphaned ? 'Linked request no longer exists' : `${collectionName} / ${requestName}`}
        >
          {isOrphaned ? 'Deleted Request' : `${collectionName} / ${requestName}`}
        </span>
      </div>

      {/* Type Badge */}
      <div className="w-16">
        <span
          className={cn(
            'inline-block px-2 py-0.5 text-xs font-medium rounded',
            variable.source === 'body'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          )}
        >
          {variable.source === 'body' ? 'Body' : 'Header'}
        </span>
      </div>

      {/* Last Updated */}
      <div className="w-32 text-right">
        <span
          className="text-xs text-text-secondary dark:text-dark-text-secondary"
          title={formatLastUpdated(variable.lastUpdated)}
        >
          {formatLastUpdated(variable.lastUpdated)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-20 justify-end">
        <ReloadIcon
          className={cn('h-4 w-4 text-text-secondary dark:text-dark-text-secondary cursor-pointer', {
            'hover:text-text dark:hover:text-dark-text': !isOrphaned,
            'opacity-50 cursor-not-allowed': isOrphaned,
          })}
          title="Refresh value"
          onClick={isOrphaned ? undefined : onRefresh}
        />
        <EditIcon
          className="h-4 w-4 text-text-secondary dark:text-dark-text-secondary hover:text-button-primary cursor-pointer"
          title="Edit variable"
          onClick={onEdit}
        />
        <ClearCrossIcon
          className="h-4.5 w-4.5 text-text-secondary dark:text-dark-text-secondary hover:text-button-danger cursor-pointer"
          title="Delete variable"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
