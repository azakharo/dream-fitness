import { TrainingClientService } from '../../src/clients/training-client.service';

export const mockTrainingClientService = {
  getTraining: jest.fn(),
  getAvailability: jest.fn(),
};

export class MockTrainingClientService {
  static overrideFrom = TrainingClientService;
}
