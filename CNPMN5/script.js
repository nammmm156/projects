// Khởi tạo khi trang được load
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    displayCart();
    const sortButton = document.getElementById('sort-button');
    if (sortButton) {
        sortButton.addEventListener('click', sortProducts);
    }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = totalCount;
    }
}

// Tính tổng tiền giỏ hàng
function calculateTotal(cart) {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Hiển thị giỏ hàng
function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    
    if (!cartContainer || !totalElement) return;

    cartContainer.innerHTML = "";
    
    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Giỏ hàng của bạn đang trống!</p>";
        totalElement.textContent = "0đ";
        return;
    }

    // Hiển thị từng sản phẩm
    cart.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.textContent = `${item.name} - ${item.quantity} x ${item.price.toLocaleString()}đ`;
        cartContainer.appendChild(div);
    });

    // Hiển thị tổng tiền
    const totalPrice = calculateTotal(cart);
    totalElement.textContent = totalPrice.toLocaleString() + "đ";
}

// Thêm sản phẩm vào giỏ hàng
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart")) {
        const product = event.target.closest(".product");
        const productId = product.dataset.id;
        const productName = product.dataset.name;
        const productPrice = parseInt(product.dataset.price);
        
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(item => item.id === productId);
        
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
        displayCart();
        alert("Đã thêm sản phẩm vào giỏ hàng!");
    }
});

// Xóa toàn bộ giỏ hàng
function clearCart() {
    localStorage.removeItem("cart");
    updateCartCount();
    displayCart();
}

// Lưu đơn hàng vào localStorage
function saveOrder(orderData) {
    const orderLog = JSON.parse(localStorage.getItem("order-log")) || [];
    orderLog.push(orderData);
    localStorage.setItem("order-log", JSON.stringify(orderLog));
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

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    try {
        // Gửi thông tin đến API
        const response = await fetch('/api/submit-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name, 
                address,
                cart: cart,
                totalAmount: calculateTotal(cart)
            })
        });

        const data = await response.json();
        if (data.success) {
            // Lưu thông tin đơn hàng
            const orderData = {
                name,
                address,
                cart,
                timestamp: new Date().toLocaleString(),
                totalAmount: calculateTotal(cart)
            };

            saveOrder(orderData);
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
        console.error('Lỗi:', error);
        alert('Không thể kết nối đến server: ' + error.message);
    }
}

// Lắng nghe sự kiện submit của form thanh toán
document.addEventListener("submit", (event) => {
    if (event.target.id === "checkout-form") {
        event.preventDefault();
        handleCheckout();
    }
});

// Biến để theo dõi trạng thái sắp xếp
let isAscending = true;

// Hàm sắp xếp sản phẩm
function sortProducts() {
    const productList = document.querySelector('.product-list');
    const products = Array.from(productList.children);
    
    // Sắp xếp mảng sản phẩm theo giá
    products.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        return isAscending ? priceA - priceB : priceB - priceA;
    });
    
    // Xóa tất cả sản phẩm hiện tại
    products.forEach(product => product.remove());
    
    // Thêm lại sản phẩm đã sắp xếp
    products.forEach(product => productList.appendChild(product));
    
    // Đảo ngược trạng thái sắp xếp
    isAscending = !isAscending;
    
    // Cập nhật text của nút
    const sortButton = document.getElementById('sort-button');
    sortButton.textContent = isAscending ? 'Sắp xếp theo giá (cao đến thấp)' : 'Sắp xếp theo giá (thấp đến cao)';
}