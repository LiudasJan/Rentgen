import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestOptions, TestResult } from '../../types';

export interface TestResults {
  crudTests: TestResult[];
  dataDrivenTests: TestResult[];
  performanceTests: TestResult[];
  securityTests: TestResult[];
}

interface TestState extends TestResults {
  // Running states
  isDataDrivenRunning: boolean;
  isLargePayloadTestRunning: boolean;
  isLoadTestRunning: boolean;
  isPerformanceRunning: boolean;
  isSecurityRunning: boolean;

  // Progress tracking
  currentTest: number;
  testsCount: number;
  loadProgress: number;

  // Test configuration
  testOptions: TestOptions | null;

  // All results by collection/request id
  results: Record<string, TestResults>;
}

const initialState: TestState = {
  crudTests: [],
  dataDrivenTests: [],
  performanceTests: [],
  securityTests: [],
  isDataDrivenRunning: false,
  isLargePayloadTestRunning: false,
  isLoadTestRunning: false,
  isPerformanceRunning: false,
  isSecurityRunning: false,
  currentTest: 0,
  testsCount: 0,
  loadProgress: 0,
  testOptions: null,
  results: {},
};

export const testSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    setTestOptions: (state, action: PayloadAction<TestOptions | null>) => {
      state.testOptions = action.payload;
    },
    setTestsCount: (state, action: PayloadAction<number>) => {
      state.testsCount = action.payload;
    },
    incrementCurrentTest: (state) => {
      state.currentTest += 1;
    },
    setCurrentTest: (state, action: PayloadAction<number>) => {
      state.currentTest = action.payload;
    },

    // Security tests
    setSecurityRunning: (state, action: PayloadAction<boolean>) => {
      state.isSecurityRunning = action.payload;
    },
    setSecurityTests: (state, action: PayloadAction<TestResult[]>) => {
      state.securityTests = action.payload;
    },
    updateSecurityTest: (state, action: PayloadAction<{ testName: string; result: TestResult }>) => {
      const index = state.securityTests.findIndex((t) => t.name === action.payload.testName);
      if (index !== -1) {
        state.securityTests[index] = action.payload.result;
      }
    },

    // Data-driven tests
    setDataDrivenRunning: (state, action: PayloadAction<boolean>) => {
      state.isDataDrivenRunning = action.payload;
    },
    setDataDrivenTests: (state, action: PayloadAction<TestResult[]>) => {
      state.dataDrivenTests = action.payload;
    },

    // Performance tests
    setPerformanceRunning: (state, action: PayloadAction<boolean>) => {
      state.isPerformanceRunning = action.payload;
    },
    setPerformanceTests: (state, action: PayloadAction<TestResult[]>) => {
      state.performanceTests = action.payload;
    },
    updatePerformanceTest: (state, action: PayloadAction<{ testName: string; result: TestResult }>) => {
      const index = state.performanceTests.findIndex((t) => t.name === action.payload.testName);
      if (index !== -1) {
        state.performanceTests[index] = action.payload.result;
      }
    },

    // Load test specific
    setLoadTestRunning: (state, action: PayloadAction<boolean>) => {
      state.isLoadTestRunning = action.payload;
    },
    setLoadProgress: (state, action: PayloadAction<number>) => {
      state.loadProgress = action.payload;
    },

    // Large payload test
    setLargePayloadTestRunning: (state, action: PayloadAction<boolean>) => {
      state.isLargePayloadTestRunning = action.payload;
    },

    // CRUD tests
    setCrudTests: (state, action: PayloadAction<TestResult[]>) => {
      state.crudTests = action.payload;
    },

    // Reset
    resetTests: (state) => ({ ...initialState, results: state.results }),

    // Start all tests
    startAllTests: (state) => {
      state.isDataDrivenRunning = true;
      state.isPerformanceRunning = true;
      state.isSecurityRunning = true;
      state.crudTests = [];
      state.dataDrivenTests = [];
      state.performanceTests = [];
      state.securityTests = [];
      state.currentTest = 0;
      state.testsCount = 0;
    },

    addResults: (state, action: PayloadAction<{ requestId: string; results: TestResults }>) => {
      state.results[action.payload.requestId] = action.payload.results;
    },
  },
});

export const testActions = testSlice.actions;
export default testSlice.reducer;
