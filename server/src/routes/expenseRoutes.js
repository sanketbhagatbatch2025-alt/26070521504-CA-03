const express = require('express');
const router = express.Router();
const {
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

router.route('/:id')
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
