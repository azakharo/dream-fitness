import { defineConfig } from '@playwright/test';
import { TEST_CONFIG } from './test-config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [['html'], ['list']],
  use: {
    baseURL: TEST_CONFIG.baseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
