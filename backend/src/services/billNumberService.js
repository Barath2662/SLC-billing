const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateBillNumber() {
  // Format: YY-XXX  e.g. 26-001 for first bill of 2026, resets each new year
  const year = String(new Date().getFullYear()).slice(-2); // '26' for 2026

  const bills = await prisma.bill.findMany({
    where: { billNumber: { startsWith: `${year}-` } },
    select: { billNumber: true },
  });

  let maxSeq = 0;
  for (const b of bills) {
    if (b.billNumber && b.billNumber.length >= 4) {
      const parts = b.billNumber.split('-');
      if (parts.length >= 2) {
        const seqNum = parseInt(parts[1], 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `${year}-${String(nextSeq).padStart(3, '0')}`;
}

module.exports = { generateBillNumber };
