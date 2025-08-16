document.addEventListener("DOMContentLoaded", () => {

    const defaultImg = 'https://via.placeholder.com/250x180?text=Image+Error';

    // --- IndexedDB для локального хранилища ---
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
                    console.error("IndexedDB не поддерживается");
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
            this.summaryCallbacks = [];
        }

        async init() {
            await this.storage.init();

            try {
                const res = await fetch("/api/cart");
                if (res.ok) {
                    const serverData = await res.json();
                    serverData.forEach(item => {
                        this.cart[item.dish_name] = {
                            qty: item.qty,
                            price: item.price,
                            image: item.image || defaultImg
                        };
                    });
                    this.storage.save(this.cart);
                }
            } catch (err) {
                console.error("Ошибка загрузки с сервера:", err);
                this.cart = await this.storage.load();
            }

            this.triggerSummaryUpdate();
        }

        registerSummaryCallback(callback) {
            if (typeof callback === "function") this.summaryCallbacks.push(callback);
        }

        triggerSummaryUpdate() {
            this.summaryCallbacks.forEach(cb => cb());
        }

        async syncServer() {
            try {
                const payload = Object.entries(this.cart).map(([name, data]) => ({
                    dish_name: name,
                    qty: data.qty,
                    price: data.price,
                    image: data.image || defaultImg
                }));
                await fetch("/api/cart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error("Ошибка синхронизации с сервером:", err);
            }
        }

        save() {
            this.storage.save(this.cart);
            this.syncServer();
            this.triggerSummaryUpdate();
        }

        addItem(name, price, image, qty = 1) {
            if (!image) image = defaultImg;
            if (this.cart[name]) {
                this.cart[name].qty += qty;
                this.cart[name].image = image;
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

        syncMenuUI() {
            document.querySelectorAll('.product-card').forEach(card => {
                const dishName = card.querySelector('.dish-name').textContent;
                const addBtn = card.querySelector('.add-to-cart');
                const quantitySelector = card.querySelector('.input-box--count');
                const quantityValue = quantitySelector?.querySelector('.quantity-value');

                if (this.cart[dishName]) {
                    if (quantityValue) quantityValue.textContent = this.cart[dishName].qty;
                    if (addBtn) addBtn.style.display = 'none';
                    if (quantitySelector) quantitySelector.classList.add('active');
                } else {
                    if (quantityValue) quantityValue.textContent = '1';
                    if (addBtn) addBtn.style.display = 'block';
                    if (quantitySelector) quantitySelector.classList.remove('active');
                }
            });
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

            // регистрируем callback для обновления summary
            this.cartManager.registerSummaryCallback(() => this.updateSummary());

            this.initNavigation();
            this.initClearCart();
            this.initLogoutSave();
        }

        initNavigation() {
            const showMenuBtn = document.querySelector('a[aria-label="Go to Menu"]');
            const showCartBtn = document.querySelector('a[aria-label="Go to Cart"]');
            if (showMenuBtn) showMenuBtn.addEventListener("click", e => { e.preventDefault(); window.location.href = "/visitor/menu"; });
            if (showCartBtn) showCartBtn.addEventListener("click", e => { e.preventDefault(); window.location.href = "/visitor/cart"; });
        }

        initClearCart() {
            if (!this.removeAllBtn) return;
            this.removeAllBtn.addEventListener("click", () => {
                this.cartManager.clearCart();
                this.renderCart();
                this.cartManager.syncMenuUI();
            });
        }

        initLogoutSave() {
            const logoutForm = document.querySelector("#logoutForm");
            if (logoutForm) {
                logoutForm.addEventListener("submit", async e => {
                    e.preventDefault();
                    await this.cartManager.syncServer();
                    logoutForm.submit();
                });
            }
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
            if (!entries.length) {
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
                    <img src="${data.image || defaultImg}"
                        alt="${dishName}" 
                        class="product__img product__img--object-cover" 
                        loading="lazy">
                </div>
                <div class="item-details">
                    <div class="basket__product-name-box">
                        <p class="product__name item-name">${dishName}</p>
                    </div>
                </div>
                <div class="item-controls">
                    <span class="item-price price__item price__item--rub price__item--bold current freebies">
                        ${data.price} ₽
                    </span>
                    <div class="input-box--count card__buy active">
                        <button class="quantity-btn dec" aria-label="Decrease quantity">-</button>
                        <span class="quantity-value">${data.qty}</span>
                        <button class="quantity-btn inc" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="delete-btn" aria-label="Remove item">🗑️</button>
                </div>
            `;


                itemEl.querySelector(".dec").addEventListener("click", () => { 
                    this.cartManager.decreaseItem(dishName); 
                    this.renderCart(); 
                    this.cartManager.syncMenuUI(); 
                });
                itemEl.querySelector(".inc").addEventListener("click", () => { 
                    this.cartManager.increaseItem(dishName); 
                    this.renderCart(); 
                    this.cartManager.syncMenuUI(); 
                });
                itemEl.querySelector(".delete-btn").addEventListener("click", () => { 
                    this.cartManager.removeItem(dishName); 
                    this.renderCart(); 
                    this.cartManager.syncMenuUI(); 
                });

                this.cartItemsContainer.appendChild(itemEl);
            });

            this.updateSummary();
        }
    }

    // --- Менеджер меню ---
    class MenuManager {
        constructor(cartManager) {
            this.cartManager = cartManager;
        }

        init() {
            document.querySelectorAll('.product-card').forEach(card => {
                const dishName = card.querySelector('.dish-name').textContent;
                const price = (card.querySelector('.price')?.textContent || "0").replace(/[₽\s]/g,'');
                const imgEl = card.querySelector('img');
                let img = imgEl?.src || defaultImg;

                if (imgEl) {
                    imgEl.addEventListener('error', () => {
                        imgEl.src = defaultImg;
                        img = defaultImg;
                    });
                }

                const addBtn = card.querySelector('.add-to-cart');
                const quantitySelector = card.querySelector('.input-box--count');
                const quantityValue = quantitySelector?.querySelector('.quantity-value');
                const minusBtn = quantitySelector?.querySelectorAll('.quantity-btn')[0];
                const plusBtn = quantitySelector?.querySelectorAll('.quantity-btn')[1];

                if (this.cartManager.cart[dishName]) {
                    quantityValue.textContent = this.cartManager.cart[dishName].qty;
                    addBtn.style.display = 'none';
                    quantitySelector.classList.add('active');
                }

                addBtn.addEventListener('click', () => {
                    const qty = parseInt(quantityValue.textContent);
                    this.cartManager.addItem(dishName, price, img, qty);
                    addBtn.style.display = 'none';
                    quantitySelector.classList.add('active');
                });

                minusBtn.addEventListener('click', () => {
                    if (parseInt(quantityValue.textContent) > 1) {
                        quantityValue.textContent = parseInt(quantityValue.textContent) - 1;
                        this.cartManager.decreaseItem(dishName);
                    } else {
                        quantitySelector.classList.remove('active');
                        addBtn.style.display = 'block';
                        quantityValue.textContent = '1';
                        this.cartManager.removeItem(dishName);
                    }
                });

                plusBtn.addEventListener('click', () => {
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
        cartManager.syncMenuUI();

        const cartUI = new CartUI(cartManager);
        const menuManager = new MenuManager(cartManager);
        menuManager.init();
        cartUI.renderCart();
    })();

});
