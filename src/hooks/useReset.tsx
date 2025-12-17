import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { collectionActions } from '../store/slices/collectionSlice';
import { requestActions } from '../store/slices/requestSlice';
import { responseActions } from '../store/slices/responseSlice';
import { testActions } from '../store/slices/testSlice';
import { websocketActions } from '../store/slices/websocketSlice';

export function useReset() {
  const dispatch = useAppDispatch();

  const reset = useCallback(
    (clearSelection = true) => {
      dispatch(requestActions.resetRequest());
      dispatch(responseActions.clearResponse());
      dispatch(websocketActions.clearMessages());
      dispatch(websocketActions.setConnected(false));
      dispatch(testActions.setTestOptions(null));
      if (clearSelection) dispatch(collectionActions.selectRequest(null));
    },
    [dispatch],
  );

  return reset;
}
