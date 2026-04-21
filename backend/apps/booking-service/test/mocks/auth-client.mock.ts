import { AuthClientService } from '../../src/clients/auth-client.service';

export const mockAuthClientService = {
  reservePoints: jest.fn(),
  releasePoints: jest.fn(),
  refundPoints: jest.fn(),
  getUserEmail: jest.fn().mockResolvedValue('test@example.com'),
};

export class MockAuthClientService {
  static overrideFrom = AuthClientService;
}
