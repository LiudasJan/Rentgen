import { Method } from 'axios';
import { useState } from 'react';
import { runDataDrivenTests, runLoadTest, runPerformanceInsights, runSecurityTests } from '../tests';
import { Test } from '../types';

const useTests = (
  method: Method,
  url: string,
  headers: Record<string, string>,
  body: string,
  fieldMappings: Record<string, string>,
  queryMappings: Record<string, string>,
  messageType: string,
  protoFile: File | null,
) => {
  const [currentTest, setCurrentTest] = useState<number>(0);
  const [testCount, setTestCount] = useState<number>(0);

  const [crudTests, setCrudTests] = useState<Test[]>([]);

  const [dataDrivenTests, setDataDrivenTests] = useState<Test[]>([]);
  const [isDataDrivenRunning, setIsDataDrivenRunning] = useState<boolean>(false);

  const [isLoadTestRunning, setIsLoadTestRunning] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);

  const [performanceTests, setPerformanceTests] = useState<Test[]>([]);
  const [isPerformanceRunning, setIsPerformanceRunning] = useState<boolean>(false);

  const [securityTests, setSecurityTests] = useState<Test[]>([]);
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

    const dataDrivenTestResults = await runDataDrivenTests(
      method,
      url,
      headers,
      body,
      fieldMappings,
      queryMappings,
      messageType,
      protoFile,
      setCurrentTest,
      setTestCount,
    );
    setDataDrivenTests(dataDrivenTestResults);

    setIsDataDrivenRunning(false);
  }

  async function executeLoadTest(threadCount: number, requestCount: number) {
    setIsLoadTestRunning(true);
    setLoadProgress(0);

    const initialLoadBar = generateLoadBarProgress(0);

    setPerformanceTests((prevPerformanceTests) => {
      return prevPerformanceTests.map((performanceTest) => {
        if (performanceTest.name === 'Load test')
          return {
            ...performanceTest,
            actual: `⏳ ${initialLoadBar} (0/${requestCount})`,
          };

        return performanceTest;
      });
    });

    const loadTestResult = await runLoadTest(
      method,
      url,
      headers,
      body,
      fieldMappings,
      messageType,
      protoFile,
      threadCount,
      requestCount,
      maybeUpdateProgressUI,
    );
    setPerformanceTests((prevPerformanceTests) => {
      return prevPerformanceTests.map((performanceTest) => {
        if (performanceTest.name === 'Load test') return loadTestResult;

        return performanceTest;
      });
    });

    setIsLoadTestRunning(false);
  }

  async function executePerformanceTests() {
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

    const { securityTestResults, crudTestResults } = await runSecurityTests(method, url, headers, body);
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
    setTestCount(0);
  }

  function generateLoadBarProgress(percent: number) {
    const width = 20;
    const filled = Math.round((percent / 100) * width);

    return '█'.repeat(filled) + '░'.repeat(width - filled) + ` ${percent}%`;
  }

  function maybeUpdateProgressUI(sentCount: number, loadRequestCount: number) {
    const pct = Math.floor((sentCount / loadRequestCount) * 100);
    if (pct !== loadProgress) {
      const bar = generateLoadBarProgress(pct);
      setLoadProgress(pct);

      setPerformanceTests((prevPerformanceTests) => {
        return prevPerformanceTests.map((performanceTest) => {
          if (performanceTest.name === 'Load test')
            return {
              ...performanceTest,
              actual: `⏳ ${bar} (${sentCount}/${loadRequestCount})`,
            };

          return performanceTest;
        });
      });
    }
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
    testCount,
    executeAllTests,
    executeLoadTest,
    executeDataDrivenTests,
    executeSecurityTests,
    executePerformanceTests,
    setPerformanceTests,
  };
};

export default useTests;
