const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateBillNumber() {
  // Format: XXXX e.g. 0001, 0002
  const bills = await prisma.bill.findMany({
    select: { billNumber: true },
  });

  let maxSeq = 0;
  for (const b of bills) {
    if (b.billNumber) {
      const seqNum = parseInt(b.billNumber, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return String(nextSeq).padStart(4, '0');
}

module.exports = { generateBillNumber };
