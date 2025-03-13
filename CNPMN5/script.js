document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", (event) => {
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
        });
    });

    if (document.getElementById("cart-items")) {
        displayCart();
    }
});

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-count").textContent = totalCount;
}

function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";

    cart.forEach(item => {
        let div = document.createElement("div");
        div.textContent = `${item.name} - ${item.quantity} x ${item.price}đ`;
        cartContainer.appendChild(div);
    });

    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("cart-total").textContent = total.toLocaleString();
}

function clearCart() {
    localStorage.removeItem("cart");
    window.location.href = "index.html";
}
