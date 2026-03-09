const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@sriilakshmicab.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@sriilakshmicab.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Seed completed: Default admin user created');
  console.log('Email: admin@sriilakshmicab.com');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
