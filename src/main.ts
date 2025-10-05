import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { ProductsApi } from './components/Models/ProductsApi';
import { Api } from './components/base/Api';
import { Catalog } from './components/views/Gallery';
import { ProductCard } from './components/views/Card/CardGallery';
import { EventEmitter, IEvents } from './components/base/Events';
import { API_URL, categoryMap, CDN_URL } from './utils/constants';
import type { IProduct } from './types';

document.addEventListener('DOMContentLoaded', () => {
  // --- Контейнер галереи ---
  const catalogContainer = document.querySelector('.gallery') as HTMLElement;
  if (!catalogContainer) throw new Error('Контейнер .gallery не найден');

  // --- События ---
  const events: IEvents = new EventEmitter();

  // --- Модели и представления ---
  const productCatalog = new ProductCatalog(events);
  new Catalog(events, catalogContainer);

  const api = new Api(API_URL);
  const productsApi = new ProductsApi(api);

  // --- Обновление каталога ---
  events.on<{ catalog: IProduct[] }>('catalog:updated', ({ catalog }) => {
    const template = document.querySelector<HTMLTemplateElement>('#card-catalog');
    if (!template) throw new Error('Шаблон #card-catalog не найден');

    catalogContainer.innerHTML = '';

    catalog.forEach(product => {
      const cardElement = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
      const categoryKey = product.category?.toLowerCase() as keyof typeof categoryMap | undefined;

      new ProductCard(events, cardElement, {
        id: product.id,
        title: product.title,
        price: product.price,
        inBasket: false,
        image: product.image,
        category: categoryKey
      }, {
        onClick: () => events.emit('product:selected', { product })
      });

      catalogContainer.appendChild(cardElement);
    });
  });

  // --- Открытие превью при клике ---
  events.on<{ product: IProduct }>('product:selected', ({ product }) => {
    const modal = document.querySelector('#modal-container') as HTMLElement;
    const modalContent = modal.querySelector('.modal__content') as HTMLElement;
    const template = document.querySelector<HTMLTemplateElement>('#card-preview');
    if (!template || !modalContent) return;

    const previewEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

    // Заголовок и текст
    (previewEl.querySelector('.card__title') as HTMLElement).textContent = product.title;
    (previewEl.querySelector('.card__text') as HTMLElement).textContent = product.description || '';

    // Цена
    (previewEl.querySelector('.card__price') as HTMLElement).textContent =
      product.price !== null ? `${product.price} синапсов` : 'Недоступно';

    // Картинка
    const img = previewEl.querySelector('.card__image') as HTMLImageElement;
    img.src = product.image ? `${CDN_URL}/${product.image}` : '/images/placeholder.png';
    img.alt = product.title;

    // Категория
    const catEl = previewEl.querySelector('.card__category') as HTMLElement;
    catEl.textContent = product.category || '';
    catEl.className = 'card__category'; // сброс всех модификаторов
    if (product.category) {
      const cls = categoryMap[product.category as keyof typeof categoryMap];
      if (cls) catEl.classList.add(cls);
    }

    // Рендер в модалку
    modalContent.innerHTML = '';
    modalContent.appendChild(previewEl);
    modal.classList.add('modal_active');

    // Закрытие
    const closeBtn = modal.querySelector('.modal__close') as HTMLButtonElement;
    closeBtn.onclick = () => modal.classList.remove('modal_active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('modal_active'); };
  });

  // --- Загрузка товаров с сервера ---
  productsApi.fetchProducts()
    .then(products => productCatalog.setCatalog(products))
    .catch(err => console.error('Ошибка при получении товаров с сервера:', err));
});
