const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'projects', 'log');
const ORDERS_FILE = path.join(LOG_DIR, 'orders.json');

// Đảm bảo file tồn tại
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
}

class Order {
    static readOrders() {
        try {
            const fileContent = fs.readFileSync(ORDERS_FILE, 'utf8');
            return fileContent ? JSON.parse(fileContent) : [];
        } catch (error) {
            console.error('Lỗi khi đọc file orders:', error);
            return [];
        }
    }

    static writeOrders(orders) {
        try {
            fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        } catch (error) {
            console.error('Lỗi khi ghi file orders:', error);
        }
    }

    static createOrder(orderData) {
        const orders = this.readOrders();
        const newOrder = {
            ...orderData,
            orderId: Date.now().toString(),
            orderDate: new Date().toISOString(),
            status: 'Đang xử lý',
            paymentStatus: 'Chờ thanh toán'
        };
        
        orders.push(newOrder);
        this.writeOrders(orders);
        return newOrder;
    }
}

module.exports = Order; 