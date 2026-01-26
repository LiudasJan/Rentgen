/**
 * Centralized test constants for E2E tests
 * Eliminates hardcoded test data and provides consistent naming
 */

export const TEST_CONSTANTS = {
  folders: {
    TEST_FOLDER_NAME: 'e2e-test-folder',
    RENAMED_FOLDER_NAME: 'e2e-renamed-folder',
    POKEMON_FOLDER_NAME: 'e2e-pokemon-tests',
  },
  environments: {
    generateUniqueName: (prefix = 'e2e-env') => `${prefix}-${Date.now()}`,
    TEST_ENV_NAME: 'e2e-test-environment',
  },
  payloads: {
    JSON_POST: { pokemon: 'pikachu', type: 'electric', level: 25 },
    JSON_PUT: { pokemon: 'bulbasaur', evolved: true },
    JSON_PATCH: { pokemon: 'squirtle', hp: 100 },
    FORM_DATA: 'pokemon=charizard&type=fire',
  },
  curlCommands: {
    SIMPLE_GET: (baseUrl: string) => `curl '${baseUrl}/api/users'`,
    GET_WITH_HEADERS: (baseUrl: string) =>
      `curl '${baseUrl}/api/echo' -H 'Accept: application/json' -H 'X-Pokemon: pikachu'`,
    POST_JSON: (baseUrl: string) =>
      `curl -X POST '${baseUrl}/api/users' -H 'Content-Type: application/json' -d '{"name":"test"}'`,
    POST_WITH_BODY: (baseUrl: string) =>
      `curl -X POST '${baseUrl}/api/echo' -H 'Content-Type: application/json' -d '{"pokemon":"charizard","level":50}'`,
    PUT_JSON: (baseUrl: string) =>
      `curl -X PUT '${baseUrl}/api/users/1' -H 'Content-Type: application/json' -d '{"pokemon":"mewtwo"}'`,
    GET_WITH_PARAMS: (baseUrl: string) => `curl '${baseUrl}/api/pokemon?limit=3&offset=0'`,
  },
  variables: {
    POKEMON_NAME: { key: 'pokemon_name', value: 'pikachu' },
    BASE_URL: { key: 'base_url', value: 'http://localhost:3456' },
    API_TOKEN: { key: 'api_token', value: 'test-token-123' },
  },
  timeouts: {
    RESPONSE_WAIT: 5000,
    ELEMENT_VISIBLE: 2000,
    MODAL_TIMEOUT: 800,
  },
} as const;

export const MOCK_ENDPOINTS = {
  // User endpoints
  USERS: '/api/users',
  USER_BY_ID: (id: number | string) => `/api/users/${id}`,

  // Echo endpoint
  ECHO: '/api/echo',

  // Pokemon-like endpoints (replaces external API)
  POKEMON: (name: string) => `/api/pokemon/${name}`,
  POKEMON_LIST: '/api/pokemon',
  POKEMON_TYPE: (type: string) => `/api/type/${type}`,
  POKEMON_ABILITY: (ability: string) => `/api/ability/${ability}`,

  // Error endpoints
  ERROR_400: '/api/error/400',
  ERROR_401: '/api/error/401',
  ERROR_403: '/api/error/403',
  ERROR_404: '/api/error/404',
  ERROR_500: '/api/error/500',
  ERROR_502: '/api/error/502',
  ERROR_503: '/api/error/503',
  STATUS: (code: number) => `/api/status/${code}`,

  // Security endpoints
  SECURE: '/api/secure',
  INSECURE: '/api/insecure',

  // Slow endpoint for timeout testing
  SLOW: '/api/slow',
} as const;
