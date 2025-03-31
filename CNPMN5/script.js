// script.js

// Khi trang được load
document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    displayCart();
    displayProductRatings();
    const sortButton = document.getElementById('sort-button');
    if (sortButton) {
        sortButton.addEventListener('click', sortProducts);
    }
    
    // Khởi tạo chức năng tìm kiếm
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        // Đóng gợi ý khi click ra ngoài
        document.addEventListener('click', (e) => {
            const suggestions = document.getElementById('search-suggestions');
            if (suggestions && !searchInput.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.classList.remove('active');
            }
        });
    }

    // Xử lý hiển thị ảnh chuyển khoản
    const paymentMethod = document.getElementById('payment-method');
    const bankTransferInfo = document.getElementById('bank-transfer-info');
    if (paymentMethod && bankTransferInfo) {
        paymentMethod.addEventListener('change', () => {
            bankTransferInfo.style.display = paymentMethod.value === 'bank' ? 'block' : 'none';
        });
    }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng (hiển thị ở header)
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

// Hiển thị giỏ hàng với nút "Xóa" cho từng sản phẩm
function displayCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");
    const checkoutTotalElement = document.getElementById("total-amount");
    
    if (!cartContainer) return;
    
    cartContainer.innerHTML = "";
    
    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Giỏ hàng của bạn đang trống!</p>";
        if (totalElement) totalElement.textContent = "0đ";
        if (checkoutTotalElement) checkoutTotalElement.textContent = "0đ";
        return;
    }
    
    // Hiển thị từng sản phẩm
    cart.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        
        // Thông tin sản phẩm
        const itemInfo = document.createElement("span");
        itemInfo.textContent = `${item.name} - ${item.quantity} x ${item.price.toLocaleString()}đ`;
        div.appendChild(itemInfo);
        
        // Nút "Xóa" cho từng sản phẩm (chỉ hiển thị trong trang giỏ hàng)
        if (!window.location.pathname.includes('checkout.html')) {
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Xóa";
            deleteButton.style.marginLeft = "10px";
            deleteButton.addEventListener("click", () => {
                removeItem(item.id);
            });
            div.appendChild(deleteButton);
        }
        
        cartContainer.appendChild(div);
    });
    
    // Hiển thị tổng tiền
    const totalPrice = calculateTotal(cart);
    if (totalElement) totalElement.textContent = totalPrice.toLocaleString() + "đ";
    if (checkoutTotalElement) checkoutTotalElement.textContent = totalPrice.toLocaleString() + "đ";
}

// Hàm xóa một sản phẩm khỏi giỏ hàng dựa trên id sản phẩm
function removeItem(itemId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// Sự kiện thêm sản phẩm vào giỏ hàng khi nhấn nút "Thêm vào giỏ hàng"
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

// Hàm xóa toàn bộ giỏ hàng
function clearCart() {
    localStorage.removeItem("cart");
    updateCartCount();
    displayCart();
}

// Lưu đơn hàng vào localStorage (order-log)
function saveOrder(orderData) {
    const orderLog = JSON.parse(localStorage.getItem("order-log")) || [];
    orderLog.push(orderData);
    localStorage.setItem("order-log", JSON.stringify(orderLog));
}

// Xử lý thanh toán, gửi thông tin đơn hàng đến API
async function handleCheckout() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const note = document.getElementById('note').value;
    
    if (!name || !email || !phone || !address || !paymentMethod) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }
    
    try {
        const orderData = {
            name,
            email,
            phone,
            address,
            paymentMethod,
            note,
            cart: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount: calculateTotal(cart),
            orderDate: new Date().toISOString(),
            status: paymentMethod === 'bank' ? 'Chờ thanh toán' : 'Đang xử lý'
        };

        // Gửi thông tin đơn hàng đến API
        const response = await fetch('/api/submit-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        if (data.success) {
            // Lưu đơn hàng vào localStorage
            saveOrder(orderData);
            
            if (paymentMethod === 'bank') {
                alert("Đặt hàng thành công! Vui lòng chuyển khoản theo thông tin trên và chờ xác nhận từ chúng tôi.");
            } else {
                alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.");
            }
            
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

// Biến theo dõi trạng thái sắp xếp sản phẩm
let isAscending = true;

// Hàm sắp xếp sản phẩm theo giá (cho trang sản phẩm)
function sortProducts() {
    const productList = document.querySelector('.product-list');
    if (!productList) return;
    const products = Array.from(productList.children);
    
    // Sắp xếp mảng sản phẩm theo giá
    products.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        return isAscending ? priceA - priceB : priceB - priceA;
    });
    
    // Xóa các sản phẩm hiện có và thêm lại theo thứ tự sắp xếp
    products.forEach(product => product.remove());
    products.forEach(product => productList.appendChild(product));
    
    // Đảo ngược trạng thái sắp xếp
    isAscending = !isAscending;
    
    // Cập nhật text của nút sắp xếp
    const sortButton = document.getElementById('sort-button');
    if (sortButton) {
        sortButton.textContent = isAscending ? 'Sắp xếp theo giá (cao đến thấp)' : 'Sắp xếp theo giá (thấp đến cao)';
    }
}

// Xử lý tìm kiếm sản phẩm
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    const suggestions = document.getElementById('search-suggestions');
    const products = document.querySelectorAll('.product');
    
    if (searchTerm.length < 2) {
        suggestions.classList.remove('active');
        return;
    }
    
    const matchingProducts = Array.from(products).filter(product => {
        const productName = product.dataset.name.toLowerCase();
        return productName.includes(searchTerm);
    });
    
    displaySuggestions(matchingProducts);
}

// Hiển thị gợi ý sản phẩm
function displaySuggestions(products) {
    const suggestions = document.getElementById('search-suggestions');
    suggestions.innerHTML = '';
    
    if (products.length === 0) {
        suggestions.innerHTML = '<div class="suggestion-item">Không tìm thấy sản phẩm</div>';
    } else {
        products.forEach(product => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            
            const img = product.querySelector('img');
            const name = product.dataset.name;
            const price = product.dataset.price;
            
            suggestionItem.innerHTML = `
                <img src="${img.src}" alt="${name}">
                <div class="product-info">
                    <div class="product-name">${name}</div>
                    <div class="product-price">${parseInt(price).toLocaleString()}đ</div>
                </div>
            `;
            
            suggestionItem.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${product.dataset.id}`;
            });
            
            suggestions.appendChild(suggestionItem);
        });
    }
    
    suggestions.classList.add('active');
}

// Thêm vào cuối file
document.querySelector('.login-btn')?.addEventListener('click', function() {
    // Xử lý khi click nút đăng nhập
    alert('Chức năng đăng nhập đang được phát triển');
});

document.querySelector('.register-btn')?.addEventListener('click', function() {
    // Xử lý khi click nút đăng ký
    alert('Chức năng đăng ký đang được phát triển');
});

// Hàm tính điểm đánh giá trung bình cho một sản phẩm
async function calculateAverageRating(productId) {
    try {
        const response = await fetch(`/api/reviews/${productId}`);
        const reviews = await response.json();
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
        return 0;
    }
}

// Hàm hiển thị đánh giá trung bình cho tất cả sản phẩm
async function displayProductRatings() {
    const products = document.querySelectorAll('.product');
    for (const product of products) {
        const productId = product.dataset.id;
        const averageRating = await calculateAverageRating(productId);
        const response = await fetch(`/api/reviews/${productId}`);
        const reviews = await response.json();
        const ratingCount = reviews.length;
        
        const starsElement = product.querySelector('.average-rating .stars');
        const ratingCountElement = product.querySelector('.rating-count');
        
        if (starsElement && ratingCountElement) {
            starsElement.textContent = '★'.repeat(Math.round(parseFloat(averageRating))) + '☆'.repeat(5 - Math.round(parseFloat(averageRating)));
            ratingCountElement.textContent = `(${ratingCount} đánh giá)`;
        }
    }
}

// Hàm lưu đánh giá mới
async function saveReview(productId, rating, text) {
    try {
        const response = await fetch(`/api/reviews/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rating,
                text,
                date: new Date().toLocaleDateString('vi-VN')
            })
        });
        
        if (response.ok) {
            await displayProductRatings(); // Cập nhật hiển thị đánh giá
            return true;
        }
        return false;
    } catch (error) {
        console.error('Lỗi khi lưu đánh giá:', error);
        return false;
    }
}

// Hàm lưu sản phẩm đã xem
function addToRecentlyViewed(product) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    
    // Kiểm tra xem sản phẩm đã tồn tại chưa
    const existingIndex = recentlyViewed.findIndex(item => item.id === product.id);
    if (existingIndex !== -1) {
        // Nếu sản phẩm đã tồn tại, xóa nó khỏi vị trí cũ
        recentlyViewed.splice(existingIndex, 1);
    }
    
    // Thêm sản phẩm vào đầu danh sách
    recentlyViewed.unshift(product);
    
    // Giới hạn số lượng sản phẩm đã xem (ví dụ: 6 sản phẩm)
    if (recentlyViewed.length > 6) {
        recentlyViewed = recentlyViewed.slice(0, 6);
    }
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    displayRecentlyViewed();
}

// Hàm hiển thị sản phẩm đã xem
function displayRecentlyViewed() {
    const recentlyViewedContainer = document.getElementById('recently-viewed-products');
    if (!recentlyViewedContainer) return;

    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    
    if (recentlyViewed.length === 0) {
        recentlyViewedContainer.innerHTML = '<p class="no-products">Chưa có sản phẩm nào được xem gần đây</p>';
        return;
    }

    recentlyViewedContainer.innerHTML = recentlyViewed.map(product => `
        <div class="product" data-id="${product.id}">
            <a href="product-detail.html?id=${product.id}" class="product-link">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">Giá: ${product.price.toLocaleString('vi-VN')}đ</p>
            </a>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Thêm vào giỏ</button>
        </div>
    `).join('');
}

// Thêm sự kiện click cho sản phẩm
document.addEventListener('DOMContentLoaded', function() {
    // Hiển thị sản phẩm đã xem khi trang được tải
    displayRecentlyViewed();

    // Thêm sự kiện click cho tất cả links sản phẩm
    document.querySelectorAll('.product-link').forEach(productLink => {
        productLink.addEventListener('click', function(e) {
            const product = this.closest('.product');
            const productId = product.dataset.id;
            const productName = product.dataset.name;
            const productPrice = parseInt(product.dataset.price);
            const productImage = product.querySelector('img').src;
            
            const productData = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage
            };
            
            addToRecentlyViewed(productData);
        });
    });
});

// Thêm hàm addToCart cho sản phẩm đã xem
function addToCart(productId) {
    const product = document.querySelector(`.product[data-id="${productId}"]`);
    if (!product) return;

    const productName = product.querySelector('h3').textContent;
    const productPrice = parseInt(product.querySelector('.price').textContent.replace(/[^\d]/g, ''));
    
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
