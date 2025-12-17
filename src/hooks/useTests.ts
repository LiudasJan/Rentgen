import { useCallback } from 'react';
import { datasets } from '../constants/datasets';
import { getTestCount } from '../decorators';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCrudTests,
  selectCurrentTest,
  selectDataDrivenTests,
  selectIsDataDrivenRunning,
  selectIsLargePayloadTestRunning,
  selectIsLoadTestRunning,
  selectIsPerformanceRunning,
  selectIsSecurityRunning,
  selectPerformanceTests,
  selectSecurityTests,
  selectTestOptions,
  selectTestsCount,
} from '../store/selectors';
import { testActions } from '../store/slices/testSlice';
import {
  DataDrivenTests,
  generateDynamicTestData,
  LARGE_PAYLOAD_TEST_NAME,
  LOAD_TEST_NAME,
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

  const testOptions = useAppSelector(selectTestOptions);
  const currentTest = useAppSelector(selectCurrentTest);
  const testsCount = useAppSelector(selectTestsCount);

  const crudTests = useAppSelector(selectCrudTests);
  const dataDrivenTests = useAppSelector(selectDataDrivenTests);
  const performanceTests = useAppSelector(selectPerformanceTests);
  const securityTests = useAppSelector(selectSecurityTests);

  const isDataDrivenRunning = useAppSelector(selectIsDataDrivenRunning);
  const isLargePayloadTestRunning = useAppSelector(selectIsLargePayloadTestRunning);
  const isLoadTestRunning = useAppSelector(selectIsLoadTestRunning);
  const isPerformanceRunning = useAppSelector(selectIsPerformanceRunning);
  const isSecurityRunning = useAppSelector(selectIsSecurityRunning);

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
    async (options: TestOptions, execute = true) => {
      if (!execute) return;

      dispatch(testActions.setSecurityRunning(true));
      dispatch(testActions.setSecurityTests([]));
      dispatch(testActions.setCrudTests([]));

      securityTestsInstance = new SecurityTests(options, incrementCurrentTest);
      const { securityTestResults, crudTestResults } = await securityTestsInstance.run();

      dispatch(testActions.setSecurityTests(securityTestResults));
      dispatch(testActions.setCrudTests(crudTestResults));
      dispatch(testActions.setSecurityRunning(false));
    },
    [dispatch, incrementCurrentTest],
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
    async (options: TestOptions, testResults: TestResult[] = [], execute = true) => {
      if (!execute) return;

      const { url } = options;

      dispatch(testActions.setPerformanceRunning(true));
      dispatch(testActions.setPerformanceTests([]));

      performanceInsightsInstance = new PerformanceInsights(url, testResults, incrementCurrentTest);
      const performanceTestResults = await performanceInsightsInstance.run();

      dispatch(testActions.setPerformanceTests(performanceTestResults));
      dispatch(testActions.setPerformanceRunning(false));
    },
    [dispatch, incrementCurrentTest],
  );

  const executeAllTests = useCallback(async () => {
    if (!testOptions) return;

    abortAllTests = false;
    dispatch(testActions.startAllTests());

    const totalTests =
      (await calculateDataDrivenTestsCount(testOptions)) +
      getTestCount(DataDrivenTests) +
      getTestCount(SecurityTests) +
      getTestCount(PerformanceInsights);

    dispatch(testActions.setTestsCount(totalTests));

    await executeSecurityTests(testOptions, !abortAllTests);
    const dataDrivenTestResults = await executeDataDrivenTests(testOptions, !abortAllTests);
    await executePerformanceTests(testOptions, dataDrivenTestResults, !abortAllTests);
  }, [
    testOptions,
    dispatch,
    calculateDataDrivenTestsCount,
    executeSecurityTests,
    executeDataDrivenTests,
    executePerformanceTests,
  ]);

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
    },
    [dispatch],
  );

  const cancelAllTests = useCallback(() => {
    abortAllTests = true;

    securityTestsInstance?.abort();
    dataDrivenTestsInstance?.abort();
    performanceInsightsInstance?.abort();

    dispatch(testActions.resetAllTestState());
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
    },
    [dispatch, performanceTests],
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
