const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'sureshkumarn' },
    update: {},
    create: {
      username: 'sureshkumarn',
      name: 'Suresh Kumar N',
      passwordHash,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { username: 'barath' },
    update: {},
    create: {
      username: 'barath',
      name: 'Barath',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Seed completed: 2 admin users created');
  console.log('  username: sureshkumarn  password: admin123');
  console.log('  username: barath        password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

