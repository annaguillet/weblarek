import "./scss/styles.scss";

// ==========================
// Импорты моделей
// ==========================
import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ProductsApi } from "./components/Models/ProductsApi";
import { Basket } from "./components/Models/Basket";
import { Buyer } from "./components/Models/Buyer";

// ==========================
// Импорты базовых классов и утилит
// ==========================
import { Api } from "./components/base/Api";
import { EventEmitter, IEvents } from "./components/base/Events";
import { ensureElement, cloneTemplate } from "./utils/utils";
import { API_URL, categoryMap, AppEvents } from "./utils/constants";

// ==========================
// Импорты представлений
// ==========================
import { Header } from "./components/views/HeaderViews";
import { Catalog } from "./components/views/Gallery";
import { ProductCard } from "./components/views/Card/CardGallery";
import { CardPreview } from "./components/views/Card/CardPreview";
import { BasketView } from "./components/views/BasketViews";
import { BasketItem } from "./components/views/Card/BasketItem";
import { Modal } from "./components/views/Order/Modal";
import { OrderForm } from "./components/views/Order/OrderForm";
import { ContactForm } from "./components/views/Order/ContactForm";
import { Success } from "./components/views/Order/Success";

import type { IProduct, IOrderRequest, IBuyer } from "./types";

// ==========================================================
// 1. ИНИЦИАЛИЗАЦИЯ ОСНОВНЫХ ОБЪЕКТОВ (модели, представления, API)
// ==========================================================
const events: IEvents = new EventEmitter();

const api = new Api(API_URL);
const productsApi = new ProductsApi(api);
const productCatalog = new ProductCatalog(events);
const basket = new Basket(events);
const buyer = new Buyer(events);

const header = new Header(events, ensureElement<HTMLElement>(".header"));
const catalogView = new Catalog(events, ensureElement<HTMLElement>(".gallery"));
const modal = new Modal(events, ensureElement<HTMLElement>("#modal-container"));

const orderForm = new OrderForm(events, cloneTemplate<HTMLElement>("#order"));
const contactForm = new ContactForm(events, cloneTemplate<HTMLElement>("#contacts"));
const successView = new Success(cloneTemplate<HTMLElement>("#success"), events);
const basketView = new BasketView(events, cloneTemplate<HTMLElement>("#basket"));

// ==========================================================
// 2. КАТАЛОГ ТОВАРОВ
// ==========================================================

// Обновление каталога после загрузки данных
events.on<{ catalog: IProduct[] }>(AppEvents.CATALOG_UPDATED, ({ catalog }) => {
  const template = ensureElement<HTMLTemplateElement>("#card-catalog");

  const cards = catalog.map((product) => {
    const element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const categoryKey = product.category?.toLowerCase() as keyof typeof categoryMap | undefined;

    new ProductCard(events, element, {
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      inBasket: basket.hasInBasket(product.id),
      category: categoryKey,
    }, {
      onClick: () => events.emit(AppEvents.PRODUCT_CLICKED, { product }),
    });

    return element;
  });

  catalogView.products = cards;
});

// Показ карточки товара в превью
events.on<{ product: IProduct }>(AppEvents.PRODUCT_CLICKED, ({ product }) => {
  productCatalog.setCardProduct(product);
});

// Рендер превью выбранного товара
events.on<{ product: IProduct }>(AppEvents.PRODUCT_SELECTED, ({ product }) => {
  const previewEl = cloneTemplate<HTMLElement>("#card-preview");
  const preview = new CardPreview(events, previewEl, {
    id: product.id,
    title: product.title,
    description: product.description || "",
    price: product.price,
    image: product.image,
    inBasket: basket.hasInBasket(product.id),
    category: product.category?.toLowerCase() as keyof typeof categoryMap | undefined,
  });

  modal.setContent(preview.render());
  modal.show();
});

// ==========================================================
// 3. КОРЗИНА
// ==========================================================

// Добавление / удаление товаров
events.on<{ id: string }>(AppEvents.BASKET_ADD, ({ id }) => {
  const product = productCatalog.getProduct(id);
  if (product) basket.addInBasket(product);
});

events.on<{ id: string }>(AppEvents.BASKET_REMOVE, ({ id }) => {
  const product = productCatalog.getProduct(id);
  if (product) basket.removeFromBasket(product);
});

// Обновление содержимого корзины
events.on<{ items: IProduct[] }>(AppEvents.BASKET_CHANGED, ({ items }) => {
  header.counter = items.length;

  const template = ensureElement<HTMLTemplateElement>("#card-basket");
  const basketItems = items.map((product, index) => {
    const el = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    el.dataset.id = product.id;

    new BasketItem(events, el, {
      id: product.id,
      title: product.title,
      price: product.price || 0,
      index: index + 1,
    });

    return el;
  });

  basketView.items = basketItems;
  basketView.count = items.length;
  basketView.priceText = `${basket.getBasketTotal()} синапсов`;
});

// Открытие корзины
events.on(AppEvents.BASKET_OPEN, () => {
  modal.setContent(basketView.render());
  modal.show();
});

// ==========================================================
// 4. ОФОРМЛЕНИЕ ЗАКАЗА
// ==========================================================

// Первый шаг — форма с адресом и оплатой
events.on(AppEvents.ORDER_START, () => {
  modal.setContent(orderForm.render());
  modal.show();
});

// Второй шаг — форма с контактами
events.on(AppEvents.ORDER_NEXT, () => {
  modal.setContent(contactForm.render());
  modal.show();
});

// Завершение — окно успеха
events.on<{ total: number }>(AppEvents.ORDER_SUCCESS, ({ total }) => {
  successView.setTotal(total);
  modal.setContent(successView.render());
  modal.show();
});

// ==========================================================
// 5. ПОКУПАТЕЛЬ (валидация и данные)
// ==========================================================
events.on<{ key: keyof IBuyer; value: string }>(AppEvents.BUYER_CHANGE, ({ key, value }) => {
  buyer.setBuyerData({ [key]: value });
});

// ==========================================================
// 6. ЗАКРЫТИЕ ОКНА УСПЕХА
// ==========================================================
events.on(AppEvents.SUCCESS_CLOSE, () => {
  modal.hide();
  events.emit(AppEvents.CATALOG_UPDATED); 
});

// ==========================================================
// 7. ОТПРАВКА ЗАКАЗА
// ==========================================================
events.on(AppEvents.ORDER_CONTACT_SUBMIT, async (data: { email: string; phone: string }) => {
  buyer.setBuyerData({ email: data.email, phone: data.phone });

  const buyerData = buyer.getBuyerData();
  const order: IOrderRequest = {
    items: basket.getBasket(),
    total: basket.getBasketTotal(),
    payment: buyerData.payment,
    email: buyerData.email,
    phone: buyerData.phone,
    address: buyerData.address,
  };

  try {
    await productsApi.sendOrder(order);
    basket.clearBasket();
    events.emit(AppEvents.ORDER_SUCCESS, { total: order.total });
  } catch {
    console.error("Ошибка при отправке заказа:");
    console.warn("Заказ не был отправлен. Проверьте подключение к серверу.");
  }
});

// ==========================================================
// 8. ЗАГРУЗКА ДАННЫХ С СЕРВЕРА
// ==========================================================
productsApi
  .fetchProducts()
  .then((products) => productCatalog.setCatalog(products))
  .catch(() => {
    console.error("❌ Ошибка при получении каталога:");
  });
