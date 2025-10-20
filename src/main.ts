import "./scss/styles.scss";

import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ProductsApi } from "./components/Models/ProductsApi";
import { Api } from "./components/base/Api";
import { ensureElement, cloneTemplate } from "./utils/utils";
import { ProductCard } from "./components/views/Card/CardGallery";
import { EventEmitter, IEvents } from "./components/base/Events";
import { API_URL, categoryMap } from "./utils/constants";
import type { IProduct } from "./types";
import { Basket } from "./components/Models/Basket";
import { Header } from "./components/views/HeaderViews";
import { CardPreview } from "./components/views/Card/CardPreview";
import { Modal } from "./components/views/Order/Modal";
import { OrderForm } from "./components/views/Order/OrderForm";
import { ContactForm } from "./components/views/Order/ContactForm";
import { Success } from "./components/views/Order/Success";
import { BasketView } from "./components/views/BasketViews";
import { Catalog } from "./components/views/Gallery";
import type { IOrderRequest } from "../src/types/index";
import { Buyer } from "./components/Models/Buyer";

// ==========================
// Основные объекты и инициализация
// ==========================
const events: IEvents = new EventEmitter();
const basket = new Basket(events);

const catalogEl = ensureElement<HTMLElement>(".gallery");
const catalogView = new Catalog(events, catalogEl);

const headerContainer = ensureElement<HTMLElement>(".header");
if (!headerContainer) throw new Error("Контейнер .header не найден");
const header = new Header(events, headerContainer);

const productCatalog = new ProductCatalog(events);
const api = new Api(API_URL);
const productsApi = new ProductsApi(api);

const modalContainer = ensureElement<HTMLElement>("#modal-container");
if (!modalContainer) throw new Error("Контейнер #modal-container не найден");
const modal = new Modal(events, modalContainer);

const orderForm = new OrderForm(events, cloneTemplate<HTMLElement>("#order"));
const contactForm = new ContactForm(
  events,
  cloneTemplate<HTMLElement>("#contacts")
);
const successView = new Success(cloneTemplate<HTMLElement>("#success"), events);

const basketTemplate = cloneTemplate<HTMLElement>("#basket");
const basketView = new BasketView(events, basketTemplate, basket);

const buyer = new Buyer(events);

// ==========================
// Обновление счетчика корзины в хедере
// ==========================
events.on<{ items: IProduct[] }>("basket:changed", ({ items }) => {
  header.counter = items.length;
});

// ==========================
// Обновление каталога товаров
// ==========================
events.on<{ catalog: IProduct[] }>("catalog:updated", ({ catalog }) => {
  const template = ensureElement<HTMLTemplateElement>("#card-catalog");
  if (!template) throw new Error("Шаблон #card-catalog не найден");

  const cards = catalog.map((product) => {
    const cardElement = template.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    const categoryKey = product.category?.toLowerCase() as
      | keyof typeof categoryMap
      | undefined;

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
        onClick: () => events.emit("product:clicked", { product }),
      }
    );

    return cardElement;
  });

  catalogView.products = cards;
});

// ==========================
// Клик по товару в каталоге
// ==========================
events.on<{ product: IProduct }>("product:clicked", ({ product }) => {
  productCatalog.setCardProduct(product);
});

// ==========================
// Превью товара в модальном окне
// ==========================
events.on<{ product: IProduct }>("product:selected", ({ product }) => {
  const previewEl = cloneTemplate<HTMLElement>("#card-preview");
  const preview = new CardPreview(events, previewEl, {
    id: product.id,
    title: product.title,
    description: product.description || "",
    price: product.price,
    inBasket: basket.hasInBasket(product.id),
    image: product.image,
    category: product.category?.toLowerCase() as
      | keyof typeof categoryMap
      | undefined,
  });

  modal.setContent(preview.render());
  modal.show();
});

// ==========================
// Добавление / удаление товаров из корзины
// ==========================
events.on<{ id: string }>("basket:add", ({ id }) => {
  const product = productCatalog.getProduct(id);
  if (product) basket.addInBasket(product);
});

events.on<{ id: string }>("basket:remove", ({ id }) => {
  const product = productCatalog.getProduct(id);
  if (product) basket.removeFromBasket(product);
});

// ==========================
// Открытие корзины
// ==========================
events.on("basket:open", () => {
  modal.setContent(basketView.render());
  modal.show();
});

// ==========================
// Этапы оформления заказа
// ==========================

// 1. Начало оформления — показываем форму заказа
events.on("order:start", () => {
  modal.setContent(orderForm.render());
  modal.show();
});

// 2. Переход ко второй форме — контакты
events.on("order:next", () => {
  modal.setContent(contactForm.render());
  modal.show();
});

// 3. Успешное оформление заказа — показываем окно успеха
events.on<{ total: number }>("order:success", ({ total }) => {
  successView.total = total;
  modal.setContent(successView.render());
  modal.show();
});

// 4. Закрытие окна успеха
events.on("success:close", () => {
  modal.hide();
  events.emit("catalog:show");
});

events.on("order:submit", () => {
  const total = basket.getBasketTotal();
  basket.clearBasket();

  const content = successView.render({ total });
  modal.setContent(content);
  modal.show();
});

// 5. Отправка данных заказа на сервер
events.on("order:submit", async () => {
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
    events.emit("order:success", { total: order.total });
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
