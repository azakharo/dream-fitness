import { test as base } from '@playwright/test';

type AuthFixtures = {
  adminToken: string;
  userToken: string;
  userId: string;
  adminId: string;
};

export const test = base.extend<AuthFixtures>({
  adminToken: async (_, use) => {
    await use(process.env.ADMIN_TOKEN || '');
  },
  userToken: async (_, use) => {
    await use(process.env.TEST_USER_TOKEN || '');
  },
  userId: async (_, use) => {
    await use(process.env.TEST_USER_ID || '');
  },
  adminId: async (_, use) => {
    await use(process.env.ADMIN_USER_ID || '');
  },
});

export { expect } from '@playwright/test';
