const Review = require('../models/Review');

class ReviewController {
    static getReviewsByProductId(req, res) {
        const productId = req.params.productId;
        const reviews = Review.getReviewsByProductId(productId);
        res.json(reviews);
    }

    static getAllReviews(req, res) {
        const reviews = Review.getAllReviews();
        res.json(reviews);
    }

    static addReview(req, res) {
        const productId = req.params.productId;
        const review = req.body;
        const newReview = Review.addReview(productId, review);
        res.json({ success: true, review: newReview });
    }
}

module.exports = ReviewController; 