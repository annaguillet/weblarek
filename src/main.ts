import './scss/styles.scss';

import { ProductCatalog } from './components/Models/ProductCatalog';
import { ProductsApi } from './components/Models/ProductsApi';
import { Api } from './components/base/Api';
import { ProductCard } from './components/views/Card/CardGallery';
import { EventEmitter, IEvents } from './components/base/Events';
import { API_URL, categoryMap } from './utils/constants';
import type { IProduct } from './types';
import { Basket } from './components/Models/Basket';
import { Header } from './components/views/HeaderViews';
import { CardPreview } from './components/views/Card/CardPreview';
import { BasketItem } from './components/views/Card/BasketItem';
import { Modal } from './components/views/Order/Modal';
import { OrderForm } from './components/views/Order/OrderForm';
import { ContactForm } from './components/views/Order/ContactForm';
import { Success } from './components/views/Order/Success';
import { BasketView } from './components/views/BasketViews';

// --------------------------
// Основные объекты
// --------------------------
const events: IEvents = new EventEmitter();
const basket = new Basket(events);

const catalogContainer = document.querySelector('.gallery') as HTMLElement;
if (!catalogContainer) throw new Error('Контейнер .gallery не найден');

const headerContainer = document.querySelector('.header') as HTMLElement;
if (!headerContainer) throw new Error('Контейнер .header не найден');
const header = new Header(events, headerContainer);

const productCatalog = new ProductCatalog(events);
const api = new Api(API_URL);
const productsApi = new ProductsApi(api);

const modalContainer = document.querySelector('#modal-container') as HTMLElement;
if (!modalContainer) throw new Error('Контейнер #modal-container не найден');
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

    new ProductCard(
      events,
      cardElement,
      {
        id: product.id,
        title: product.title,
        price: product.price,
        inBasket: basket.hasInBasket(product.id),
        image: product.image,
        category: categoryKey,
      },
      {
        onClick: () => events.emit('product:selected', { product }),
      }
    );

    catalogContainer.appendChild(cardElement);
  });
});

// --------------------------
// Превью товара
// --------------------------
events.on<{ product: IProduct }>('product:selected', ({ product }) => {
  const template = document.querySelector<HTMLTemplateElement>('#card-preview');
  if (!template) return;

  const previewEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  modal.setContent(previewEl);
  modal.show();

  new CardPreview(events, previewEl, {
    id: product.id,
    title: product.title,
    description: product.description || '',
    price: product.price,
    inBasket: basket.hasInBasket(product.id),
    image: product.image,
    category: product.category?.toLowerCase() as keyof typeof categoryMap | undefined,
  });
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
// Рендер корзины
// --------------------------
function renderBasket() {
  const basketTemplate = document.querySelector<HTMLTemplateElement>('#basket');
  const itemTemplate = document.querySelector<HTMLTemplateElement>('#card-basket')!;
  if (!basketTemplate || !itemTemplate) return;

  const basketEl = basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const listEl = basketEl.querySelector('.basket__list') as HTMLElement;
  const totalEl = basketEl.querySelector('.basket__price') as HTMLElement;

  function renderBasketContents() {
    listEl.innerHTML = '';
    basket.getBasket().forEach((product, index) => {
      const itemEl = itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
      itemEl.dataset.id = product.id;

      new BasketItem(events, itemEl, {
        id: product.id,
        title: product.title,
        price: product.price || 0,
        index: index + 1,
      });

      listEl.appendChild(itemEl);
    });

    totalEl.textContent = `${basket.getBasketTotal()} синапсов`;
  }

  renderBasketContents();

  listEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.basket__item-delete');
    if (!btn) return;
    const li = (btn as HTMLElement).closest('.basket__item') as HTMLElement | null;
    const id = li?.dataset.id;
    if (id) events.emit('basket:remove', { id });
  });

  const orderBtn = basketEl.querySelector('.basket__button') as HTMLButtonElement;
  orderBtn.onclick = () => events.emit('order:start');

  events.on('basket:changed', renderBasketContents);

  modal.setContent(basketEl);
  modal.show();
}

events.on('basket:open', renderBasket);

// --------------------------
// Этапы заказа
// --------------------------
events.on('order:start', () => {
  const orderTemplate = document.querySelector<HTMLTemplateElement>('#order');
  if (!orderTemplate) return;
  const orderEl = orderTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  new OrderForm(events, orderEl);
  modal.setContent(orderEl);
});

events.on('order:next', () => {
  const contactsTemplate = document.querySelector<HTMLTemplateElement>('#contacts');
  if (!contactsTemplate) return;
  const contactsEl = contactsTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  new ContactForm(events, contactsEl);
  modal.setContent(contactsEl);
});

events.on('order:submit', () => {
  const total = basket.getBasketTotal();
  basket.clearBasket();

  const successTemplate = document.querySelector<HTMLTemplateElement>('#success');
  if (!successTemplate) return;

  const successEl = successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  modal.setContent(successEl);
  modal.show();

  const successComponent = new Success(successEl, events);
  successComponent.render({ total });
});

events.on('success:close', () => {
  modal.hide();
  events.emit('catalog:show');
});

// --------------------------
// Загрузка товаров с сервера
// --------------------------
productsApi
  .fetchProducts()
  .then(products => productCatalog.setCatalog(products))
  .catch(err => console.error('Ошибка при получении товаров с сервера:', err));
