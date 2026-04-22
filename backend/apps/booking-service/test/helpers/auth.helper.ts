export class AuthHelper {
  /**
   * Returns headers for authentication with role 'user'
   */
  getUserHeaders(userId: string): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'user',
    };
  }

  /**
   * Returns headers for authentication with role 'admin'
   */
  getAdminHeaders(userId: string): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'admin',
    };
  }
}
