const TEST_ADMIN_USER_ID = 'bbc6cae7-3308-4ee8-8176-231c6b9965a3';

export class AuthHelper {
  /**
   * Returns headers for authentication with role 'admin'
   * Uses a default valid UUID if no userId is provided
   */
  getAdminHeaders(userId: string = TEST_ADMIN_USER_ID): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'admin',
    };
  }
}
