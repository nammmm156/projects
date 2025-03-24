const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Lưu trữ đánh giá trong file (trong thực tế nên dùng database)
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Đảm bảo file tồn tại
if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, '{}');
}
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
}

// Đọc đánh giá từ file
function readReviews() {
    try {
        const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Lỗi khi đọc file reviews:', error);
        return {};
    }
}

// Ghi đánh giá vào file
function writeReviews(reviews) {
    try {
        fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
    } catch (error) {
        console.error('Lỗi khi ghi file reviews:', error);
    }
}

// API lấy đánh giá của sản phẩm
app.get('/api/reviews/:productId', (req, res) => {
    const productId = req.params.productId;
    const reviews = readReviews();
    res.json(reviews[productId] || []);
});

// API thêm đánh giá mới
app.post('/api/reviews/:productId', (req, res) => {
    const productId = req.params.productId;
    const review = req.body;
    const reviews = readReviews();
    
    if (!reviews[productId]) {
        reviews[productId] = [];
    }
    
    reviews[productId].push({
        ...review,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    
    writeReviews(reviews);
    res.json({ success: true });
});

// API lấy tất cả đánh giá
app.get('/api/reviews', (req, res) => {
    const reviews = readReviews();
    res.json(reviews);
});

// API xử lý đơn hàng
app.post('/api/submit-info', (req, res) => {
    const orderData = req.body;
    
    try {
        // Đọc đơn hàng hiện có
        let orders = [];
        try {
            orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
        } catch (error) {
            console.error('Lỗi khi đọc file orders:', error);
        }
        
        // Thêm đơn hàng mới
        orders.push({
            ...orderData,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        
        // Lưu lại vào file
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi khi xử lý đơn hàng:', error);
        res.status(500).json({ success: false, error: 'Lỗi khi xử lý đơn hàng' });
    }
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
});