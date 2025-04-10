const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');

router.get('/:productId', ReviewController.getReviewsByProductId);
router.get('/', ReviewController.getAllReviews);
router.post('/:productId', ReviewController.addReview);

module.exports = router; 