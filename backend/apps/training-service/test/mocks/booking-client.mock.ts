export const mockBookingClientService = {
  getBookingCount: jest
    .fn()
    .mockResolvedValue({ confirmedCount: 0, waitlistCount: 0 }),
};
