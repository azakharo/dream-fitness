/**
 * Global teardown for API Gateway Playwright tests.
 * Cleans up any test data created during tests.
 */

export default async function globalTeardown() {
  // Clean up test data by clearing environment variables
  // Note: Actual cleanup of created entities would require additional API calls
  // to delete trainers, trainings, and bookings if needed.

  const testDataIds = [
    "ADMIN_TOKEN",
    "ADMIN_USER_ID",
    "TEST_USER_TOKEN",
    "TEST_USER_ID",
    "TRAINER_ID",
    "TRAINING_1_ID",
    "TRAINING_2_ID",
    "TEST_USER_BALANCE",
  ];

  // Clear all test data environment variables
  testDataIds.forEach((key) => {
    delete process.env[key];
  });

  console.log("Global teardown completed successfully");
}
