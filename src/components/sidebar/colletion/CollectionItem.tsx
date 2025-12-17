import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Method } from 'axios';
import cn from 'classnames';
import { useCallback } from 'react';
import { useCollectionRunner } from '../../../hooks/useCollectionRunner';
import { useReset } from '../../../hooks/useReset';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectCollectionData,
  selectCollectionRunResults,
  selectRunningRequestId,
  selectSelectedRequestId,
} from '../../../store/selectors';
import { collectionActions } from '../../../store/slices/collectionSlice';
import { requestActions } from '../../../store/slices/requestSlice';
import { responseActions } from '../../../store/slices/responseSlice';
import {
  findFolderIdByRequestId,
  findRequestById,
  headersRecordToString,
  postmanHeadersToRecord,
  SidebarItemData,
} from '../../../utils/collection';
import MethodBadge from '../../MethodBadge';

import ClearCrossIcon from '../../../assets/icons/clear-cross-icon.svg';
import PlayIcon from '../../../assets/icons/play-icon.svg';

interface Props {
  item: SidebarItemData;
}

export default function CollectionItem({ item }: Props) {
  const dispatch = useAppDispatch();
  const { runRequest } = useCollectionRunner();
  const reset = useReset();

  const collection = useAppSelector(selectCollectionData);
  const runningRequestId = useAppSelector(selectRunningRequestId);
  const runResults = useAppSelector(selectCollectionRunResults);
  const selectedId = useAppSelector(selectSelectedRequestId);

  const runResult = runResults[item.id] || null;
  const isSelected = item.id === selectedId;
  const { attributes, isDragging, listeners, transform, transition, setNodeRef } = useSortable({
    id: item.id,
    data: { type: 'item', folderId: item.folderId },
  });

  const handleClick = useCallback(
    (id: string) => {
      if (isSelected || isDragging) return;

      const item = findRequestById(collection, id);
      if (!item) return;

      reset(false);
      dispatch(collectionActions.selectRequest(id));

      const folderId = findFolderIdByRequestId(collection, id);
      if (folderId) dispatch(collectionActions.selectFolder(folderId));

      if (runResult?.response) {
        dispatch(responseActions.setResponse(runResult.response));
        dispatch(requestActions.setBodyParameters(runResult.bodyParameters || {}));
        dispatch(requestActions.setQueryParameters(runResult.queryParameters || {}));
      }

      const { request } = item;
      const isWssUrl = request.url.startsWith('ws://') || request.url.startsWith('wss://');
      dispatch(requestActions.setMode(isWssUrl ? 'WSS' : 'HTTP'));
      dispatch(requestActions.setMethod(request.method as Method));
      dispatch(requestActions.setUrl(request.url));
      dispatch(requestActions.setHeaders(headersRecordToString(postmanHeadersToRecord(request.header))));
      dispatch(requestActions.setBody(request.body?.raw || '{}'));
    },
    [collection, isDragging, isSelected, runResult, dispatch, reset],
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 border-b border-border dark:border-dark-border hover:bg-button-secondary dark:hover:bg-dark-input',
        'group cursor-pointer outline-none',
        {
          'bg-button-secondary dark:bg-dark-input': isSelected,
          'opacity-50 shadow-lg z-50': isDragging,
        },
      )}
      onClick={() => handleClick(item.id)}
      {...attributes}
      {...listeners}
    >
      {runResult && (
        <span
          className={cn('w-2 h-2 rounded-full shrink-0', {
            'bg-green-500': runResult.status >= 200 && runResult.status < 400,
            'bg-orange-500': runResult.status >= 400 && runResult.status < 500,
            'bg-red-500': !runResult.status || runResult.status < 200 || runResult.status >= 500,
          })}
        />
      )}
      <MethodBadge method={item.method} />
      <span className="flex-1 text-xs truncate" title={item.url}>
        {item.url}
      </span>
      <div className="absolute top-0 bottom-0 right-0 pl-2 pr-3 flex items-center gap-2 bg-button-secondary dark:bg-dark-input opacity-0 group-hover:opacity-100">
        <PlayIcon
          className={cn('h-4 w-4 text-green-500 hover:text-green-600 transition-opacity', {
            'cursor-pointer': runningRequestId !== item.id,
            'opacity-50 cursor-not-allowed': runningRequestId === item.id,
          })}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();

            if (runningRequestId === item.id) return;
            runRequest(item.id);
          }}
        />
        <ClearCrossIcon
          className="h-4.5 w-4.5 text-button-text-secondary dark:text-text-secondary hover:text-button-danger cursor-pointer"
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            dispatch(collectionActions.removeRequest(item.id));
          }}
        />
      </div>
    </div>
  );
}
