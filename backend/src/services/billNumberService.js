const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateBillNumber() {
  const lastBill = await prisma.bill.findFirst({
    orderBy: { id: 'desc' },
  });

  const nextId = lastBill ? lastBill.id + 1 : 1;
  return `SLC-${String(nextId).padStart(4, '0')}`;
}

module.exports = { generateBillNumber };
