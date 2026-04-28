/* eslint-disable no-empty-pattern */
import { test as base } from '@playwright/test';

type TrainingFixtures = {
  trainerId: string;
  trainingId1: string; // capacity=1
  trainingId2: string; // capacity=10
};

export const trainingTest = base.extend<TrainingFixtures>({
  trainerId: async ({}, use) => {
    await use(process.env.TRAINER_ID || '');
  },
  trainingId1: async ({}, use) => {
    await use(process.env.TRAINING_ID_1 || '');
  },
  trainingId2: async ({}, use) => {
    await use(process.env.TRAINING_ID_2 || '');
  },
});
