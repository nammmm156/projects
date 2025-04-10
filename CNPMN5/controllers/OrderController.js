const Order = require('../models/Order');

class OrderController {
    static createOrder(req, res) {
        try {
            const orderData = req.body;
            const newOrder = Order.createOrder(orderData);
            
            console.log('Đã lưu đơn hàng mới:', newOrder);
            
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
    }
}

module.exports = OrderController; 