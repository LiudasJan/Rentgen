import { Method } from 'axios';
import { MouseEvent, useCallback } from 'react';
import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';
import { useReset } from '../../../hooks/useReset';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectIsComparingTestResults } from '../../../store/selectors';
import { historyActions } from '../../../store/slices/historySlice';
import { requestActions } from '../../../store/slices/requestSlice';
import { testActions } from '../../../store/slices/testSlice';
import { HistoryEntry } from '../../../types/history';
import MethodBadge from '../../MethodBadge';
import SearchHighlight from '../colletion/SearchHighlight';

interface Props {
  entry: HistoryEntry;
  searchTerm?: string;
}

export default function HistoryItem({ entry, searchTerm }: Props) {
  const dispatch = useAppDispatch();
  const reset = useReset();

  const isComparingTestResults = useAppSelector(selectIsComparingTestResults);

  const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const displayUrl = (() => {
    try {
      const parsed = new URL(entry.url);
      return parsed.pathname + parsed.search;
    } catch {
      return entry.url;
    }
  })();

  const handleClick = useCallback(() => {
    reset();

    dispatch(requestActions.setMethod(entry.method as Method));
    dispatch(requestActions.setUrl(entry.url));
    dispatch(requestActions.setHeaders(entry.headers));
    dispatch(requestActions.setBody(entry.body));

    if (isComparingTestResults) dispatch(testActions.clearResultsToCompare());
  }, [entry, isComparingTestResults, dispatch, reset]);

  return (
    <div
      className="group relative flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border hover:bg-button-secondary dark:hover:bg-dark-input cursor-pointer"
      onClick={handleClick}
    >
      <MethodBadge method={entry.method} />
      <span className="flex-1 text-xs truncate" title={entry.url}>
        {searchTerm ? <SearchHighlight text={displayUrl} term={searchTerm} /> : displayUrl}
      </span>
      <span className="text-xs text-text-secondary dark:text-dark-text-secondary shrink-0">{time}</span>
      <div className="absolute top-0 bottom-0 right-0 pl-2 pr-3 flex items-center bg-button-secondary dark:bg-dark-input opacity-0 group-hover:opacity-100">
        <ClearCrossIcon
          className="h-4.5 w-4.5 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer"
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            dispatch(historyActions.removeEntry(entry.id));
          }}
        />
      </div>
    </div>
  );
}
