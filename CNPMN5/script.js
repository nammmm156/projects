document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    displayCart();
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = totalCount;
}

// Hiển thị giỏ hàng
function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cart-items");
    let totalElement = document.getElementById("cart-total");

    cartContainer.innerHTML = "";
    let totalPrice = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Giỏ hàng của bạn đang trống!</p>";
    } else {
        cart.forEach((item) => {
            let div = document.createElement("div");
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
            cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
        }
        
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }
});

// Xóa toàn bộ giỏ hàng
function clearCart() {
    localStorage.removeItem("cart");
    updateCartCount();
    document.getElementById("cart-items").innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    document.getElementById("cart-total").textContent = "0đ";
    alert("Đã xóa toàn bộ giỏ hàng!");
}

// Xử lý thanh toán
function handleCheckout() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    let customerName = prompt("Vui lòng nhập tên của bạn:");
    if (!customerName) {
        alert("Vui lòng nhập tên của bạn.");
        return;
    }

    let customerAddress = prompt("Vui lòng nhập địa chỉ của bạn:");
    if (!customerAddress) {
        alert("Vui lòng nhập địa chỉ của bạn.");
        return;
    }

    let orderData = {
        name: customerName,
        address: customerAddress,
        cart: cart,
        timestamp: new Date().toLocaleString()
    };

    // Lưu đơn hàng vào localStorage
    let orderLog = JSON.parse(localStorage.getItem("order-log")) || [];
    orderLog.push(orderData);
    localStorage.setItem("order-log", JSON.stringify(orderLog));

    alert("Đặt hàng thành công!");

    // Xóa giỏ hàng
    clearCart();
}

// Lắng nghe sự kiện submit của form thanh toán
document.addEventListener("submit", (event) => {
    if (event.target.id === "checkout-form") {
        event.preventDefault();
        handleCheckout();
    }
});
