/* Константа для получения полного пути для сервера. Для выполнения запроса 
необходимо к API_URL добавить только ендпоинт. */
export const API_URL = `${import.meta.env.VITE_API_ORIGIN}/api/weblarek`;

/* Константа для формирования полного пути к изображениям карточек. 
Для получения полной ссылки на картинку необходимо к CDN_URL добавить только название файла изображения,
которое хранится в объекте товара. */
export const CDN_URL = `${import.meta.env.VITE_API_ORIGIN}/content/weblarek`;

/* Константа соответствий категорий товара модификаторам, используемым для отображения фона категории. */
export const categoryMap = {
  "софт-скил": "card__category_soft",
  "хард-скил": "card__category_hard",
  кнопка: "card__category_button",
  дополнительное: "card__category_additional",
  другое: "card__category_other",
};

export enum AppEvents {
  // каталог и товары
  CATALOG_UPDATED = "catalog:updated",
  PRODUCT_CLICKED = "product:clicked",
  PRODUCT_SELECTED = "product:selected",

  // корзина
  BASKET_ADD = "basket:add",
  BASKET_REMOVE = "basket:remove",
  BASKET_CHANGED = "basket:changed",
  BASKET_OPEN = "basket:open",

  // оформление
  ORDER_START = "order:start",
  ORDER_NEXT = "order:next",
  ORDER_CONTACT_SUBMIT = "order:contact-submit",
  ORDER_SUCCESS = "order:success",

  // покупатель и формы
  BUYER_CHANGE = "buyer:change",
  FORM_VALIDATE = "form:validate",

  // успех
  SUCCESS_CLOSE = "success:close",
}

export const settings = {};
