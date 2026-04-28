import { test as base } from '@playwright/test';

type AuthFixtures = {
  adminToken: string;
  userToken: string;
  userId: string;
  adminId: string;
};

export const test = base.extend<AuthFixtures>({
  adminToken: async ({}, use) => {
    await use(process.env.ADMIN_TOKEN || '');
  },
  userToken: async ({}, use) => {
    await use(process.env.USER_TOKEN || '');
  },
  userId: async ({}, use) => {
    await use(process.env.USER_ID || '');
  },
  adminId: async ({}, use) => {
    await use(process.env.ADMIN_ID || '');
  },
});

export { expect } from '@playwright/test';
