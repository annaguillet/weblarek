import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { Basket } from './components/Models/Basket';
import { Buyer } from './components/Models/Buyer';
import { ProductsApi } from './components/Models/ProductsApi';
import { Api } from './components/base/Api';
import { API_URL } from './utils/constants';

import type { IBuyer } from './types';

// --- 1. Создаём экземпляры моделей данных ---
const catalog = new ProductCatalog();
const basket = new Basket();
const buyer = new Buyer();

// --- 2. Создаём экземпляр API и ProductsApi ---
const api = new Api(API_URL);
const productsApi = new ProductsApi(api);

// --- 3. Работа с сервером через ProductsApi ---
console.log('--- Запрос товаров с сервера ---');

productsApi.fetchProducts()
  .then(productsFromServer => {
    console.log('Товары, полученные с сервера:', productsFromServer);

    // Сохраняем массив в модели ProductCatalog
    catalog.setCatalog(productsFromServer);
    console.log('Массив товаров из модели после сохранения:', catalog.getCatalog());

    // Проверим выбор одного товара
    const firstProduct = catalog.getProduct(productsFromServer[0].id);
    catalog.setCardProduct(firstProduct!);
    console.log('Выбранный товар:', catalog.getCardProduct());

    // Тестируем корзину
    basket.addInBasket(productsFromServer[0]);
    basket.addInBasket(productsFromServer[1]);
    console.log('Корзина после добавления:', basket.getBasket());
    console.log('Количество товаров в корзине:', basket.getBasketCount());
    console.log('Общая стоимость корзины:', basket.getBasketTotal());

    basket.removeFromBasket(productsFromServer[0]);
    console.log('Корзина после удаления:', basket.getBasket());
    console.log('Есть ли товар с id первого продукта?', basket.hasInBasket(productsFromServer[0].id));

    // Тестируем Buyer
    const buyerData: IBuyer = {
      payment: 'card',
      address: 'ул. Какая-то, 12',
      email: 'test@example.com',
      phone: '+7 900 123-45-67',
    };

    buyer.setBuyerData(buyerData);
    console.log('Данные покупателя:', buyer.getBuyerData());
    console.log('Ошибки валидации:', buyer.validateBuyerData());

    buyer.clearBuyerData();
    console.log('Данные покупателя после очистки:', buyer.getBuyerData());
  })
  .catch(err => console.error('Ошибка при получении товаров с сервера:', err));

