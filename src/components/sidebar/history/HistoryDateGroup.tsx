import cn from 'classnames';
import { useState } from 'react';
import { HistoryEntry } from '../../../types/history';
import HistoryItem from './HistoryItem';

import ChevronIcon from '../../../assets/icons/chevron-icon.svg';

interface Props {
  label: string;
  entries: HistoryEntry[];
}

export default function HistoryDateGroup({ label, entries }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <div
        className="flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-input hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronIcon
          className={cn('h-4 w-4 text-text-secondary transition-transform', {
            'rotate-90': isExpanded,
          })}
        />
        <span className="text-xs font-bold truncate">{label}</span>
        <span className="text-xs text-text-secondary dark:text-dark-text-secondary">{entries.length}</span>
      </div>

      {isExpanded && entries.map((entry) => <HistoryItem key={entry.id} entry={entry} />)}
    </>
  );
}
