import { useCallback } from 'react';
import { datasets } from '../constants/datasets';
import { getTestCount } from '../decorators';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCrudTests,
  selectCurrentTest,
  selectDataDrivenTests,
  selectDisabledSecurityTests,
  selectIsDataDrivenRunning,
  selectIsLargePayloadTestRunning,
  selectIsLoadTestRunning,
  selectIsPerformanceRunning,
  selectIsSecurityRunning,
  selectPerformanceTests,
  selectSecurityTests,
  selectSelectedRequestId,
  selectTestsCount,
  selectTestsTimestamp,
} from '../store/selectors';
import { testActions } from '../store/slices/testSlice';
import {
  DataDrivenTests,
  generateDynamicTestData,
  LARGE_PAYLOAD_TEST_NAME,
  LOAD_TEST_NAME,
  OPTIONS_METHOD_HANDLING_TEST_NAME,
  PerformanceInsights,
  runDataDrivenTests,
  runLargePayloadTest,
  runLoadTest,
  SecurityTests,
} from '../tests';
import { DynamicValue, TestOptions, TestResult } from '../types';

let abortAllTests = false;
let dataDrivenTestsInstance: DataDrivenTests | null = null;
let performanceInsightsInstance: PerformanceInsights | null = null;
let securityTestsInstance: SecurityTests | null = null;

const useTests = () => {
  const dispatch = useAppDispatch();

  const selectedRequestId = useAppSelector(selectSelectedRequestId);

  const currentTest = useAppSelector(selectCurrentTest);
  const testsCount = useAppSelector(selectTestsCount);
  const testsTimestamp = useAppSelector(selectTestsTimestamp);

  const crudTests = useAppSelector(selectCrudTests);
  const dataDrivenTests = useAppSelector(selectDataDrivenTests);
  const performanceTests = useAppSelector(selectPerformanceTests);
  const securityTests = useAppSelector(selectSecurityTests);

  const isDataDrivenRunning = useAppSelector(selectIsDataDrivenRunning);
  const isLargePayloadTestRunning = useAppSelector(selectIsLargePayloadTestRunning);
  const isLoadTestRunning = useAppSelector(selectIsLoadTestRunning);
  const isPerformanceRunning = useAppSelector(selectIsPerformanceRunning);
  const isSecurityRunning = useAppSelector(selectIsSecurityRunning);

  const disabledSecurityTests = useAppSelector(selectDisabledSecurityTests);

  const incrementCurrentTest = useCallback(() => {
    dispatch(testActions.incrementCurrentTest());
  }, [dispatch]);

  const calculateDataDrivenTestsCount = useCallback(async (options: TestOptions): Promise<number> => {
    let dataDrivenTestsCount = 0;

    await runDataDrivenTests(
      options,
      async () => {
        dataDrivenTestsCount += 1;
      },
      async (_, value: DynamicValue) => {
        dataDrivenTestsCount += [...generateDynamicTestData(value), ...(datasets[value.type] || [])].length;
      },
      async (_, value: DynamicValue) => {
        dataDrivenTestsCount += [...generateDynamicTestData(value), ...(datasets[value.type] || [])].length;
      },
    );

    return dataDrivenTestsCount;
  }, []);

  const executeSecurityTests = useCallback(
    async (options: TestOptions, execute = true): Promise<{ crudTests: TestResult[]; securityTests: TestResult[] }> => {
      if (!execute) return;

      dispatch(testActions.setSecurityRunning(true));
      dispatch(testActions.setSecurityTests([]));
      dispatch(testActions.setCrudTests([]));

      securityTestsInstance = new SecurityTests(options, disabledSecurityTests, incrementCurrentTest);
      const { crudTests, securityTests } = await securityTestsInstance.run();

      dispatch(testActions.setCrudTests(crudTests));
      dispatch(testActions.setSecurityTests(securityTests));
      dispatch(testActions.setSecurityRunning(false));

      return { crudTests, securityTests };
    },
    [disabledSecurityTests, dispatch, incrementCurrentTest],
  );

  const executeDataDrivenTests = useCallback(
    async (options: TestOptions, execute = true): Promise<TestResult[]> => {
      if (!execute) return;

      dispatch(testActions.setDataDrivenRunning(true));
      dispatch(testActions.setDataDrivenTests([]));

      dataDrivenTestsInstance = new DataDrivenTests(options, incrementCurrentTest);
      const dataDrivenTestResults = await dataDrivenTestsInstance.run();

      dispatch(testActions.setDataDrivenTests(dataDrivenTestResults));
      dispatch(testActions.setDataDrivenRunning(false));

      return dataDrivenTestResults;
    },
    [dispatch, incrementCurrentTest],
  );

  const executePerformanceTests = useCallback(
    async (options: TestOptions, testResults: TestResult[] = [], execute = true): Promise<TestResult[]> => {
      if (!execute) return;

      dispatch(testActions.setPerformanceRunning(true));
      dispatch(testActions.setPerformanceTests([]));

      performanceInsightsInstance = new PerformanceInsights(testResults, options, incrementCurrentTest);
      const performanceTestResults = await performanceInsightsInstance.run();

      dispatch(testActions.setPerformanceTests(performanceTestResults));
      dispatch(testActions.setPerformanceRunning(false));

      return performanceTestResults;
    },
    [dispatch, incrementCurrentTest],
  );

  const executeAllTests = useCallback(
    async (options: TestOptions) => {
      abortAllTests = false;

      dispatch(testActions.setOptions(options));
      dispatch(testActions.startAllTests());

      const count =
        (await calculateDataDrivenTestsCount(options)) +
        getTestCount(DataDrivenTests) +
        getTestCount(SecurityTests) +
        getTestCount(PerformanceInsights) -
        disabledSecurityTests.length +
        (disabledSecurityTests.includes(OPTIONS_METHOD_HANDLING_TEST_NAME) ? -1 : 0);
      const domain = new URL(options.url).hostname;
      const timestamp = new Date().getTime();

      dispatch(testActions.setCount(count));
      dispatch(testActions.setTimestamp(timestamp));

      const { crudTests, securityTests } = await executeSecurityTests(options, !abortAllTests);
      const dataDrivenTests = await executeDataDrivenTests(options, !abortAllTests);
      const performanceTests = await executePerformanceTests(options, dataDrivenTests, !abortAllTests);

      if (!abortAllTests && selectedRequestId)
        dispatch(
          testActions.addResults({
            requestId: selectedRequestId,
            results: {
              count,
              timestamp,
              crudTests,
              dataDrivenTests,
              performanceTests,
              securityTests,
              testOptions: options,
            },
          }),
        );
    },
    [
      disabledSecurityTests,
      selectedRequestId,
      dispatch,
      calculateDataDrivenTestsCount,
      executeSecurityTests,
      executeDataDrivenTests,
      executePerformanceTests,
    ],
  );

  const executeLargePayloadTest = useCallback(
    async (options: TestOptions, size: number) => {
      dispatch(testActions.setLargePayloadTestRunning(true));

      const largePayloadTest = await runLargePayloadTest(options, size);

      dispatch(
        testActions.updateSecurityTest({
          testName: LARGE_PAYLOAD_TEST_NAME,
          result: largePayloadTest,
        }),
      );
      dispatch(testActions.setLargePayloadTestRunning(false));

      if (selectedRequestId)
        dispatch(
          testActions.updateSecurityTestResults({
            requestId: selectedRequestId,
            testName: LARGE_PAYLOAD_TEST_NAME,
            result: largePayloadTest,
          }),
        );
    },
    [selectedRequestId, dispatch],
  );

  const cancelAllTests = useCallback(() => {
    abortAllTests = true;

    securityTestsInstance?.abort();
    dataDrivenTestsInstance?.abort();
    performanceInsightsInstance?.abort();

    dispatch(testActions.resetTests());
  }, [dispatch]);

  const generateLoadBarProgress = (percent: number) => {
    const width = 20;
    const filled = Math.round((percent / 100) * width);
    return '▓'.repeat(filled) + '░'.repeat(width - filled) + ` ${percent}%`;
  };

  const formatLoadTestProgress = (loadBar: string, sentRequestCount: number, requestCount: number): string => {
    return `${loadBar} (${sentRequestCount}/${requestCount})`;
  };

  const executeLoadTest = useCallback(
    async (options: TestOptions, threadCount: number, requestCount: number) => {
      dispatch(testActions.setLoadTestRunning(true));
      dispatch(testActions.setLoadProgress(0));

      // Update initial progress display
      dispatch(
        testActions.updatePerformanceTest({
          testName: LOAD_TEST_NAME,
          result: {
            name: LOAD_TEST_NAME,
            status: performanceTests.find((t) => t.name === LOAD_TEST_NAME)?.status || 'info',
            expected: '',
            actual: formatLoadTestProgress(generateLoadBarProgress(0), 0, requestCount),
          } as TestResult,
        }),
      );

      let lastPercent = 0;
      const updateLoadProgress = (sentRequestCount: number, totalRequestCount: number) => {
        const percent = Math.floor((sentRequestCount / totalRequestCount) * 100);
        if (percent !== lastPercent) {
          lastPercent = percent;
          dispatch(testActions.setLoadProgress(percent));
          dispatch(
            testActions.updatePerformanceTest({
              testName: LOAD_TEST_NAME,
              result: {
                name: LOAD_TEST_NAME,
                status: performanceTests.find((t) => t.name === LOAD_TEST_NAME)?.status || 'info',
                expected: '',
                actual: formatLoadTestProgress(generateLoadBarProgress(percent), sentRequestCount, totalRequestCount),
              } as TestResult,
            }),
          );
        }
      };

      const loadTestResult = await runLoadTest(options, threadCount, requestCount, updateLoadProgress);

      dispatch(
        testActions.updatePerformanceTest({
          testName: LOAD_TEST_NAME,
          result: loadTestResult,
        }),
      );
      dispatch(testActions.setLoadTestRunning(false));

      if (selectedRequestId)
        dispatch(
          testActions.updatePerformanceTestResults({
            requestId: selectedRequestId,
            testName: LOAD_TEST_NAME,
            result: loadTestResult,
          }),
        );
    },
    [performanceTests, selectedRequestId, dispatch],
  );

  return {
    crudTests,
    currentTest,
    dataDrivenTests,
    isDataDrivenRunning,
    isLargePayloadTestRunning,
    isLoadTestRunning,
    isPerformanceRunning,
    isSecurityRunning,
    performanceTests,
    securityTests,
    testsCount,
    testsTimestamp,
    cancelAllTests,
    executeAllTests,
    executeDataDrivenTests,
    executeLargePayloadTest,
    executeLoadTest,
    executeSecurityTests,
    executePerformanceTests,
  };
};

export default useTests;
