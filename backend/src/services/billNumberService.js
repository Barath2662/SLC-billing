const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateBillNumber() {
  // Format: YY-XXX  e.g. 26-001 for first bill of 2026, resets each new year
  const year = String(new Date().getFullYear()).slice(-2); // '26' for 2026

  const lastBill = await prisma.bill.findFirst({
    where: { billNumber: { startsWith: `${year}-` } },
    orderBy: { id: 'desc' },
  });

  let nextSeq = 1;
  if (lastBill) {
    const seq = parseInt(lastBill.billNumber.slice(3), 10);
    if (!isNaN(seq)) nextSeq = seq + 1;
  }

  return `${year}-${String(nextSeq).padStart(3, '0')}`;
}

module.exports = { generateBillNumber };
