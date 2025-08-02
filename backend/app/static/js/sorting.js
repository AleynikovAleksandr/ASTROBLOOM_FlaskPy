document.addEventListener('DOMContentLoaded', () => {
  const sortingLinks = document.querySelectorAll('.sorting-bar a');
  const productList = document.querySelector('.product-list');
  const defaultCardsOrder = Array.from(productList.children);

  const extractPrice = (element) => {
    const priceText = element.querySelector('.price').textContent;
    const numeric = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(numeric);
  };

  sortingLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      sortingLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const sortType = link.textContent;
      let cards = Array.from(productList.querySelectorAll('.product-card'));

      if (sortType === 'Highest Price') {
        cards.sort((a, b) => extractPrice(b) - extractPrice(a));
      } else if (sortType === 'Lowest Price') {
        cards.sort((a, b) => extractPrice(a) - extractPrice(b));
      } else if (sortType === 'By Name') {
        cards.sort((a, b) => {
          const nameA = a.querySelector('.dish-name').textContent;
          const nameB = b.querySelector('.dish-name').textContent;
          return nameA.localeCompare(nameB);
        });
      } else if (sortType === 'Default') {
        cards = defaultCardsOrder;
      }

      productList.innerHTML = '';
      cards.forEach(card => productList.appendChild(card));
    });
  });
});
