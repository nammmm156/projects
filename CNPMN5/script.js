document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    displayCart();
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = totalCount;
    }
}

// Hiển thị giỏ hàng
function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    
    if (!cartContainer || !totalElement) return;

    cartContainer.innerHTML = "";
    let totalPrice = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Giỏ hàng của bạn đang trống!</p>";
    } else {
        cart.forEach((item) => {
            let div = document.createElement("div");
            div.className = "cart-item";
            div.textContent = `${item.name} - ${item.quantity} x ${item.price.toLocaleString()}đ`;
            cartContainer.appendChild(div);
            totalPrice += item.price * item.quantity;
        });
    }

    totalElement.textContent = totalPrice.toLocaleString() + "đ";
}

// Thêm sản phẩm vào giỏ hàng
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart")) {
        let product = event.target.closest(".product");
        let productId = product.dataset.id;
        let productName = product.dataset.name;
        let productPrice = parseInt(product.dataset.price);
        
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ 
                id: productId, 
                name: productName, 
                price: productPrice, 
                quantity: 1 
            });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        alert("Đã thêm sản phẩm vào giỏ hàng!");
    }
});

// Xóa toàn bộ giỏ hàng
function clearCart() {
    localStorage.removeItem("cart");
    updateCartCount();
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    
    if (cartItems) {
        cartItems.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    }
    if (cartTotal) {
        cartTotal.textContent = "0đ";
    }
}

// Xử lý thanh toán
async function handleCheckout() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;

    if (!name || !address) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    try {
        // Gửi thông tin đến API
        const response = await fetch('http://192.168.6.110:3000/api/submit-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                address,
                cart: cart,
                totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            })
        });

        const data = await response.json();
        if (data.success) {
            // Lưu thông tin đơn hàng vào localStorage
            let orderData = {
                name: name,
                address: address,
                cart: cart,
                timestamp: new Date().toLocaleString(),
                totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };

            let orderLog = JSON.parse(localStorage.getItem("order-log")) || [];
            orderLog.push(orderData);
            localStorage.setItem("order-log", JSON.stringify(orderLog));

            alert("Đặt hàng thành công!");
            checkoutForm.reset();
            clearCart();
            
            // Chuyển về trang chủ sau 2 giây
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            alert('Có lỗi xảy ra: ' + data.error);
        }
    } catch (error) {
        alert('Không thể kết nối đến server: ' + error.message);
        console.error('Lỗi:', error);
    }
}

// Lắng nghe sự kiện submit của form thanh toán
document.addEventListener("submit", (event) => {
    if (event.target.id === "checkout-form") {
        event.preventDefault();
        handleCheckout();
    }
});