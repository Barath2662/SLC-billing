const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createBill,
  getAllBills,
  getBillByNumber,
  updateBill,
  deleteBill,
  searchBills,
  generateBillPDF,
  getInvoiceHTML,
  getDashboardStats,
  getCustomers,
} = require('../controllers/billController');

const router = express.Router();

// All bill routes require authentication
router.use(authMiddleware);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Customers autocomplete
router.get('/customers', getCustomers);

// Search (must be before /:billNumber)
router.get('/search', searchBills);

// CRUD
router.post(
  '/create',
  [
    body('customerName').trim().notEmpty().withMessage('Customer name is required.'),
  ],
  createBill
);

router.get('/', getAllBills);
router.get('/:billNumber', getBillByNumber);
router.get('/:billNumber/pdf', generateBillPDF);
router.get('/:billNumber/invoice', getInvoiceHTML);

router.put(
  '/update/:billNumber',
  [
    body('customerName').optional().trim().notEmpty().withMessage('Customer name cannot be empty.'),
  ],
  updateBill
);

router.delete('/:billNumber', deleteBill);

module.exports = router;
