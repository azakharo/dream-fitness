export class AuthHelper {
  /**
   * Returns headers for authentication with role 'admin'
   */
  getAdminHeaders(userId: string): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'admin',
    };
  }

  /**
   * Returns headers for authentication with role 'client'
   */
  getClientHeaders(userId: string): Record<string, string> {
    return {
      'X-User-Id': userId,
      'X-User-Role': 'client',
    };
  }
}
