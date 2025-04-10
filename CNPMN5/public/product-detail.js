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
    },
    4: {
        name: "Sách dạy làm giàu",
        price: 1000000,
        image: "images/lamgiau.png"
    },
    5: {
        name: "Sách dạy kinh doanh online",
        price: 2000000,
        image: "images/online.png"
    },
    6: {
        name: "Cặp Sách Thời Trang",
        price: 350000,
        image: "images/capsach.jpg"
    },
    7: {
        name: "Mũ Thời Trang",
        price: 150000,
        image: "images/mu.png"
    },
    8: {
        name: "Quạt Mini Tiện Lợi",
        price: 200000,
        image: "images/quat.png"
    },
    9: {
        name: "Móc Khóa Xinh Xắn",
        price: 50000,
        image: "images/mockhoa.png"
    },
    10: {
        name: "Thắt Lưng Da Cao Cấp",
        price: 450000,
        image: "images/thatlung.png"
    },
    11: {
        name: "Đồng Hồ Thông Minh",
        price: 1500000,
        image: "images/dongho.png"
    },
    12: {
        name: "Ghế Gaming Cao Cấp",
        price: 3500000,
        image: "images/ghe.png"
    }
};

// Hiển thị thông tin sản phẩm
async function displayProduct() {
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

        // Hiển thị đánh giá trung bình
        await displayAverageRating();
    }
}

// Hiển thị đánh giá trung bình
async function displayAverageRating() {
    try {
        const response = await fetch(`/api/reviews/${productId}`);
        const reviews = await response.json();
        
        const averageRating = reviews.length > 0 
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
            : 0;
        
        const starsElement = document.querySelector('.rating-summary .stars');
        const ratingCountElement = document.querySelector('.rating-summary .rating-count');
        
        if (starsElement && ratingCountElement) {
            starsElement.textContent = '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating));
            ratingCountElement.textContent = `(${reviews.length} đánh giá)`;
        }
    } catch (error) {
        console.error('Lỗi khi lấy đánh giá:', error);
    }
}

// Hiển thị danh sách đánh giá
async function displayReviews(filterRating = 'all') {
    try {
        const response = await fetch(`/api/reviews/${productId}`);
        const reviews = await response.json();
        const reviewsList = document.getElementById('reviews-list');
        
        // Lọc đánh giá theo số sao nếu có
        const filteredReviews = filterRating === 'all' 
            ? reviews 
            : reviews.filter(review => review.rating === parseInt(filterRating));
        
        reviewsList.innerHTML = filteredReviews.length === 0 
            ? '<p>Chưa có đánh giá nào.</p>'
            : filteredReviews.map(review => `
                <div class="review-item">
                    <div class="review-user">
                        <img src="images/lionel.jpg.png" alt="Avatar" class="user-avatar">
                        <div class="user-info">
                            <div class="username">${review.username || 'Người dùng ẩn danh'}</div>
                            <div class="review-date">${review.date}</div>
                        </div>
                    </div>
                    <div class="review-details">
                        <div class="review-rating">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                        </div>
                        <div class="product-variation">
                            Phân loại hàng: ${review.variation || 'Mặc định'}
                        </div>
                        <div class="review-content">${review.text}</div>
                        ${review.images ? `
                            <div class="review-images">
                                ${review.images.map(img => `
                                    <img src="${img}" alt="Ảnh đánh giá" class="review-image">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="review-response">
                        <div class="seller-response">
                            <strong>Phản hồi của người bán:</strong>
                            <p>Cảm ơn bạn đã mua hàng và đánh giá sản phẩm. Chúng tôi rất vui khi bạn hài lòng với sản phẩm!</p>
                        </div>
                    </div>
                </div>
            `).join('');
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đánh giá:', error);
    }
}

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

// Xử lý gửi đánh giá
document.getElementById('submit-review')?.addEventListener('click', async () => {
    const reviewText = document.getElementById('review-text').value.trim();
    if (selectedRating === 0) {
        alert('Vui lòng chọn số sao đánh giá!');
        return;
    }
    if (!reviewText) {
        alert('Vui lòng nhập nội dung đánh giá!');
        return;
    }
    
    try {
        const response = await fetch(`/api/reviews/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'Người dùng ' + Math.floor(Math.random() * 1000), // Tạm thời tạo username ngẫu nhiên
                userAvatar: 'images/lionel.jpg.png',
                rating: selectedRating,
                text: reviewText,
                date: new Date().toLocaleDateString('vi-VN'),
                variation: document.querySelector('.product-variation-select')?.value || 'Mặc định'
            })
        });
        
        if (response.ok) {
            alert('Cảm ơn bạn đã đánh giá sản phẩm!');
            document.getElementById('review-text').value = '';
            selectedRating = 0;
            stars.forEach(star => star.style.color = 'gray');
            await displayAverageRating();
            await displayReviews();
        }
    } catch (error) {
        console.error('Lỗi khi gửi đánh giá:', error);
        alert('Không thể gửi đánh giá: ' + error.message);
    }
});

// Xử lý lọc đánh giá
document.getElementById('rating-filter')?.addEventListener('change', (e) => {
    displayReviews(e.target.value);
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

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    displayProduct();
    displayReviews();
    updateCartCount();
}); 