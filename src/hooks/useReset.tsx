import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { collectionActions } from '../store/slices/collectionSlice';
import { requestActions } from '../store/slices/requestSlice';
import { responseActions } from '../store/slices/responseSlice';
import { testActions } from '../store/slices/testSlice';
import { websocketActions } from '../store/slices/websocketSlice';
import useTests from './useTests';

export function useReset() {
  const dispatch = useAppDispatch();
  const { cancelAllTests } = useTests();

  const reset = useCallback(
    (clearSelection = true) => {
      cancelAllTests();
      dispatch(requestActions.resetRequest());
      dispatch(responseActions.clearResponse());
      dispatch(websocketActions.clearMessages());
      dispatch(websocketActions.setConnected(false));
      dispatch(testActions.setOptions(null));
      if (clearSelection) dispatch(collectionActions.selectRequest(null));
    },
    [dispatch],
  );

  return reset;
}
