document.addEventListener("DOMContentLoaded", () => {

    // --- Хранилище корзины на IndexedDB ---
    class CartStorage {
        constructor(dbName = "CartDB", storeName = "cart") {
            this.dbName = dbName;
            this.storeName = storeName;
            this.dbVersion = 1;
            this.db = null;
        }

        init() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    console.error("IndexedDB не поддерживается этим браузером");
                    reject("IndexedDB not supported");
                    return;
                }

                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onupgradeneeded = (e) => {
                    this.db = e.target.result;
                    if (!this.db.objectStoreNames.contains(this.storeName)) {
                        this.db.createObjectStore(this.storeName, { keyPath: "name" });
                    }
                };

                request.onsuccess = (e) => {
                    this.db = e.target.result;
                    resolve();
                };

                request.onerror = (e) => reject(e);
            });
        }

        save(cart) {
            if (!this.db) return;
            const tx = this.db.transaction(this.storeName, "readwrite");
            const store = tx.objectStore(this.storeName);
            store.clear();
            Object.entries(cart).forEach(([name, data]) => {
                store.put({ name, ...data });
            });
        }

        load() {
            return new Promise((resolve) => {
                if (!this.db) return resolve({});
                const tx = this.db.transaction(this.storeName, "readonly");
                const store = tx.objectStore(this.storeName);
                const req = store.getAll();
                req.onsuccess = () => {
                    const cart = {};
                    req.result.forEach(item => {
                        cart[item.name] = { qty: item.qty, price: item.price, image: item.image };
                    });
                    resolve(cart);
                };
                req.onerror = () => resolve({});
            });
        }
    }

    // --- Менеджер корзины ---
    class CartManager {
        constructor(storage) {
            this.storage = storage;
            this.cart = {};
        }

        async init() {
            await this.storage.init();
            this.cart = await this.storage.load();
        }

        save() {
            this.storage.save(this.cart);
        }

        addItem(name, price, image, qty = 1) {
            if (this.cart[name]) {
                this.cart[name].qty += qty;
            } else {
                this.cart[name] = { qty, price, image };
            }
            this.save();
        }

        increaseItem(name) {
            if (this.cart[name]) {
                this.cart[name].qty++;
                this.save();
            }
        }

        decreaseItem(name) {
            if (!this.cart[name]) return;
            if (this.cart[name].qty > 1) this.cart[name].qty--;
            else delete this.cart[name];
            this.save();
        }

        removeItem(name) {
            if (this.cart[name]) {
                delete this.cart[name];
                this.save();
            }
        }

        clearCart() {
            this.cart = {};
            this.save();
        }

        getSummary() {
            let totalItems = 0;
            let totalPrice = 0;
            Object.values(this.cart).forEach(item => {
                totalItems += item.qty;
                totalPrice += item.qty * parseFloat(item.price);
            });
            return { totalItems, totalPrice };
        }
    }

    // --- UI корзины ---
    class CartUI {
        constructor(cartManager) {
            this.cartManager = cartManager;
            this.cartItemsContainer = document.querySelector(".cart-items");
            this.mealPriceEl = document.querySelector(".meal-price");
            this.totalPriceEl = document.querySelector(".price-value");
            this.removeAllBtn = document.querySelector(".remove-all");

            this.initNavigation();
            this.initClearCart();
        }

        // Навигация теперь через Flask-маршруты
        initNavigation() {
            const showMenuBtn = document.querySelector('a[aria-label="Go to Menu"]');
            const showCartBtn = document.querySelector('a[aria-label="Go to Cart"]');

            if (showMenuBtn) {
                showMenuBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.location.href = "/visitor/menu";
                });
            }

            if (showCartBtn) {
                showCartBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.location.href = "/visitor/cart";
                });
            }
        }

        initClearCart() {
            if (!this.removeAllBtn) return;
            this.removeAllBtn.addEventListener("click", () => {
                this.cartManager.clearCart();
                this.renderCart();
                this.cartManager.syncMenuUI && this.cartManager.syncMenuUI();
            });
        }

        updateSummary() {
            const { totalItems, totalPrice } = this.cartManager.getSummary();
            if (this.mealPriceEl) this.mealPriceEl.textContent = `${totalItems} pcs`;
            if (this.totalPriceEl) this.totalPriceEl.textContent = `${totalPrice.toFixed(2)} ₽`;
        }

        renderCart() {
            if (!this.cartItemsContainer) return;
            this.cartItemsContainer.innerHTML = `<h3 class="title__text--offsets-none">Your Order</h3>`;

            const entries = Object.entries(this.cartManager.cart);
            if (entries.length === 0) {
                const emptyEl = document.createElement("p");
                emptyEl.textContent = "Cart is empty";
                emptyEl.style.fontWeight = "500";
                emptyEl.style.fontSize = "16px";
                emptyEl.style.color = "#2f2f2f";
                emptyEl.style.marginTop = "20px";
                this.cartItemsContainer.appendChild(emptyEl);
                this.updateSummary();
                return;
            }

            entries.forEach(([dishName, data]) => {
                const itemEl = document.createElement("div");
                itemEl.classList.add("cart-item");
                itemEl.innerHTML = `
                    <div class="product__img-box">
                        <img src="${data.image || 'https://via.placeholder.com/100'}" alt="${dishName}" class="product__img product__img--object-cover" loading="lazy">
                    </div>
                    <div class="item-details">
                        <div class="basket__product-name-box">
                            <p class="product__name item-name">${dishName}</p>
                        </div>
                    </div>
                    <div class="item-controls">
                        <span class="item-price price__item price__item--rub price__item--bold current freebies">${data.price} ₽</span>
                        <div class="input-box--count card__buy active">
                            <button class="quantity-btn dec" aria-label="Decrease quantity">-</button>
                            <span class="quantity-value">${data.qty}</span>
                            <button class="quantity-btn inc" aria-label="Increase quantity">+</button>
                        </div>
                        <button class="delete-btn" aria-label="Remove item">🗑️</button>
                    </div>
                `;

                itemEl.querySelector(".quantity-btn.dec").addEventListener("click", () => {
                    this.cartManager.decreaseItem(dishName);
                    this.renderCart();
                    this.cartManager.syncMenuUI && this.cartManager.syncMenuUI();
                });

                itemEl.querySelector(".quantity-btn.inc").addEventListener("click", () => {
                    this.cartManager.increaseItem(dishName);
                    this.renderCart();
                    this.cartManager.syncMenuUI && this.cartManager.syncMenuUI();
                });

                itemEl.querySelector(".delete-btn").addEventListener("click", () => {
                    this.cartManager.removeItem(dishName);
                    this.renderCart();
                    this.cartManager.syncMenuUI && this.cartManager.syncMenuUI();
                });

                this.cartItemsContainer.appendChild(itemEl);
            });

            this.updateSummary();
        }
    }

    // --- Логика меню ---
    class MenuManager {
        constructor(cartManager) {
            this.cartManager = cartManager;
        }

        init() {
            document.querySelectorAll('.product-card').forEach(card => {
                const dishName = card.querySelector('.dish-name').textContent;
                const priceRaw = card.querySelector('.price')?.textContent || "0";
                const price = priceRaw.replace(/[₽\s]/g, '');
                const img = card.querySelector('img');
                const defaultImg = 'https://via.placeholder.com/250x180?text=Image+Error';

                if (img) {
                    img.addEventListener('error', () => {
                        img.src = defaultImg;
                    });
                }

                const addToCartBtn = card.querySelector('.add-to-cart');
                const quantitySelector = card.querySelector('.input-box--count');
                const quantityValue = quantitySelector?.querySelector('.quantity-value');
                const quantityBtnMinus = quantitySelector?.querySelectorAll('.quantity-btn')[0];
                const quantityBtnPlus = quantitySelector?.querySelectorAll('.quantity-btn')[1];

                if (this.cartManager.cart[dishName]) {
                    quantityValue.textContent = this.cartManager.cart[dishName].qty;
                    addToCartBtn.style.display = 'none';
                    quantitySelector.classList.add('active');
                }

                addToCartBtn.addEventListener('click', () => {
                    const qty = parseInt(quantityValue.textContent);
                    this.cartManager.addItem(dishName, price, img?.src || defaultImg, qty);
                    addToCartBtn.style.display = 'none';
                    quantitySelector.classList.add('active');
                });

                quantityBtnMinus.addEventListener('click', () => {
                    if (parseInt(quantityValue.textContent) > 1) {
                        quantityValue.textContent = parseInt(quantityValue.textContent) - 1;
                        this.cartManager.decreaseItem(dishName);
                    } else {
                        quantitySelector.classList.remove('active');
                        addToCartBtn.style.display = 'block';
                        quantityValue.textContent = '1';
                        this.cartManager.removeItem(dishName);
                    }
                });

                quantityBtnPlus.addEventListener('click', () => {
                    quantityValue.textContent = parseInt(quantityValue.textContent) + 1;
                    this.cartManager.increaseItem(dishName);
                });
            });
        }
    }

    // --- Инициализация ---
    (async () => {
        const storage = new CartStorage();
        const cartManager = new CartManager(storage);

        await cartManager.init();

        cartManager.syncMenuUI = () => {
            document.querySelectorAll('.product-card').forEach(card => {
                const dishName = card.querySelector('.dish-name').textContent;
                const addToCartBtn = card.querySelector('.add-to-cart');
                const quantitySelector = card.querySelector('.input-box--count');
                const quantityValue = quantitySelector?.querySelector('.quantity-value');

                if (cartManager.cart[dishName]) {
                    quantityValue.textContent = cartManager.cart[dishName].qty;
                    addToCartBtn.style.display = 'none';
                    quantitySelector.classList.add('active');
                } else {
                    quantityValue.textContent = '1';
                    addToCartBtn.style.display = 'block';
                    quantitySelector.classList.remove('active');
                }
            });
        };

        const cartUI = new CartUI(cartManager);
        const menuManager = new MenuManager(cartManager);
        menuManager.init();
        cartUI.renderCart();
    })();

});
