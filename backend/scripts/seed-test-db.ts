import { dataSourceOptions } from '../src/data-source';
import { DataSource } from 'typeorm';
import { User } from '../apps/auth-service/src/users/entities/user.entity';
import { UserRole, UserStatus } from '@app/shared/enums';
import * as bcrypt from 'bcrypt';

async function seedTestDatabase() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected successfully');

    const userRepository = dataSource.getRepository(User);

    console.log('Seeding admin user...');
    const adminPasswordHash = await bcrypt.hash('admin12345', 10);
    const adminUser = userRepository.create({
      email: 'admin@dreamfitness.com',
      password: adminPasswordHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
      balance: 0,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(adminUser);
    console.log('Admin user created:', adminUser.email);

    console.log('Seeding test user...');
    const testPasswordHash = await bcrypt.hash('test12345', 10);
    const testUser = userRepository.create({
      email: 'test@example.com',
      password: testPasswordHash,
      name: 'Test User',
      role: UserRole.CLIENT,
      balance: 1000,
      status: UserStatus.ACTIVE,
    });
    await userRepository.save(testUser);
    console.log('Test user created:', testUser.email);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

seedTestDatabase();
