import { Method } from 'axios';
import { useState } from 'react';
import { runDataDrivenTests, runPerformanceInsights, runSecurityTests } from '../tests';
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

  return {
    crudTests,
    currentTest,
    dataDrivenTests,
    isDataDrivenRunning,
    isPerformanceRunning,
    isSecurityRunning,
    performanceTests,
    securityTests,
    testCount,
    executeAllTests,
    executeDataDrivenTests,
    executeSecurityTests,
    executePerformanceTests,
    setPerformanceTests,
  };
};

export default useTests;
