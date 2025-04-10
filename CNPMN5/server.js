const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
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

// Danh sách sản phẩm mẫu
const products = [
    { id: 1, name: "Áo Thun Mát Mẻ", price: 200000, image: "images/ao-thun.jpg" },
    { id: 2, name: "Quần Short Thoáng Mát", price: 250000, image: "images/quan-short.jpg" },
    { id: 3, name: "Kính Mát Thời Trang", price: 300000, image: "images/kinh-mat.jpg" },
    { id: 4, name: "Sách dạy làm giàu", price: 1000000, image: "images/lamgiau.png" },
    { id: 5, name: "Sách dạy kinh doanh online", price: 2000000, image: "images/online.png" },
    { id: 6, name: "Cặp Sách Thời Trang", price: 350000, image: "images/capsach.jpg" },
    { id: 7, name: "Mũ Thời Trang", price: 150000, image: "images/mu.png" },
    { id: 8, name: "Quạt Mini Tiện Lợi", price: 200000, image: "images/quat.png" },
    { id: 9, name: "Móc Khóa Xinh Xắn", price: 50000, image: "images/mockhoa.png" },
    { id: 10, name: "Thắt Lưng Da Cao Cấp", price: 450000, image: "images/thatlung.png" },
    { id: 11, name: "Đồng Hồ Thông Minh", price: 1500000, image: "images/dongho.png" },
    { id: 12, name: "Ghế Gaming Cao Cấp", price: 3500000, image: "images/ghe.png" }
];

// API tìm kiếm sản phẩm
app.get('/api/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    if (!query) {
        return res.json([]);
    }

    const results = products.filter(product => 
        product.name.toLowerCase().includes(query)
    );
    res.json(results);
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
            status: 'Đang xử lý',
            paymentStatus: 'Chờ thanh toán'
        };
        orders.push(newOrder);
        
        // Lưu lại vào file
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        
        // Log ra console để debug
        console.log('Đã lưu đơn hàng mới:', newOrder);
        console.log('Đường dẫn file:', ORDERS_FILE);
        
        res.json({ 
            success: true, 
            orderId: newOrder.orderId,
            message: 'Đơn hàng đã được tiếp nhận thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xử lý đơn hàng:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi khi xử lý đơn hàng',
            details: error.message 
        });
    }
});

// API lấy chi tiết sản phẩm
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/product-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'product-detail.html'));
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
    console.log('Thư mục log:', LOG_DIR);
});