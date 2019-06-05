'use strict'

const Storage = (function () {

  function createCell() {
    const storageCell = {
      productsInStorage: []
    }

    localStorage.setItem('products', JSON.stringify(storageCell));

  }

  function getFromLocalStorage() {
    return JSON.parse(localStorage.getItem('products'));
  }

  function addToLocalStorage(productSettings) {
    const products = getFromLocalStorage();
    let inStorage = false;

    products.productsInStorage.forEach(function (product) {
      if (product.name === productSettings.name) {
        product.amount = ++product.amount;
        inStorage = true;
      }
    });

    if (!inStorage) {
      products.productsInStorage.push(productSettings);
    }

    localStorage.setItem('products', JSON.stringify(products));
  }

  function clearAllLocalStorage() {
    localStorage.clear();
  }

  function updateLocalStorage(elementToDelete) {
    const products = getFromLocalStorage();
    products.productsInStorage = products.productsInStorage.filter(function (product) {
      return product.name !== elementToDelete;
    });

    localStorage.setItem('products', JSON.stringify(products));
  }

  return {
    createCell: createCell,
    getFromLocalStorage: getFromLocalStorage,
    addToLocalStorage: addToLocalStorage,
    clearAllLocalStorage: clearAllLocalStorage,
    updateLocalStorage: updateLocalStorage
  }

})();

const Basket = (function (Storage) {
  const basketButton = document.querySelector('.button');
  const basket = document.querySelector('.basket');
  const basketTotal = document.querySelector('.basket__total-amount');
  const basketButtonTotal = document.querySelector('.button__items-total');
  const basketButtonAmount = document.querySelector('.button__items-amount');
  const basketProductWrapper = document.querySelector('.basket__products');
  const clearBasketButton = document.querySelector('.basket__btn .btn');
  const mainBody = document.querySelector('.main');

  function openBasket() {
    basket.classList.toggle('basket_open');
  }

  function setTotal() {
    const total = [];
    const productsInBasket = document.querySelectorAll('.basket__product');

    productsInBasket.forEach(function (product) {
      const productPrice = parseFloat(product.querySelector('.basket__product-amount').textContent);
      const productAmount = parseFloat(product.querySelector('.basket__product-sum').textContent);

      total.push(productPrice * productAmount);
    });

    const totalPrice = total.reduce(function (total, item) {
      return total + item;
    }, 0);

    const finalPrice = totalPrice.toFixed(2);

    basketButtonAmount.textContent = total.length;
    basketButtonTotal.textContent = finalPrice;
    basketTotal.textContent = finalPrice;

  }

  function clearTotal() {
    basketButtonAmount.textContent = 0;
    basketButtonTotal.textContent = 0;
    basketTotal.textContent = 0;

  }

  function deleteAllProducts() {
    while (basketProductWrapper.children.length > 0) {
      basketProductWrapper.removeChild(basketProductWrapper.firstElementChild);
    }

    clearTotal();
    Storage.clearAllLocalStorage();
  }

  function clearBasket() {
    const basketProducts = document.querySelectorAll('.basket__product');
    basketProducts.forEach(function (product) {
      product.addEventListener('animationend', deleteAllProducts);
      product.classList.add('clear-basket');
    });
  }

  function deleteCurentProduct(e) {
    if (e.target.classList.contains('fa-trash-alt')) {
      const curentProduct = e.target.parentNode.parentNode;
      const nameOfProduct = e.target.parentNode.previousElementSibling.firstElementChild.textContent;

      curentProduct.addEventListener('animationend', function () {
        curentProduct.parentNode.removeChild(curentProduct);
        setTotal();
        Storage.updateLocalStorage(nameOfProduct);
      });
      curentProduct.classList.add('delete-product');
    }
  }

  function createCardTemplate(cardSettings) {
    const cartItem = document.createElement('div');
    cartItem.classList.add('basket__product');
    cartItem.innerHTML =
      `<div class="basket__pic">
            <img src="${cardSettings.imagePath}" alt="" class="basket__img">
          </div>
          <div class="basket__product-sum">${cardSettings.amount}</div>
          <div class="basket__desc">
            <div class="basket__product-name">${cardSettings.name}</div>
            <div class="basket__product-price">
              <span class="basket__product-curr">$</span>
              <span class="basket__product-amount">${cardSettings.price}</span>
            </div>
          </div>
          <div class="basket__product-delete">
            <i class="far fa-trash-alt"></i>
          </div>`
    return cartItem;
  }

  function updateFromStorage() {
    try {
      const productsInStorage = Storage.getFromLocalStorage().productsInStorage;
      productsInStorage.forEach(function (product) {
        basketProductWrapper.appendChild(createCardTemplate(product));
      });
      setTotal();
    } catch (error) {
      console.log(`${error.message} - storage is empty.`);
    }
  }

  basketButton.addEventListener('click', openBasket);
  clearBasketButton.addEventListener('click', clearBasket);
  // deleteProductBtns.forEach(function(btn) {
  //     btn.addEventListener('click', deleteCurentProduct);
  //   });
  mainBody.addEventListener('click', deleteCurentProduct);

  return {
    basketButton: basketButton,
    basketButtonTotal: basketButtonTotal,
    basket: basket,
    basketProductWrapper: basketProductWrapper,
    setTotal: setTotal,
    updateFromStorage: updateFromStorage,
    createCardTemplate: createCardTemplate
  }

})(Storage);

Basket.updateFromStorage();

const CardProduct = (function (Basket, Storage) {
  const addToBasketBtns = document.querySelectorAll('.fa-shopping-basket');

  function addToBasket(e) {
    const productSettings = {};
    const productsInBasket = document.querySelectorAll('.basket__product');
    let inBasket = false;

    productSettings.imagePath = e.target.parentNode.previousElementSibling.src;
    productSettings.amount = 1;
    productSettings.name = e.target.parentNode.parentNode.nextElementSibling.firstElementChild.textContent;
    productSettings.price = e.target.parentNode.parentNode.nextElementSibling.lastElementChild.lastElementChild.textContent;


    if (!localStorage.getItem('products')) {
      Storage.createCell();
    }

    Storage.addToLocalStorage(productSettings);

    productsInBasket.forEach(function (product) {
      const curentProductName = product.querySelector('.basket__product-name').textContent;

      if (productSettings.name === curentProductName) {
        let curentProductSum = product.querySelector('.basket__product-sum');
        let sum = parseFloat(curentProductSum.textContent);
        curentProductSum.textContent = ++sum;
        inBasket = true;
      }
    });

    if (!inBasket) {
      Basket.basketProductWrapper.appendChild(Basket.createCardTemplate(productSettings));
    }

    Basket.setTotal();
    alert(`${productSettings.name} added to the basket`);
  }

  addToBasketBtns.forEach(function (btn) {
    btn.addEventListener('click', addToBasket);
  });

})(Basket, Storage);