// Lấy thông tin sản phẩm từ URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Dữ liệu sản phẩm mẫu (trong thực tế sẽ lấy từ server)
const products = {
    1: {
        name: "Áo Thun Mát Mẻ",
        price: 200000,
        image: "images/ao-thun.jpg"
    },
    2: {
        name: "Quần Short Thoáng Mát",
        price: 250000,
        image: "images/quan-short.jpg"
    },
    3: {
        name: "Kính Mát Thời Trang",
        price: 300000,
        image: "images/kinh-mat.jpg"
    }
};

// Hiển thị thông tin sản phẩm
function displayProduct() {
    const product = products[productId];
    if (product) {
        document.getElementById('product-image').src = product.image;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `Giá: ${product.price.toLocaleString()}đ`;
        
        // Thêm data attributes cho container
        const container = document.getElementById('product-container');
        container.dataset.id = productId;
        container.dataset.name = product.name;
        container.dataset.price = product.price;
    }
}

// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.textContent = totalCount;
    }
}

// Xử lý thêm vào giỏ hàng
document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const container = document.getElementById('product-container');
    const productId = container.dataset.id;
    const productName = container.dataset.name;
    const productPrice = parseInt(container.dataset.price);
    
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
    alert("Đã thêm sản phẩm vào giỏ hàng!");
});

// Xử lý đánh giá sao
let selectedRating = 0;
const stars = document.querySelectorAll('.star');

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.rating);
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.rating) <= selectedRating ? 'gold' : 'gray';
        });
    });
});

// Lưu đánh giá vào localStorage
function saveReview(rating, text) {
    const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
    reviews.push({
        rating,
        text,
        date: new Date().toLocaleDateString('vi-VN')
    });
    localStorage.setItem(`reviews_${productId}`, JSON.stringify(reviews));
    displayReviews();
}

// Hiển thị đánh giá
function displayReviews() {
    const reviewsList = document.getElementById('reviews-list');
    const reviews = JSON.parse(localStorage.getItem(`reviews_${productId}`) || '[]');
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
            </div>
            <p class="review-text">${review.text}</p>
            <p class="review-date">${review.date}</p>
        </div>
    `).join('');
}

// Xử lý gửi đánh giá
document.getElementById('submit-review').addEventListener('click', () => {
    const reviewText = document.getElementById('review-text').value.trim();
    if (selectedRating === 0) {
        alert('Vui lòng chọn số sao đánh giá!');
        return;
    }
    if (!reviewText) {
        alert('Vui lòng nhập nội dung đánh giá!');
        return;
    }
    
    saveReview(selectedRating, reviewText);
    document.getElementById('review-text').value = '';
    selectedRating = 0;
    stars.forEach(star => star.style.color = 'gray');
});

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    displayProduct();
    displayReviews();
    updateCartCount();
}); 