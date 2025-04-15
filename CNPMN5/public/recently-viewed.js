// Hiển thị sản phẩm đã xem gần đây
function displayRecentlyViewed() {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const container = document.getElementById('recently-viewed-container');
    
    if (!container) return;
    
    // Lấy 5 sản phẩm gần đây nhất
    const recentProducts = recentlyViewed.slice(-5).reverse();
    
    if (recentProducts.length === 0) {
        container.innerHTML = '<p>Bạn chưa xem sản phẩm nào gần đây.</p>';
        return;
    }
    
    container.innerHTML = `
        <h2>Sản phẩm đã xem gần đây</h2>
        <div class="recently-viewed-grid">
            ${recentProducts.map(product => `
                <div class="product-card">
                    <a href="product-detail.html?id=${product.id}">
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="price">${product.price.toLocaleString()}đ</p>
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// Thêm sản phẩm vào danh sách đã xem
function addToRecentlyViewed(product) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Loại bỏ sản phẩm trùng lặp
    recentlyViewed = recentlyViewed.filter(p => p.id !== product.id);
    
    // Thêm sản phẩm mới vào đầu danh sách
    recentlyViewed.push(product);
    
    // Giới hạn chỉ lưu 5 sản phẩm gần đây nhất
    if (recentlyViewed.length > 5) {
        recentlyViewed = recentlyViewed.slice(-5);
    }
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
} 