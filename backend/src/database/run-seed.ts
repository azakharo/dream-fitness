import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import * as bcrypt from 'bcrypt';
import { User } from '../../apps/auth-service/src/users/entities/user.entity';
import { UserRole, UserStatus } from '@app/shared';

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

    // Save users using repository (upsert to handle duplicates)
    const userRepository = dataSource.getRepository(User);

    // Check if admin user exists, if not create
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@dreamfitness.com' },
    });
    if (!existingAdmin) {
      await userRepository.save(adminUser);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists, skipping');
    }

    // Check if test user exists, if not create
    const existingTestUser = await userRepository.findOne({
      where: { email: 'test@example.com' },
    });
    if (!existingTestUser) {
      await userRepository.save(testUser);
      console.log('✅ Test user created');
    } else {
      console.log('ℹ️ Test user already exists, skipping');
    }

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
