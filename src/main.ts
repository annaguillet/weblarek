import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { ProductsApi } from './components/Models/ProductsApi';
import { Api } from './components/base/Api';
import { Catalog } from './components/views/Catalog';
import { ProductCard } from './components/views/ProductCard';
import { EventEmitter, IEvents } from './components/base/Events';
import { API_URL } from './utils/constants';
import type { IProduct } from './types';

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Контейнер галереи ---
  const catalogContainer = document.querySelector('.gallery') as HTMLElement;
  if (!catalogContainer) throw new Error('Контейнер .gallery не найден в DOM');

  // --- 2. Объект событий ---
  const events: IEvents = new EventEmitter();

  // --- 3. Модели и представления ---
  const productCatalog = new ProductCatalog(events);
  new Catalog(events, catalogContainer); // просто создаём экземпляр для подписки на события

  const api = new Api(API_URL);
  const productsApi = new ProductsApi(api);

  // --- 4. Подписка на событие обновления каталога ---
  events.on<{ catalog: IProduct[] }>('catalog:updated', (data) => {
    const products = data.catalog;
  
    const template = document.querySelector<HTMLTemplateElement>('#card-catalog');
    if (!template) throw new Error('Шаблон #card-catalog не найден');
  
    products.forEach((product) => {
      const cardElement = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  
      const card = new ProductCard(events, cardElement, {
        id: product.id,
        title: product.title,
        price: product.price,
        inBasket: false
      });
  
      catalogContainer.appendChild(cardElement);
    });
  });

  // --- 5. Запрос товаров с сервера ---
  productsApi.fetchProducts()
    .then((productsFromServer: IProduct[]) => {
      productCatalog.setCatalog(productsFromServer); // вызовет 'catalog:updated'
    })
    .catch(err => console.error('Ошибка при получении товаров с сервера:', err));
});



