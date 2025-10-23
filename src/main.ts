import "./scss/styles.scss";

import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ProductsApi } from "./components/Models/ProductsApi";
import { Api } from "./components/base/Api";
import { ensureElement, cloneTemplate} from "./utils/utils";
import { ProductCard } from "./components/views/Card/CardGallery";
import { EventEmitter, IEvents } from "./components/base/Events";
import { API_URL, categoryMap, AppEvents  } from "./utils/constants";
import type { IProduct } from "./types";
import { Basket } from "./components/Models/Basket";
import { Header } from "./components/views/HeaderViews";
import { CardPreview } from "./components/views/Card/CardPreview";
import { Modal } from "./components/views/Order/Modal";
import { OrderForm } from "./components/views/Order/OrderForm";
import { ContactForm } from "./components/views/Order/ContactForm";
import { Success } from "./components/views/Order/Success";
import { BasketView } from "./components/views/BasketViews";
import { BasketItem } from "./components/views/Card/BasketItem";
import { Catalog } from "./components/views/Gallery";
import type { IOrderRequest, IBuyer } from "../src/types/index";
import { Buyer } from "./components/Models/Buyer";

// ==========================
// ИНИЦИАЛИЗАЦИЯ ОСНОВНЫХ ОБЪЕКТОВ
// ==========================
const events: IEvents = new EventEmitter();
const basket = new Basket(events);
const buyer = new Buyer(events);
const productCatalog = new ProductCatalog(events);
const api = new Api(API_URL);
const productsApi = new ProductsApi(api);

const header = new Header(events, ensureElement<HTMLElement>(".header"));
const catalogView = new Catalog(events, ensureElement<HTMLElement>(".gallery"));
const modal = new Modal(events, ensureElement<HTMLElement>("#modal-container"));

const orderForm = new OrderForm(events, cloneTemplate<HTMLElement>("#order"));
const contactForm = new ContactForm(events, cloneTemplate<HTMLElement>("#contacts"));
const successView = new Success(cloneTemplate<HTMLElement>("#success"), events);
const basketView = new BasketView(events, cloneTemplate<HTMLElement>("#basket"));

// ==========================
// ОБНОВЛЕНИЕ КАТАЛОГА
// ==========================
events.on<{ catalog: IProduct[] }>(AppEvents.CATALOG_UPDATED , ({ catalog }) => {
  const template = ensureElement<HTMLTemplateElement>("#card-catalog");
  const cards = catalog.map((product) => {
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
        onClick: () => events.emit(AppEvents.PRODUCT_CLICKED, { product }),
      }
    );

    return cardElement;
  });

  catalogView.products = cards;
});

// ==========================
// ПРЕВЬЮ ТОВАРА
// ==========================
events.on<{ product: IProduct }>(AppEvents.PRODUCT_CLICKED, ({ product }) => {
  productCatalog.setCardProduct(product);
});

events.on<{ product: IProduct }>(AppEvents.PRODUCT_SELECTED, ({ product }) => {
  const previewEl = cloneTemplate<HTMLElement>("#card-preview");
  const preview = new CardPreview(events, previewEl, {
    id: product.id,
    title: product.title,
    description: product.description || "",
    price: product.price,
    inBasket: basket.hasInBasket(product.id),
    image: product.image,
    category: product.category?.toLowerCase() as keyof typeof categoryMap | undefined,
  });

  modal.setContent(preview.render());
  modal.show();
});

// ==========================
// ДОБАВЛЕНИЕ / УДАЛЕНИЕ ТОВАРОВ
// ==========================
events.on<{ id: string }>( AppEvents.BASKET_ADD, ({ id }) => {
  const product = productCatalog.getProduct(id);
  if (product) basket.addInBasket(product);
});

events.on<{ id: string }>(AppEvents.BASKET_REMOVE, ({ id }) => {
  const product = productCatalog.getProduct(id);
  if (product) basket.removeFromBasket(product);
});

// ==========================
// ОБНОВЛЕНИЕ КОРЗИНЫ
// ==========================
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

// ==========================
// ОТКРЫТИЕ КОРЗИНЫ
// ==========================
events.on(AppEvents.BASKET_OPEN, () => {
  modal.setContent(basketView.render());
  modal.show();
});

// ==========================
// Этапы оформления заказа
// ==========================

// 1. Начало оформления — показываем форму заказа
events.on(AppEvents.ORDER_START, () => {
  modal.setContent(orderForm.render());
  modal.show();
});

// 2. Переход ко второй форме — контакты
events.on(AppEvents.ORDER_NEXT, () => {
  modal.setContent(contactForm.render());
  modal.show();
});

// 3. Успешное оформление заказа — показываем окно успеха
events.on<{ total: number }>(AppEvents.ORDER_SUCCESS, ({ total }) => {
  successView.setTotal(total);
  modal.setContent(successView.render());
  modal.show();
});

// ==========================
// Обновление данных покупателя при вводе в формах
// ==========================
events.on<{ key: keyof IBuyer; value: string }>(AppEvents.BUYER_CHANGE, ({ key, value }) => {
  buyer.setBuyerData({ [key]: value });
});

// 4. Закрытие окна успеха
events.on(AppEvents.SUCCESS_CLOSE, () => {
  modal.hide();
  events.emit("catalog:show");
});

// 5. Отправка данных заказа
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
  } catch (err) {
    console.error("Ошибка при отправке заказа:", err);
  }
});

// --------------------------
// Загрузка товаров с сервера
// --------------------------
productsApi
  .fetchProducts()
  .then((products) => productCatalog.setCatalog(products))
  .catch((err) =>
    console.error("Ошибка при получении товаров с сервера:", err)
  );