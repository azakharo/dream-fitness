import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserRole,
  UserStatus,
} from '../../apps/auth-service/src/users/entities/user.entity';

/**
 * Seed script to populate database with initial data
 */
async function runSeed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    console.log('🌱 Starting seed...');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const testPasswordHash = await bcrypt.hash('test12345', 10);

    // Create admin user
    const adminUser = new User();
    adminUser.email = 'admin@dreamfitness.com';
    adminUser.password = adminPasswordHash;
    adminUser.name = 'Admin';
    adminUser.phone = null;
    adminUser.birthDate = null;
    adminUser.gender = null;
    adminUser.role = UserRole.ADMIN;
    adminUser.balance = 0;
    adminUser.status = UserStatus.ACTIVE;

    // Create test user
    const testUser = new User();
    testUser.email = 'test@example.com';
    testUser.password = testPasswordHash;
    testUser.name = 'Test User';
    testUser.phone = null;
    testUser.birthDate = null;
    testUser.gender = null;
    testUser.role = UserRole.CLIENT;
    testUser.balance = 0;
    testUser.status = UserStatus.ACTIVE;

    // Save users using repository
    const userRepository = dataSource.getRepository(User);
    await userRepository.save(adminUser);
    console.log('✅ Admin user created');

    await userRepository.save(testUser);
    console.log('✅ Test user created');

    console.log('🌱 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed
runSeed().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
