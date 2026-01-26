import { test as base } from './mock-server';
import { v4 as uuidv4 } from 'uuid';

type TestDataFixtures = {
  testData: {
    generateRequest: () => {
      id: string;
      name: string;
      url: string;
      method: string;
      headers: string;
      body: string;
    };
    generateEnvironment: () => {
      id: string;
      name: string;
      variables: Array<{ key: string; value: string }>;
    };
    generateCollection: () => {
      id: string;
      name: string;
      requests: Array<{ id: string; name: string; url: string; method: string }>;
    };
  };
};

export const test = base.extend<TestDataFixtures>({
  // eslint-disable-next-line no-empty-pattern
  testData: async ({}, use) => {
    await use({
      generateRequest: () => ({
        id: uuidv4(),
        name: `Test Request ${Date.now()}`,
        url: 'http://localhost:3456/api/test',
        method: 'GET',
        headers: 'Content-Type: application/json',
        body: '{"test": true}',
      }),
      generateEnvironment: () => ({
        id: uuidv4(),
        name: `Test Environment ${Date.now()}`,
        variables: [
          { key: 'BASE_URL', value: 'http://localhost:3456' },
          { key: 'API_KEY', value: 'test-api-key' },
        ],
      }),
      generateCollection: () => ({
        id: uuidv4(),
        name: `Test Collection ${Date.now()}`,
        requests: [
          { id: uuidv4(), name: 'Get Users', url: '/api/users', method: 'GET' },
          { id: uuidv4(), name: 'Create User', url: '/api/users', method: 'POST' },
        ],
      }),
    });
  },
});

export { expect } from '@playwright/test';
