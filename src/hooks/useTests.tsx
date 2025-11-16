import { useState } from 'react';
import { datasets } from '../constants/datasets';
import {
  LOAD_TEST_NAME,
  runDataDrivenTests,
  runLoadTest,
  runPerformanceInsights,
  runSecurityTests,
  shouldSkipFieldType,
} from '../tests';
import { FieldType, TestOptions, TestResult } from '../types';

const useTests = (options: TestOptions) => {
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [testsCount, setTestsCount] = useState<number>(0);

  const [crudTests, setCrudTests] = useState<TestResult[]>([]);

  const [dataDrivenTests, setDataDrivenTests] = useState<TestResult[]>([]);
  const [isDataDrivenRunning, setIsDataDrivenRunning] = useState<boolean>(false);

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

    const dataDrivenTestResults = await executeDataDrivenTests();
    await executePerformanceTests(dataDrivenTestResults);
    await executeSecurityTests();
  }

  async function executeDataDrivenTests(): Promise<TestResult[]> {
    const { bodyMappings, queryMappings } = options;

    setIsDataDrivenRunning(true);
    setDataDrivenTests([]);
    setCurrentTest(0);
    setTestsCount(
      (prevTestsCount) =>
        prevTestsCount + 1 + getDataDrivenTestsCount(bodyMappings) + getDataDrivenTestsCount(queryMappings),
    );

    const dataDrivenTestResults = await runDataDrivenTests(options, incrementCurrentTest);
    setDataDrivenTests(dataDrivenTestResults);
    setIsDataDrivenRunning(false);

    return dataDrivenTestResults;
  }

  async function executeLoadTest(threadCount: number, requestCount: number) {
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

    const performanceTestResults = await runPerformanceInsights(url, testResults);
    setPerformanceTests(performanceTestResults);
    setIsPerformanceRunning(false);
  }

  async function executeSecurityTests() {
    setIsSecurityRunning(true);
    setSecurityTests([]);
    setCrudTests([]);

    const { securityTestResults, crudTestResults } = await runSecurityTests(options);
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

  function getDataDrivenTestsCount(mappings: Record<string, FieldType>): number {
    let dataDrivenTestsCount = 0;
    for (const [, fieldType] of Object.entries(mappings)) {
      if (shouldSkipFieldType(fieldType)) continue;

      dataDrivenTestsCount += (datasets[fieldType] || []).length;
    }

    return dataDrivenTestsCount;
  }

  function incrementCurrentTest() {
    setCurrentTest((prevCurrentTest) => prevCurrentTest + 1);
  }

  return {
    crudTests,
    currentTest,
    dataDrivenTests,
    isDataDrivenRunning,
    isLoadTestRunning,
    isPerformanceRunning,
    isSecurityRunning,
    performanceTests,
    securityTests,
    testsCount,
    executeAllTests,
    executeLoadTest,
    executeDataDrivenTests,
    executeSecurityTests,
    executePerformanceTests,
    setPerformanceTests,
  };
};

export default useTests;
