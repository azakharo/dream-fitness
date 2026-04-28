import { test as base } from '@playwright/test';

type BookingFixtures = {
  bookingId: string;
  user2Id: string;
  user2Token: string;
};

export const bookingTest = base.extend<BookingFixtures>({
  bookingId: async (_, use) => {
    await use(process.env.BOOKING_ID || '');
  },
  user2Id: async (_, use) => {
    await use(process.env.USER2_ID || '');
  },
  user2Token: async (_, use) => {
    await use(process.env.USER2_TOKEN || '');
  },
});
