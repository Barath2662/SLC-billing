const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { generateBillNumber } = require('../services/billNumberService');
const { generateInvoiceHTML, numberToWords } = require('../services/pdfService');
const { generatePDFFromHTML } = require('../services/pdfkitService');
const { calculateTotalKms, calculateTotalHours, calculateChargeableKms, calculateTotalAmount, calculatePayableAmount } = require('../utils/calculations');

const prisma = new PrismaClient();

const normalizeBillResponse = (bill) => {
  if (!bill) return bill;

  const numericDefaults = {
    totalHours: 0,
    startingKms: 0,
    closingKms: 0,
    totalKms: 0,
    chargePerKm: 0,
    chargePerHour: 0,
    freeKms: 0,
    chargeableKms: 0,
    chargePerDay: 0,
    tollCharges: 0,
    nightHaltCharges: 0,
    driverBata: 0,
    driverBataCount: 1,
    permitCharges: 0,
    otherExpenses: 0,
    totalAmount: 0,
    advance: 0,
    payableAmount: 0,
  };

  const textDefaults = {
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    travelDetails: '',
    gstin: '',
    vehicleNumber: '',
    startingTime: '',
    closingTime: '',
    rupeesInWords: '',
  };

  return {
    ...textDefaults,
    ...numericDefaults,
    ...bill,
  };
};

const parseOptionalNumber = (val, defaultVal = null) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

const parseOptionalDate = (val, defaultVal = null) => {
  if (!val || val === '') return defaultVal;
  const d = new Date(val);
  return isNaN(d.getTime()) ? defaultVal : d;
};

// Create a new bill
const createBill = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = req.body;

    const multipleDays = data.multipleDays === true || data.multipleDays === 'true';
    const tripDate = parseOptionalDate(data.tripDate);
    const tripEndDate = parseOptionalDate(data.tripEndDate);
    const date = parseOptionalDate(data.date, new Date());

    const startingKms = parseOptionalNumber(data.startingKms);
    const closingKms = parseOptionalNumber(data.closingKms);
    const totalKms = calculateTotalKms(startingKms, closingKms);

    const totalHours = calculateTotalHours(data.startingTime, data.closingTime, multipleDays, tripDate, tripEndDate);
    const freeKms = parseOptionalNumber(data.freeKms);
    const chargeableKms = calculateChargeableKms(totalKms, freeKms);
    const driverBataCount = parseOptionalNumber(data.driverBataCount, 1);

    const billData = {
      ...data,
      multipleDays,
      tripDate,
      tripEndDate,
      startingKms,
      closingKms,
      totalKms,
      totalHours,
      freeKms,
      chargeableKms,
      driverBataCount,
      chargePerKm: parseOptionalNumber(data.chargePerKm),
      chargePerHour: parseOptionalNumber(data.chargePerHour),
      chargePerDay: parseOptionalNumber(data.chargePerDay),
      tollCharges: parseOptionalNumber(data.tollCharges),
      nightHaltCharges: parseOptionalNumber(data.nightHaltCharges),
      driverBata: parseOptionalNumber(data.driverBata),
      permitCharges: parseOptionalNumber(data.permitCharges),
      otherExpenses: parseOptionalNumber(data.otherExpenses),
    };

    const inputTotalAmount = parseOptionalNumber(data.totalAmount);
    const computedTotalAmount = calculateTotalAmount(billData);
    const totalAmount = inputTotalAmount !== null ? inputTotalAmount : computedTotalAmount;

    const advance = parseOptionalNumber(data.advance, 0);
    const payableAmount = calculatePayableAmount(totalAmount, advance);
    const rupeesInWords = data.rupeesInWords || numberToWords(totalAmount) || 'Zero Rupees Only';

    let bill;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const billNumber = await generateBillNumber();
      try {
        bill = await prisma.bill.create({
          data: {
            billNumber,
            customerName: data.customerName,
            addressLine1: data.addressLine1 || null,
            addressLine2: data.addressLine2 || null,
            addressLine3: data.addressLine3 || null,
            travelDetails: data.travelDetails || null,
            gstin: data.gstin || null,
            date,
            vehicleNumber: data.vehicleNumber || null,
            multipleDays,
            tripDate,
            tripEndDate,
            startingTime: data.startingTime || null,
            closingTime: data.closingTime || null,
            totalHours,
            startingKms,
            closingKms,
            totalKms,
            chargePerKm: billData.chargePerKm,
            chargePerHour: billData.chargePerHour,
            freeKms,
            chargeableKms,
            chargePerDay: billData.chargePerDay,
            tollCharges: billData.tollCharges,
            nightHaltCharges: billData.nightHaltCharges,
            driverBata: billData.driverBata,
            driverBataCount,
            permitCharges: billData.permitCharges,
            otherExpenses: billData.otherExpenses,
            totalAmount,
            advance: advance > 0 ? advance : null,
            payableAmount,
            rupeesInWords,
          },
        });
        break;
      } catch (dbErr) {
        if (dbErr.code === 'P2002' && dbErr.meta?.target?.includes('bill_number') && attempts < maxAttempts) {
          console.warn(`Bill number collision on attempt ${attempts}, retrying...`);
          continue;
        }
        throw dbErr;
      }
    }

    res.status(201).json({ message: 'Bill created successfully.', bill });

    // Upsert customer for future autocomplete
    if (data.customerName) {
      prisma.customer.upsert({
        where: { name: data.customerName },
        update: {
          gstin: data.gstin || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          addressLine3: data.addressLine3 || null,
        },
        create: {
          name: data.customerName,
          gstin: data.gstin || null,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          addressLine3: data.addressLine3 || null,
        },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Create bill error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

// Get all bills
const getAllBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.bill.count(),
    ]);

    res.json({
      bills: bills.map(normalizeBillResponse),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Get bills error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get bill by bill number
const getBillByNumber = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await prisma.bill.findUnique({
      where: { billNumber },
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    res.json({ bill: normalizeBillResponse(bill) });
  } catch (err) {
    console.error('Get bill error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Update bill
const updateBill = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { billNumber } = req.params;
    const data = req.body;

    const existing = await prisma.bill.findUnique({ where: { billNumber } });
    if (!existing) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    // Recalculate
    const startingKms = data.startingKms !== undefined ? parseOptionalNumber(data.startingKms) : parseOptionalNumber(existing.startingKms);
    const closingKms = data.closingKms !== undefined ? parseOptionalNumber(data.closingKms) : parseOptionalNumber(existing.closingKms);
    const updatedMultipleDays = data.multipleDays !== undefined
      ? (data.multipleDays === true || data.multipleDays === 'true')
      : existing.multipleDays;
    const updatedTripDate = data.tripDate !== undefined ? parseOptionalDate(data.tripDate) : parseOptionalDate(existing.tripDate);
    const updatedTripEndDate = data.tripEndDate !== undefined ? parseOptionalDate(data.tripEndDate) : parseOptionalDate(existing.tripEndDate);
    const totalKms = calculateTotalKms(startingKms, closingKms);
    const totalHours = calculateTotalHours(
      data.startingTime !== undefined ? data.startingTime : existing.startingTime,
      data.closingTime !== undefined ? data.closingTime : existing.closingTime,
      updatedMultipleDays, updatedTripDate, updatedTripEndDate
    );

    const updatedFreeKms = data.freeKms !== undefined ? parseOptionalNumber(data.freeKms) : parseOptionalNumber(existing.freeKms);
    const chargeableKms = calculateChargeableKms(totalKms, updatedFreeKms);

    const billData = {
      chargePerKm: data.chargePerKm !== undefined ? parseOptionalNumber(data.chargePerKm) : parseOptionalNumber(existing.chargePerKm),
      chargePerHour: data.chargePerHour !== undefined ? parseOptionalNumber(data.chargePerHour) : parseOptionalNumber(existing.chargePerHour),
      freeKms: updatedFreeKms,
      chargeableKms,
      chargePerDay: data.chargePerDay !== undefined ? parseOptionalNumber(data.chargePerDay) : parseOptionalNumber(existing.chargePerDay),
      tollCharges: data.tollCharges !== undefined ? parseOptionalNumber(data.tollCharges) : parseOptionalNumber(existing.tollCharges),
      multipleDays: updatedMultipleDays,
      tripDate: updatedTripDate,
      tripEndDate: updatedTripEndDate,
      totalKms,
      totalHours,
      nightHaltCharges: data.nightHaltCharges !== undefined ? parseOptionalNumber(data.nightHaltCharges) : parseOptionalNumber(existing.nightHaltCharges),
      driverBata: data.driverBata !== undefined ? parseOptionalNumber(data.driverBata) : parseOptionalNumber(existing.driverBata),
      driverBataCount: data.driverBataCount !== undefined ? parseOptionalNumber(data.driverBataCount, 1) : parseOptionalNumber(existing.driverBataCount, 1),
      permitCharges: data.permitCharges !== undefined ? parseOptionalNumber(data.permitCharges) : parseOptionalNumber(existing.permitCharges),
      otherExpenses: data.otherExpenses !== undefined ? parseOptionalNumber(data.otherExpenses) : parseOptionalNumber(existing.otherExpenses),
    };
    const inputTotalAmount = data.totalAmount !== undefined ? parseOptionalNumber(data.totalAmount) : null;
    const totalAmount = inputTotalAmount !== null ? inputTotalAmount : calculateTotalAmount(billData);
    const advance = data.advance !== undefined ? parseOptionalNumber(data.advance, 0) : parseOptionalNumber(existing.advance, 0);
    const payableAmount = calculatePayableAmount(totalAmount, advance);
    const rupeesInWords = data.rupeesInWords || numberToWords(totalAmount) || 'Zero Rupees Only';

    const bill = await prisma.bill.update({
      where: { billNumber },
      data: {
        customerName: data.customerName ?? existing.customerName,
        addressLine1: data.addressLine1 !== undefined ? (data.addressLine1 || null) : existing.addressLine1,
        addressLine2: data.addressLine2 !== undefined ? (data.addressLine2 || null) : existing.addressLine2,
        addressLine3: data.addressLine3 !== undefined ? (data.addressLine3 || null) : existing.addressLine3,
        travelDetails: data.travelDetails ?? existing.travelDetails,
        gstin: data.gstin ?? existing.gstin,
        date: data.date !== undefined ? (parseOptionalDate(data.date) || existing.date) : existing.date,
        vehicleNumber: data.vehicleNumber ?? existing.vehicleNumber,
        multipleDays: updatedMultipleDays,
        tripDate: updatedTripDate,
        tripEndDate: updatedTripEndDate,
        startingTime: data.startingTime !== undefined ? (data.startingTime || null) : existing.startingTime,
        closingTime: data.closingTime !== undefined ? (data.closingTime || null) : existing.closingTime,
        totalHours,
        startingKms,
        closingKms,
        totalKms,
        chargePerKm: billData.chargePerKm,
        chargePerHour: billData.chargePerHour,
        freeKms: updatedFreeKms,
        chargeableKms,
        chargePerDay: billData.chargePerDay,
        tollCharges: billData.tollCharges,
        nightHaltCharges: billData.nightHaltCharges,
        driverBata: billData.driverBata,
        driverBataCount: billData.driverBataCount,
        permitCharges: billData.permitCharges,
        otherExpenses: billData.otherExpenses,
        totalAmount,
        advance: advance > 0 ? advance : null,
        payableAmount,
        rupeesInWords,
      },
    });

    res.json({ message: 'Bill updated successfully.', bill });
  } catch (err) {
    console.error('Update bill error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

// Delete bill
const deleteBill = async (req, res) => {
  try {
    const { billNumber } = req.params;

    const existing = await prisma.bill.findUnique({ where: { billNumber } });
    if (!existing) {
      return res.status(404).json({ error: 'Bill not found.' });
    }

    await prisma.bill.delete({ where: { billNumber } });
    res.json({ message: 'Bill deleted successfully.' });
  } catch (err) {
    console.error('Delete bill error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Search bills
const searchBills = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const bills = await prisma.bill.findMany({
      where: {
        OR: [
          { billNumber: { contains: q, mode: 'insensitive' } },
          { customerName: { contains: q, mode: 'insensitive' } },
          { vehicleNumber: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ bills: bills.map(normalizeBillResponse), count: bills.length });
  } catch (err) {
    console.error('Search bills error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Filter bills by date range, customer name, bill number range
const filterBills = async (req, res) => {
  try {
    const { dateFrom, dateTo, customerName, billFrom, billTo } = req.query;

    const where = {};

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (customerName && customerName.trim()) {
      where.customerName = { contains: customerName.trim(), mode: 'insensitive' };
    }

    if (billFrom || billTo) {
      const allBills = await prisma.bill.findMany({
        where,
        orderBy: { billNumber: 'asc' },
        select: { billNumber: true },
      });

      // Filter by bill number range lexicographically (works for YY-XXX format)
      const filtered = allBills.filter(({ billNumber }) => {
        if (billFrom && billNumber < billFrom) return false;
        if (billTo && billNumber > billTo) return false;
        return true;
      });

      const billNumbers = filtered.map((b) => b.billNumber);
      where.billNumber = { in: billNumbers };
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    res.json({ bills: bills.map(normalizeBillResponse), count: bills.length });
  } catch (err) {
    console.error('Filter bills error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Generate PDF
const generateBillPDF = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await prisma.bill.findUnique({ where: { billNumber } });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    console.log('BILL DATA:', bill);
    const html = generateInvoiceHTML(bill);
    const pdfBuffer = await generatePDFFromHTML(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${bill.billNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('🔥 PDF GENERATION ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      billNumber: req.params.billNumber,
    });

    res.status(500).json({
      error: 'PDF generation failed',
      message: error.message,
    });
  }
};

// Get invoice as HTML (for iframe preview in frontend)
const getInvoiceHTML = async (req, res) => {
  try {
    const { billNumber } = req.params;
    const bill = await prisma.bill.findUnique({ where: { billNumber } });
    if (!bill) return res.status(404).json({ error: 'Bill not found.' });
    console.log('BILL DATA:', bill);
    const html = generateInvoiceHTML(bill);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Get invoice HTML error:', err);
    res.status(500).json({ error: 'Failed to generate invoice.' });
  }
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const totalBills = await prisma.bill.count();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyBills = await prisma.bill.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { totalAmount: true },
    });
    const monthlyRevenue = monthlyBills.reduce((sum, b) => sum + Number(b.totalAmount), 0);

    const recentBills = await prisma.bill.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        billNumber: true,
        customerName: true,
        vehicleNumber: true,
        totalAmount: true,
        date: true,
        createdAt: true,
      },
    });

    res.json({
      totalBills,
      monthlyRevenue,
      monthlyBillCount: monthlyBills.length,
      recentBills,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Get all customers for autocomplete
const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, gstin: true, addressLine1: true, addressLine2: true, addressLine3: true },
    });
    res.json({ customers });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillByNumber,
  updateBill,
  deleteBill,
  searchBills,
  filterBills,
  generateBillPDF,
  getInvoiceHTML,
  getDashboardStats,
  getCustomers,
};
