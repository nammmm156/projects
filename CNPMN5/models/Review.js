const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'projects', 'log');
const REVIEWS_FILE = path.join(LOG_DIR, 'reviews.json');

// Đảm bảo file tồn tại
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, '{}');
}

class Review {
    static readReviews() {
        try {
            const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Lỗi khi đọc file reviews:', error);
            return {};
        }
    }

    static writeReviews(reviews) {
        try {
            fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
        } catch (error) {
            console.error('Lỗi khi ghi file reviews:', error);
        }
    }

    static getReviewsByProductId(productId) {
        const reviews = this.readReviews();
        return reviews[productId] || [];
    }

    static getAllReviews() {
        return this.readReviews();
    }

    static addReview(productId, review) {
        const reviews = this.readReviews();
        
        if (!reviews[productId]) {
            reviews[productId] = [];
        }
        
        const newReview = {
            ...review,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };
        
        reviews[productId].push(newReview);
        this.writeReviews(reviews);
        return newReview;
    }
}

module.exports = Review; 