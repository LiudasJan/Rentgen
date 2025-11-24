import { useState } from 'react';
import { datasets } from '../constants/datasets';
import { getTestCount } from '../decorators';
import {
  DataDrivenTests,
  LARGE_PAYLOAD_TEST_NAME,
  LOAD_TEST_NAME,
  PerformanceInsights,
  runDataDrivenTests,
  runLargePayloadTest,
  runLoadTest,
  SecurityTests,
} from '../tests';
import { FieldType, TestOptions, TestResult } from '../types';

const useTests = (options: TestOptions) => {
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [testsCount, setTestsCount] = useState<number>(0);

  const [crudTests, setCrudTests] = useState<TestResult[]>([]);

  const [dataDrivenTests, setDataDrivenTests] = useState<TestResult[]>([]);
  const [isDataDrivenRunning, setIsDataDrivenRunning] = useState<boolean>(false);

  const [isLargePayloadTestRunning, setIsLargePayloadTestRunning] = useState<boolean>(false);

  const [isLoadTestRunning, setIsLoadTestRunning] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  const [performanceTests, setPerformanceTests] = useState<TestResult[]>([]);
  const [isPerformanceRunning, setIsPerformanceRunning] = useState<boolean>(false);

  const [securityTests, setSecurityTests] = useState<TestResult[]>([]);
  const [isSecurityRunning, setIsSecurityRunning] = useState<boolean>(false);

  async function executeAllTests() {
    setIsDataDrivenRunning(true);
    setIsPerformanceRunning(true);
    setIsSecurityRunning(true);
    resetTests();

    setTestsCount(
      (await calculateDataDrivenTestsCount()) +
        getTestCount(DataDrivenTests) +
        getTestCount(SecurityTests) +
        getTestCount(PerformanceInsights),
    );

    await executeSecurityTests();
    const dataDrivenTestResults = await executeDataDrivenTests();
    await executePerformanceTests(dataDrivenTestResults);
  }

  async function executeDataDrivenTests(): Promise<TestResult[]> {
    setIsDataDrivenRunning(true);
    setDataDrivenTests([]);

    const dataDrivenTests = new DataDrivenTests(options, incrementCurrentTest);
    const dataDrivenTestResults = await dataDrivenTests.run();

    setDataDrivenTests(dataDrivenTestResults);
    setIsDataDrivenRunning(false);

    return dataDrivenTestResults;
  }

  async function executeLargePayloadTest(options: TestOptions, size: number) {
    setIsLargePayloadTestRunning(true);

    const largePayloadTest = await runLargePayloadTest(options, size);

    setSecurityTests((prevSecurityTests) => {
      return prevSecurityTests.map((prevSecurityTest) => {
        if (prevSecurityTest.name === LARGE_PAYLOAD_TEST_NAME) return largePayloadTest;

        return prevSecurityTest;
      });
    });
    setIsLargePayloadTestRunning(false);
  }

  async function executeLoadTest(options: TestOptions, threadCount: number, requestCount: number) {
    setIsLoadTestRunning(true);
    setLoadProgress(0);
    setPerformanceTests((prevPerformanceTests) => {
      return prevPerformanceTests.map((performanceTest) => {
        if (performanceTest.name === LOAD_TEST_NAME)
          return {
            ...performanceTest,
            actual: formatLoadTestProgress(generateLoadBarProgress(0), 0, requestCount),
          };

        return performanceTest;
      });
    });

    const loadTestResult = await runLoadTest(options, threadCount, requestCount, updateLoadProgress);

    setPerformanceTests((prevPerformanceTests) => {
      return prevPerformanceTests.map((performanceTest) => {
        if (performanceTest.name === LOAD_TEST_NAME) return loadTestResult;

        return performanceTest;
      });
    });
    setIsLoadTestRunning(false);
  }

  async function executePerformanceTests(testResults: TestResult[] = []) {
    const { url } = options;

    setIsPerformanceRunning(true);
    setPerformanceTests([]);

    const performanceInsights = new PerformanceInsights(url, testResults, incrementCurrentTest);
    const performanceTestResults = await performanceInsights.run();

    setPerformanceTests(performanceTestResults);
    setIsPerformanceRunning(false);
  }

  async function executeSecurityTests() {
    setIsSecurityRunning(true);
    setSecurityTests([]);
    setCrudTests([]);

    const securityTests = new SecurityTests(options, incrementCurrentTest);
    const { securityTestResults, crudTestResults } = await securityTests.run();

    setSecurityTests(securityTestResults);
    setCrudTests(crudTestResults);
    setIsSecurityRunning(false);
  }

  function resetTests() {
    setCrudTests([]);
    setDataDrivenTests([]);
    setPerformanceTests([]);
    setSecurityTests([]);
    setCurrentTest(0);
    setTestsCount(0);
  }

  function updateLoadProgress(setRequestCount: number, requestCount: number) {
    const percent = Math.floor((setRequestCount / requestCount) * 100);
    if (percent !== loadProgress) {
      setLoadProgress(percent);
      setPerformanceTests((prevPerformanceTests) => {
        return prevPerformanceTests.map((performanceTest) => {
          if (performanceTest.name === LOAD_TEST_NAME)
            return {
              ...performanceTest,
              actual: formatLoadTestProgress(generateLoadBarProgress(percent), setRequestCount, requestCount),
            };

          return performanceTest;
        });
      });
    }
  }

  function generateLoadBarProgress(percent: number) {
    const width = 20;
    const filled = Math.round((percent / 100) * width);

    return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${percent}%`;
  }

  function formatLoadTestProgress(loadBar: string, setRequestCount: number, requestCount: number): string {
    return `${loadBar} (${setRequestCount}/${requestCount})`;
  }

  function incrementCurrentTest() {
    setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
  }

  async function calculateDataDrivenTestsCount(): Promise<number> {
    let dataDrivenTestsCount = 0;

    await runDataDrivenTests(
      options,
      async () => {
        dataDrivenTestsCount += 1;
      },
      async (_, type: FieldType) => {
        dataDrivenTestsCount += (datasets[type] || []).length;
      },
      async (_, type: FieldType) => {
        dataDrivenTestsCount += (datasets[type] || []).length;
      },
    );

    return dataDrivenTestsCount;
  }

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
    executeAllTests,
    executeDataDrivenTests,
    executeLargePayloadTest,
    executeLoadTest,
    executeSecurityTests,
    executePerformanceTests,
    setPerformanceTests,
  };
};

export default useTests;
