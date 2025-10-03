import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { ProductsApi } from './components/Models/ProductsApi';
import { Api } from './components/base/Api';
import { Catalog } from './components/views/Gallery';
import { ProductCard } from './components/views/Card/CardGallery';
import { EventEmitter, IEvents } from './components/base/Events';
import { API_URL, categoryMap } from './utils/constants';
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
      
      const categoryKey = product.category?.toLowerCase() as keyof typeof categoryMap | undefined;

      new ProductCard(events, cardElement, {
        id: product.id,
        title: product.title,
        price: product.price,
        inBasket: false,
        image: product.image,
        category: categoryKey
      });
     
  
      catalogContainer.appendChild(cardElement);
    });
  });

  

 // --- 5. Обработка клика по карточке ---
 events.on<{ product: IProduct }>('product:selected', ({ product }) => {
  const modal = document.querySelector('#modal-container') as HTMLElement;
  const modalContent = modal.querySelector('.modal__content') as HTMLElement;
  const template = document.querySelector<HTMLTemplateElement>('#card-preview');
  if (!template) throw new Error('Шаблон #card-preview не найден');

  const previewEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

  // Заполняем превью данными
  (previewEl.querySelector('.card__title') as HTMLElement).textContent = product.title;
  (previewEl.querySelector('.card__price') as HTMLElement).textContent = `${product.price} синапсов`;
  (previewEl.querySelector('.card__image') as HTMLImageElement).src = product.image;
  (previewEl.querySelector('.card__image') as HTMLImageElement).alt = product.title;
  (previewEl.querySelector('.card__category') as HTMLElement).textContent = product.category || '';
  (previewEl.querySelector('.card__text') as HTMLElement).textContent = product.description || '';

  // Рендерим в модалку
  modalContent.innerHTML = '';
  modalContent.appendChild(previewEl);
  modal.classList.add('modal_active');
});

// --- 6. Запрос товаров с сервера ---
productsApi.fetchProducts()
  .then((productsFromServer: IProduct[]) => {
    productCatalog.setCatalog(productsFromServer); // вызовет 'catalog:updated'
  })
  .catch(err => console.error('Ошибка при получении товаров с сервера:', err));
});
