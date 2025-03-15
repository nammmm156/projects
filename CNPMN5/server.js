const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Cấu hình CORS chi tiết
const corsOptions = {
    origin: '*', // Cho phép tất cả các domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('./'));

// API endpoint để nhận thông tin người dùng
app.post('/api/submit-info', (req, res) => {
    const { name, address } = req.body;
    const logEntry = `Tên: ${name}, Địa chỉ: ${address}\n`;
    
    // Tạo thư mục projects nếu chưa tồn tại
    if (!fs.existsSync('projects')) {
        fs.mkdirSync('projects');
    }

    // Ghi thông tin vào file log
    fs.appendFile(path.join('projects', 'log'), logEntry, (err) => {
        if (err) {
            console.error('Lỗi khi ghi file:', err);
            return res.status(500).json({ error: 'Không thể lưu thông tin' });
        }
        res.json({ success: true, message: 'Đã lưu thông tin thành công' });
    });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
});