import "./scss/styles.scss";

import { IEvents, EventEmitter } from "./components/base/Events";
import { Api } from "./components/base/Api";
import { ProductsApi } from "./components/Models/ProductsApi";
import { ProductCatalog } from "./components/Models/ProductCatalog";
import { Basket } from "./components/Models/Basket";
import { Buyer } from "./components/Models/Buyer";
import { Header } from "./components/views/HeaderViews";
import { Modal } from "./components/views/Order/Modal";
import { CatalogView } from "./components/views/Gallery";
import { BasketView } from "./components/views/BasketViews";
import { OrderView } from "./components/views/Order/OrderViews";
import { API_URL } from "./utils/constants";
import type { IProduct } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------
  // 1. Создаем EventEmitter
  // --------------------------
  const events: IEvents = new EventEmitter();

  // --------------------------
  // 2. Создаем основные модели
  // --------------------------
  const basket = new Basket(events);
  const buyer = new Buyer(events);
  const productCatalog = new ProductCatalog(events);
  const api = new Api(API_URL);
  const productsApi = new ProductsApi(api);

  // --------------------------
  // 3. Создаем UI-компоненты
  // --------------------------
  const headerContainer = document.querySelector(".header") as HTMLElement;
  const header = new Header(events, headerContainer);

  const catalogContainer = document.querySelector(".gallery") as HTMLElement;
  const catalogView = new CatalogView(events, catalogContainer);

  const modalContainer = document.querySelector(
    "#modal-container"
  ) as HTMLElement;
  const modal = new Modal(events, modalContainer);

  new BasketView(events, basket, modal);
  new OrderView(events, basket, modal, buyer);

  // --------------------------
  // 4. Подписка на обновление счетчика корзины
  // --------------------------
  events.on<{ items: IProduct[] }>("basket:changed", ({ items }) => {
    header.counter = items.length;
  });

  // --------------------------
  // 5. Рендер каталога при обновлении данных
  // --------------------------
  events.on<{ catalog: IProduct[] }>("catalog:updated", ({ catalog }) => {
    catalogView.renderProducts(catalog, basket);
  });

  // --------------------------
  // 6. Превью товара через CatalogView
  // --------------------------
  events.on<{ product: IProduct }>("product:selected", ({ product }) => {
    catalogView.renderPreview(product, basket, modal);
  });

  // --------------------------
  // 7. Управление корзиной через события
  // --------------------------
  events.on<{ id: string }>("basket:add", ({ id }) => {
    const product = productCatalog.getProduct(id);
    if (product) basket.addInBasket(product);
  });

  events.on<{ id: string }>("basket:remove", ({ id }) => {
    const product = productCatalog.getProduct(id);
    if (product) basket.removeFromBasket(product);
  });

  // --------------------------
  // 8. Загрузка товаров с сервера
  // --------------------------
  productsApi
    .fetchProducts()
    .then((products) => productCatalog.setCatalog(products))
    .catch((err) =>
      console.error("Ошибка при получении товаров с сервера:", err)
    );
});
