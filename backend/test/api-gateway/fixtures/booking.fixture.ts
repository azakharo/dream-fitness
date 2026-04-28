/* eslint-disable no-empty-pattern */
import { test } from './auth.fixture';

export type BookingFixtures = {
  bookingId: string;
  user2Id: string;
  user2Token: string;
};

export const bookingTest = test.extend<BookingFixtures>({
  bookingId: async ({}, use) => {
    await use(process.env.BOOKING_ID || '');
  },
  user2Id: async ({}, use) => {
    await use(process.env.USER2_ID || '');
  },
  user2Token: async ({}, use) => {
    await use(process.env.USER2_TOKEN || '');
  },
});
