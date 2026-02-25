import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectIsComparingTestResults } from '../store/selectors';
import { collectionActions } from '../store/slices/collectionSlice';
import { requestActions } from '../store/slices/requestSlice';
import { responseActions } from '../store/slices/responseSlice';
import { testActions } from '../store/slices/testSlice';
import { websocketActions } from '../store/slices/websocketSlice';
import useTests from './useTests';

export function useReset() {
  const dispatch = useAppDispatch();
  const { cancelAllTests } = useTests();

  const isComparingTestResults = useAppSelector(selectIsComparingTestResults);

  const reset = useCallback(
    (clearSelection = true) => {
      if (isComparingTestResults) dispatch(testActions.clearResultsToCompare());

      cancelAllTests();
      dispatch(requestActions.resetRequest());
      dispatch(responseActions.clearResponse());
      dispatch(websocketActions.clearMessages());
      dispatch(websocketActions.setConnected(false));

      if (clearSelection) dispatch(collectionActions.selectRequest(null));
    },
    [isComparingTestResults, dispatch],
  );

  return reset;
}
