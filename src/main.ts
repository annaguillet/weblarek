import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { ProductsApi } from './components/Models/ProductsApi';
import { Api } from './components/base/Api';
import { Catalog } from './components/views/Gallery';
import { ProductCard } from './components/views/Card/CardGallery';
import { EventEmitter, IEvents } from './components/base/Events';
import { API_URL, categoryMap } from './utils/constants';
import type { IProduct } from './types';

import { Basket } from './components/Models/Basket';
import { Header } from './components/views/header';
import { CartPreview } from './components/views/Card/CardPreview';
import { BasketItem } from './components/views/Card/BasketItem';
import { Modal } from './components/views/Order/Modal';
import { OrderForm } from './components/views/Order/OrderForm';
import { ContactForm } from './components/views/Order/ContactForm';



document.addEventListener('DOMContentLoaded', () => {
  // --------------------------
  // Основные объекты
  // --------------------------
  const events: IEvents = new EventEmitter();
  const basket = new Basket(events);
  

  const catalogContainer = document.querySelector('.gallery') as HTMLElement;
  if (!catalogContainer) throw new Error('Контейнер .gallery не найден');

  const headerContainer = document.querySelector('.header') as HTMLElement;
  const header = new Header(events, headerContainer);
  

  const productCatalog = new ProductCatalog(events);

  const api = new Api(API_URL);
  const productsApi = new ProductsApi(api);

  new Catalog(events, catalogContainer);

  const modalContainer = document.querySelector('#modal-container') as HTMLElement;
const modal = new Modal(events, modalContainer);
  // --------------------------
  // Обновление счетчика корзины
  // --------------------------
  events.on<{ items: IProduct[] }>('basket:changed', ({ items }) => {
    header.counter = items.length;
  });

  // --------------------------
  // Обновление каталога
  // --------------------------
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
        inBasket: basket.hasInBasket(product.id),
        image: product.image,
        category: categoryKey
      }, {
        onClick: () => events.emit('product:selected', { product })
      });

      catalogContainer.appendChild(cardElement);
    });
  });

  // --------------------------
  // Превью товара
  // --------------------------
  events.on<{ product: IProduct }>('product:selected', ({ product }) => {
    const modal = document.querySelector('#modal-container') as HTMLElement;
    const modalContent = modal.querySelector('.modal__content') as HTMLElement;
    const template = document.querySelector<HTMLTemplateElement>('#card-preview');
    if (!template || !modalContent) return;

    const previewEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

    // Сначала вставляем в DOM, потом создаём CartPreview
    modalContent.innerHTML = '';
    modalContent.appendChild(previewEl);
    modal.classList.add('modal_active');

    new CartPreview(events, previewEl, {
      id: product.id,
      title: product.title,
      description: product.description || '',
      price: product.price,
      inBasket: basket.hasInBasket(product.id),
      image: product.image,
      category: product.category?.toLowerCase() as keyof typeof categoryMap | undefined
    });

    // Закрытие модалки
    const closeBtn = modal.querySelector('.modal__close') as HTMLButtonElement;
    closeBtn.onclick = () => modal.classList.remove('modal_active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('modal_active'); };
  });

  // --------------------------
  // Добавление / удаление из корзины
  // --------------------------
  events.on<{ id: string }>('basket:add', ({ id }) => {
    const product = productCatalog.getProduct(id);
    if (product) basket.addInBasket(product);
  });

  events.on<{ id: string }>('basket:remove', ({ id }) => {
    const product = productCatalog.getProduct(id);
    if (product) basket.removeFromBasket(product);
  });

  // --------------------------
  // Открытие корзины и переход к форме заказа
  // --------------------------
  events.on('basket:open', () => {
    const basketTemplate = document.querySelector<HTMLTemplateElement>('#basket');
    const itemTemplate = document.querySelector<HTMLTemplateElement>('#card-basket');

    if (!basketTemplate || !itemTemplate) return;

    const basketEl = basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const listEl = basketEl.querySelector('.basket__list') as HTMLElement;
    const totalEl = basketEl.querySelector('.basket__price') as HTMLElement;

    basket.getBasket().forEach((product, index) => {
      const itemEl = itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
      new BasketItem(events, itemEl, {
        id: product.id,
        title: product.title,
        price: product.price || 0,
        index: index + 1
      });
      listEl.appendChild(itemEl);
    });

    totalEl.textContent = `${basket.getBasketTotal()} синапсов`;

    // Вставляем в модалку
    modal.setContent(basketEl);
    modal.show();

    // Обработка кнопки "Оформить"
    const orderBtn = basketEl.querySelector('.basket__button') as HTMLButtonElement;
    orderBtn.onclick = () => events.emit('order:start');
  });

  // --------------------------
  // Открытие формы заказа
  // --------------------------
  events.on('order:start', () => {
    const orderTemplate = document.querySelector<HTMLTemplateElement>('#order');
    if (!orderTemplate) return;

    const orderEl = orderTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    modal.setContent(orderEl);

    const orderForm = new OrderForm(events, orderEl);
  });

  // --------------------------
// Переход на ContactForm при клике "Далее"
// --------------------------
events.on('order:next', (data) => {
  // data = { payment, address }
  const contactsTemplate = document.querySelector<HTMLTemplateElement>('#contacts');
  if (!contactsTemplate) return;

  const contactsEl = contactsTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const contactForm = new ContactForm(events, contactsEl);

  // Показываем следующую форму в той же модалке
  modal.setContent(contactsEl);
});

// --------------------------
// Обработка отправки контактов
// --------------------------
events.on('order:submit', (data) => {
  console.log('Заказ отправлен', data);

  const successTemplate = document.querySelector<HTMLTemplateElement>('#success');
  if (!successTemplate) return;

  const successEl = successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;

  // Кнопка закрытия успеха
  const closeBtn = successEl.querySelector('.order-success__close') as HTMLButtonElement;
  closeBtn.onclick = () => modal.hide();

  modal.setContent(successEl);
});

  // --------------------------
  // Загрузка товаров с сервера
  // --------------------------
  productsApi.fetchProducts()
    .then(products => productCatalog.setCatalog(products))
    .catch(err => console.error('Ошибка при получении товаров с сервера:', err));
});