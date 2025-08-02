document.addEventListener('DOMContentLoaded', () => {
  // Загружаем корзину из localStorage
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');

  // Обрабатываем каждую карточку
  document.querySelectorAll('.product-card').forEach(card => {
    const img = card.querySelector('img');
    img.addEventListener('error', () => {
      img.src = 'https://via.placeholder.com/250x180?text=Image+Error';
    });

    const dishName = card.querySelector('.dish-name').textContent;
    const addToCartBtn = card.querySelector('.add-to-cart');
    const quantitySelector = card.querySelector('.input-box--count');
    const quantityValue = card.querySelector('.quantity-value');
    const quantityBtnMinus = card.querySelector('.quantity-btn:first-child');
    const quantityBtnPlus = card.querySelector('.quantity-btn:last-child');

    if (cart[dishName]) {
      quantityValue.textContent = cart[dishName];
      addToCartBtn.style.display = 'none';
      quantitySelector.classList.add('active');
    }

    addToCartBtn.addEventListener('click', () => {
      addToCartBtn.style.display = 'none';
      quantitySelector.classList.add('active');
      cart[dishName] = parseInt(quantityValue.textContent);
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    quantityBtnMinus.addEventListener('click', () => {
      let value = parseInt(quantityValue.textContent);
      if (value > 1) {
        quantityValue.textContent = value - 1;
        cart[dishName] = value - 1;
      } else {
        quantitySelector.classList.remove('active');
        addToCartBtn.style.display = 'block';
        quantityValue.textContent = '1';
        delete cart[dishName];
      }
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    quantityBtnPlus.addEventListener('click', () => {
      let value = parseInt(quantityValue.textContent);
      quantityValue.textContent = value + 1;
      cart[dishName] = value + 1;
      localStorage.setItem('cart', JSON.stringify(cart));
    });
  });
});
