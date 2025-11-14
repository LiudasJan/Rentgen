import { useState } from 'react';
import { datasets } from '../constants/datasets';
import { LOAD_TEST_NAME, runDataDrivenTests, runLoadTest, runPerformanceInsights, runSecurityTests } from '../tests';
import { HttpRequest, TestResult } from '../types';
import { FieldType } from '../utils';

const useTests = (
  request: HttpRequest,
  fieldMappings: Record<string, FieldType>,
  queryMappings: Record<string, FieldType>,
  messageType: string,
  protoFile: File | null,
) => {
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

    await executeDataDrivenTests();
    await executePerformanceTests();
    await executeSecurityTests();
  }

  async function executeDataDrivenTests() {
    setIsDataDrivenRunning(true);
    setDataDrivenTests([]);
    setCurrentTest(0);
    setTestsCount(
      (prevTestsCount) =>
        prevTestsCount + 1 + getDataDrivenTestsCount(fieldMappings) + getDataDrivenTestsCount(queryMappings),
    );

    const dataDrivenTestResults = await runDataDrivenTests(
      request,
      fieldMappings,
      queryMappings,
      messageType,
      protoFile,
      setCurrentTest,
    );
    setDataDrivenTests(dataDrivenTestResults);

    setIsDataDrivenRunning(false);
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

    const loadTestResult = await runLoadTest(
      request,
      fieldMappings,
      messageType,
      protoFile,
      threadCount,
      requestCount,
      updateLoadProgress,
    );
    setPerformanceTests((prevPerformanceTests) => {
      return prevPerformanceTests.map((performanceTest) => {
        if (performanceTest.name === LOAD_TEST_NAME) return loadTestResult;

        return performanceTest;
      });
    });

    setIsLoadTestRunning(false);
  }

  async function executePerformanceTests() {
    const { url } = request;

    setIsPerformanceRunning(true);
    setPerformanceTests([]);

    const performanceTestResults = await runPerformanceInsights(url, dataDrivenTests);
    setPerformanceTests(performanceTestResults);

    setIsPerformanceRunning(false);
  }

  async function executeSecurityTests() {
    setIsSecurityRunning(true);
    setSecurityTests([]);
    setCrudTests([]);

    const { securityTestResults, crudTestResults } = await runSecurityTests(request);
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
    for (const [, dataType] of Object.entries(mappings)) {
      if (dataType === 'do-not-test') continue;
      if (dataType === 'random32' || dataType === 'randomInt' || dataType === 'randomEmail') {
        dataDrivenTestsCount += 1;
        continue;
      }

      dataDrivenTestsCount += (datasets[dataType] || []).length;
    }

    return dataDrivenTestsCount;
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
