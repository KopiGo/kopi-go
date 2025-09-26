import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Starting database seed...');

    // Create a test driver
    const driver = await prisma.driver.upsert({
      where: { email: 'driver@test.com' },
      update: {},
      create: {
        name: 'Test Driver',
        email: 'driver@test.com',
        password: '123456',
        phone_num: '081234567890',
        role: 'driver',
      },
    });

    // Create a test superadmin
    const admin = await prisma.superadmin.upsert({
      where: { email: 'admin@test.com' },
      update: {},
      create: {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: '123456',
      },
    });

    console.log('Database seeded successfully!');
    console.log('Test Driver:', { email: 'driver@test.com', password: '123456' });
    console.log('Test Admin:', { email: 'admin@test.com', password: '123456' });

    // List all users
    const allDrivers = await prisma.driver.findMany();
    const allAdmins = await prisma.superadmin.findMany();
    
    console.log('\nAll Drivers in database:');
    allDrivers.forEach(d => console.log(`- ${d.email} (password: ${d.password})`));
    
    console.log('\nAll Admins in database:');
    allAdmins.forEach(a => console.log(`- ${a.email} (password: ${a.password})`));

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();