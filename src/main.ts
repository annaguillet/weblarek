import "./scss/styles.scss";

import { ProductCatalog } from "./components/Models/ProductCatalog";
import { ProductsApi } from "./components/Models/ProductsApi";
import { Api } from "./components/base/Api";
import { ProductCard } from "./components/views/Card/CardGallery";
import { EventEmitter, IEvents } from "./components/base/Events";
import { API_URL, categoryMap } from "./utils/constants";
import type { IProduct } from "./types";
import { Basket } from "./components/Models/Basket";
import { Header } from "./components/views/HeaderViews";
import { Buyer } from "./components/Models/Buyer";
import { CartPreview } from "./components/views/Card/CardPreview";
import { BasketItem } from "./components/views/Card/BasketItem";
import { Modal } from "./components/views/Order/Modal";
import { OrderForm } from "./components/views/Order/OrderForm";
import { ContactForm } from "./components/views/Order/ContactForm";
import { Success } from "./components/views/Order/Success";
import type { IBuyer } from "../src/types/index";

document.addEventListener("DOMContentLoaded", () => {
  // --------------------------
  // СЛОЙ ПРЕЗЕНТЕРА: Создание основных экземпляров
  // --------------------------
  const events: IEvents = new EventEmitter();
  const basket = new Basket(events);
  const productCatalog = new ProductCatalog(events);
  const api = new Api(API_URL);
  const productsApi = new ProductsApi(api);

  const catalogContainer = document.querySelector(".gallery") as HTMLElement;
  const headerContainer = document.querySelector(".header") as HTMLElement;
  const modalContainer = document.querySelector("#modal-container") as HTMLElement;
  const buyer = new Buyer();


  if (!catalogContainer) throw new Error("Контейнер .gallery не найден");
  if (!headerContainer) throw new Error("Контейнер .header не найден");
  if (!modalContainer) throw new Error("Контейнер #modal-container не найден");

  const header = new Header(events, headerContainer);
  const modal = new Modal(events, modalContainer);

  // --------------------------
  // 1. Обновление счётчика корзины
  // --------------------------
  function updateBasketCounter() {
    header.counter = basket.getBasket().length;
  }

  // --------------------------
  // 2. Рендер каталога
  // --------------------------
  function renderCatalog(products: IProduct[]) {
    const template = document.querySelector<HTMLTemplateElement>("#card-catalog");
    if (!template) throw new Error("Шаблон #card-catalog не найден");
  
    catalogContainer.innerHTML = "";
  
    products.forEach((product) => {
      const cardElement = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  
      const categoryKey = product.category?.toLowerCase() as keyof typeof categoryMap | undefined;
  
      new ProductCard(
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
          onClick: () => events.emit("product:selected", { product }),
          onAddToBasket: (id, inBasket) => {
            // Обновляем корзину через презентер
            if (inBasket) {
              const p = productCatalog.getProduct(id);
              if (p) basket.addInBasket(p);
            } else {
              basket.removeFromBasket({ id });
            }
  
            // обновляем счетчик и рендерим элементы при необходимости
            updateBasketCounter();
          }
        }
      );
  
      catalogContainer.appendChild(cardElement);
    });
  }
  

  // --------------------------
  // 3. Превью карточки товара
  // --------------------------
  function showProductPreview(product: IProduct) {
    const template = document.querySelector<HTMLTemplateElement>("#card-preview");
    if (!template) return;

    const previewEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

    new CartPreview(events, previewEl, {
      id: product.id,
      title: product.title,
      description: product.description || "",
      price: product.price,
      inBasket: basket.hasInBasket(product.id),
      image: product.image,
      category: product.category?.toLowerCase() as keyof typeof categoryMap | undefined,
    });

    modal.setContent(previewEl);
    modal.show();
  }

  // --------------------------
  // 4. Рендер корзины
  // --------------------------
  function renderBasket() {
    const basketTemplate = document.querySelector<HTMLTemplateElement>("#basket");
    const itemTemplate = document.querySelector<HTMLTemplateElement>("#card-basket");
    if (!basketTemplate || !itemTemplate) return;

    const basketEl = basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const listEl = basketEl.querySelector(".basket__list") as HTMLElement;
    const totalEl = basketEl.querySelector(".basket__price") as HTMLElement;

    const renderItems = () => {
      listEl.innerHTML = "";
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
    };

    renderItems();

    listEl.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest(".basket__item-delete");
      if (btn) {
        const li = (btn as HTMLElement).closest(".basket__item") as HTMLElement | null;
        const id = li?.dataset.id;
        if (id) {
          basket.removeFromBasket({ id });
          renderItems();
          updateBasketCounter();
        }
      }
    });

    const orderBtn = basketEl.querySelector(".basket__button") as HTMLButtonElement;
    orderBtn.onclick = () => events.emit("order:start");

    modal.setContent(basketEl);
    modal.show();
  }

  // --------------------------
  // 5. Форма заказа
  // --------------------------


  function updateBuyerData(data: Partial< IBuyer>) {
    buyer.setBuyerData(data);
    events.emit("buyer:updated", { buyer: buyer.getBuyerData() });
  }
  
  
  function validateBuyerData() {
    return buyer.validateBuyerData();
  }

  events.on("contact:submit", ({ formData }: { formData: Partial<IBuyer> }) => {
    updateBuyerData(formData);
  
    const errors = validateBuyerData();
    if (Object.keys(errors).length > 0) {
      events.emit("contact:errors", { errors });
      return;
    }
  
    events.emit("order:submit"); // если всё ок — продолжаем оформление
  });  
  
  function renderOrderForm() {
    const orderTemplate = document.querySelector<HTMLTemplateElement>("#order");
    if (!orderTemplate) return;

    const orderEl = orderTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    new OrderForm(events, orderEl);
    modal.setContent(orderEl);
  }

  function renderContactForm() {
    const contactsTemplate = document.querySelector<HTMLTemplateElement>("#contacts");
    if (!contactsTemplate) return;

    const contactsEl = contactsTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    new ContactForm(events, contactsEl);
    modal.setContent(contactsEl);
  }

  function renderSuccessScreen(total: number) {
    const successTemplate = document.querySelector<HTMLTemplateElement>("#success");
    if (!successTemplate) return;

    const successEl = successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const successComponent = new Success(successEl, events);
    successComponent.render({ total });
    modal.setContent(successEl);
    modal.show();
  }

  // --------------------------
  // 6. События приложения
  // --------------------------
  events.on("catalog:updated", ({ catalog }: { catalog: IProduct[] }) => {
    renderCatalog(catalog);
  });

  events.on("basket:open", () => renderBasket());

  events.on("product:selected", ({ product }: { product: IProduct }) => {
    showProductPreview(product);
  });

  events.on("basket:add", ({ id }: { id: string }) => {
    const product = productCatalog.getProduct(id);
    if (product) {
      basket.addInBasket(product);
      updateBasketCounter();
    }
  });

  events.on("basket:remove", ({ id }: { id: string }) => {
    basket.removeFromBasket({ id }); 
    updateBasketCounter();
  });

  events.on("order:start", renderOrderForm);
  events.on("order:next", renderContactForm);

  events.on("order:submit", () => {
    const total = basket.getBasketTotal();
    basket.clearBasket();
    updateBasketCounter();
    renderSuccessScreen(total);
  });

  events.on("success:close", () => {
    modal.hide();
  });

  // --------------------------
  // 7. Загрузка данных с сервера
  // --------------------------
  productsApi
    .fetchProducts()
    .then((products) => {
      productCatalog.setCatalog(products);
      events.emit("catalog:updated", { catalog: products });
    })
    .catch((err) => console.error("Ошибка при получении товаров:", err));
});
