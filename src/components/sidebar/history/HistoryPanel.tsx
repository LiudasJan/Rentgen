import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectHistoryEntries } from '../../../store/selectors';
import { historyActions } from '../../../store/slices/historySlice';
import { HistoryEntry } from '../../../types/history';
import HistoryDateGroup from './HistoryDateGroup';

import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';

interface DateGroup {
  label: string;
  date: string;
  entries: HistoryEntry[];
}

function groupHistoryByDate(entries: HistoryEntry[]): DateGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86_400_000;

  const groups = new Map<string, { label: string; entries: HistoryEntry[] }>();

  for (const entry of entries) {
    const entryDate = new Date(entry.timestamp);
    const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()).getTime();

    let key: string;
    let label: string;

    if (entryDay === today) {
      key = 'today';
      label = 'Today';
    } else if (entryDay === yesterday) {
      key = 'yesterday';
      label = 'Yesterday';
    } else {
      key = String(entryDay);
      label = entryDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
    }

    const existing = groups.get(key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.set(key, { label, entries: [entry] });
    }
  }

  return Array.from(groups.entries()).map(([date, { label, entries: groupEntries }]) => ({
    label,
    date,
    entries: groupEntries,
  }));
}

export default function HistoryPanel() {
  const dispatch = useAppDispatch();
  const entries = useAppSelector(selectHistoryEntries);

  const groups = useMemo(() => groupHistoryByDate(entries), [entries]);

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border dark:border-dark-border gap-2">
        <span className="text-xs text-text-secondary dark:text-dark-text-secondary">History</span>
        {entries.length > 0 && (
          <ClearCrossIcon
            className="w-4 h-4 text-text-secondary dark:text-dark-text-secondary hover:text-button-danger cursor-pointer transition-colors"
            onClick={() => dispatch(historyActions.clearHistory())}
            title="Clear All"
          />
        )}
      </div>

      {groups.length > 0 ? (
        <div className="h-full overflow-x-hidden overflow-y-auto">
          {groups.map((group) => (
            <HistoryDateGroup key={group.date} label={group.label} entries={group.entries} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full w-full p-5 text-xs text-text-secondary dark:text-dark-text-secondary">
          No history yet
        </div>
      )}
    </>
  );
}
