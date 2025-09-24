import './scss/styles.scss';
import { ProductCatalog } from './components/base/Models/ProductCatalog';
import { Basket } from './components/base/Models/Basket';
import { Buyer } from './components/base/Models/Buyer';
import { ProductsApi } from './components/base/Models/ProductsApi';
import { apiProducts } from './utils/data'; // тестовые данные для проверки
import type { IProduct, IBuyer } from './types';

// --- 1. Создаём экземпляры моделей данных ---
const catalog = new ProductCatalog();
const basket = new Basket();
const buyer = new Buyer();

// --- 2. Тестирование ProductCatalog ---
console.log('--- Тест ProductCatalog ---');
catalog.setCatalog(apiProducts.items);
console.log('Массив товаров из каталога:', catalog.getCatalog());

const selectedProduct = catalog.getProduct('1');
catalog.setCardProduct(selectedProduct!);
console.log('Выбранный товар:', catalog.getCardProduct());

// --- 3. Тестирование Basket ---
console.log('--- Тест Basket ---');
basket.addInBasket(apiProducts.items[0]);
basket.addInBasket(apiProducts.items[1]);
console.log('Корзина после добавления:', basket.getBasket());
console.log('Количество товаров в корзине:', basket.getBasketCount());
console.log('Общая стоимость корзины:', basket.getBasketTotal());

basket.removeFromBasket(apiProducts.items[0]);
console.log('Корзина после удаления:', basket.getBasket());
console.log('Есть ли товар с id=1?', basket.hasInBasket('1'));

// --- 4. Тестирование Buyer ---
console.log('--- Тест Buyer ---');
const buyerData: IBuyer = {
  payment: 'card',
  address: 'ул. Примерная, 12',
  email: 'test@example.com',
  phone: '+7 900 123-45-67',
};

buyer.setBuyerData(buyerData);
console.log('Данные покупателя:', buyer.getBuyerData());
console.log('Ошибки валидации:', buyer.validateBuyerData());

buyer.clearBuyerData();
console.log('Данные покупателя после очистки:', buyer.getBuyerData());

// --- 3. Работа с сервером через ProductsApi ---
console.log('--- Тест ProductsApi (сервер) ---');

// Создаём экземпляр ProductsApi
const productsApi = new ProductsApi('https://larek-api.nomoreparties.co/weblarek.postman.json'); // baseUrl передаётся напрямую

// Получаем каталог товаров с сервера
productsApi.fetchProducts()
  .then(productsFromServer => {
    console.log('Товары, полученные с сервера:', productsFromServer);

    // Сохраняем массив в модели ProductCatalog
    catalog.setCatalog(productsFromServer);
    console.log('Массив товаров из модели после сохранения:', catalog.getCatalog());
  })
  .catch(err => console.error('Ошибка при получении товаров с сервера:', err));

