const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

router.post('/submit-info', OrderController.createOrder);

module.exports = router; 