const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Tạo thư mục log nếu chưa tồn tại
const LOG_DIR = path.join(__dirname, 'projects', 'log');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Lưu trữ đánh giá và đơn hàng trong thư mục log
const REVIEWS_FILE = path.join(LOG_DIR, 'reviews.json');
const ORDERS_FILE = path.join(LOG_DIR, 'orders.json');

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
        // Đảm bảo file tồn tại
        if (!fs.existsSync(ORDERS_FILE)) {
            fs.writeFileSync(ORDERS_FILE, '[]');
        }

        // Đọc đơn hàng hiện có
        let orders = [];
        try {
            const fileContent = fs.readFileSync(ORDERS_FILE, 'utf8');
            orders = fileContent ? JSON.parse(fileContent) : [];
        } catch (error) {
            console.error('Lỗi khi đọc file orders:', error);
            orders = [];
        }
        
        // Thêm đơn hàng mới
        const newOrder = {
            ...orderData,
            orderId: Date.now().toString(),
            orderDate: new Date().toISOString(),
            status: 'Đang xử lý'
        };
        orders.push(newOrder);
        
        // Lưu lại vào file
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        
        // Log ra console để debug
        console.log('Đã lưu đơn hàng mới:', newOrder);
        console.log('Đường dẫn file:', ORDERS_FILE);
        
        res.json({ success: true, orderId: newOrder.orderId });
    } catch (error) {
        console.error('Lỗi khi xử lý đơn hàng:', error);
        res.status(500).json({ success: false, error: 'Lỗi khi xử lý đơn hàng' });
    }
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
    console.log('Thư mục log:', LOG_DIR);
});