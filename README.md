# Web-Larёk — интернет-магазин для веб-разработчиков

**Стек:** TypeScript, SCSS, HTML, Vite  
**Архитектура:** MVP (Model–View–Presenter) + событийная модель  

**Описание:**  
Web-Larёk — это учебный интернет-магазин с товарами для веб-разработчиков.  
Пользователь может просматривать каталог, добавлять товары в корзину и оформлять заказы.  
Интерфейс реализован с модальными окнами, пошаговыми формами и валидацией данных.

---

## Установка и запуск

### Установка зависимостей
```bash
npm install
````

### Запуск в режиме разработки

```bash
npm run start
```

### Сборка проекта

```bash
npm run build
```

> Также можно использовать `yarn start` / `yarn build`, если используете Yarn.

---

## Структура проекта

```
src/
├── components/          # Основные классы приложения
│   ├── base/            # Базовые классы (Component, Events, Api)
│   ├── Models/          # Модели данных (Basket, Buyer, ProductCatalog)
│   └── views/           # Компоненты интерфейса (View-слой)
├── scss/                # SCSS-стили
├── utils/               # Константы и утилиты
├── types/               # Типы данных TypeScript
└── main.ts              # Точка входа приложения
```

**Ключевые файлы:**

* `src/main.ts` — точка входа, презентер приложения
* `src/utils/constants.ts` — константы и события
* `src/types/index.ts` — типы данных (IProduct, IBuyer и др.)
* `src/components/base/Api.ts` — базовый класс API
* `src/components/base/Events.ts` — брокер событий
* `src/scss/styles.scss` — главный файл стилей

---

## Архитектура приложения

### Model — слой данных

Хранит и изменяет состояние приложения.

* **ProductCatalog** — управляет списком товаров, полученных с сервера.
* **Basket** — отвечает за хранение и изменение содержимого корзины.
* **Buyer** — хранит данные покупателя и выполняет их валидацию.

Модели не взаимодействуют напрямую с представлениями — они только генерируют события.

---

### View — слой представления

Отвечает за визуализацию данных и обработку действий пользователя.

**Основные компоненты:**

* **Header** — отображает логотип, кнопку корзины и счётчик товаров.
* **Catalog** — отображает карточки товаров.
* **BasketView / BasketItem** — список товаров в корзине и управление ими.
* **OrderForm / ContactForm** — формы оформления заказа.
* **Modal** — универсальное модальное окно.
* **Success** — окно успешного завершения заказа.

Все компоненты наследуются от `Component<T>` и обмениваются данными через события.

---

### Presenter — слой логики (main.ts)

Связывает все части приложения, не вмешиваясь в визуализацию.

**Задачи:**

* Подписывается на события от представлений (`basket:add`, `order:start`, `order:submit` и т.д.).
* Обновляет модели (`Basket`, `Buyer`, `ProductCatalog`).
* Управляет состоянием модальных окон.
* Реагирует на обновления моделей (`basket:changed`, `catalog:updated`) и перерисовывает интерфейс.

> Общение между всеми частями идёт только через единый экземпляр `EventEmitter`.

---

## Базовые классы

### Component<T>

Абстрактный класс для всех визуальных компонентов.
Позволяет передавать данные через `render()` и использовать сеттеры для обновления DOM.

```ts
render(data?: Partial<T>): HTMLElement
```

---

### EventEmitter

Реализует паттерн "Наблюдатель", обеспечивая коммуникацию между слоями.

Методы:

* `on(event, callback)` — подписка на событие
* `emit(event, data)` — инициировать событие
* `trigger(event, context)` — возвращает функцию-триггер для события

---

### Api

Инкапсулирует работу с `fetch` и обработку ошибок.

Методы:

* `get(uri: string)`
* `post(uri: string, data: object, method = 'POST')`

---

## Типы данных

### IProduct — товар

```ts
{
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
  description: string;
}
```

### IBuyer — покупатель

```ts
{
  payment: 'card' | 'cash';
  address: string;
  email: string;
  phone: string;
}
```

---

## Событийная модель

Всё взаимодействие между компонентами основано на событиях, определённых в `AppEvents`.

```ts
export enum AppEvents {
  CATALOG_UPDATED = 'catalog:updated',
  PRODUCT_CLICKED = 'product:clicked',
  PRODUCT_SELECTED = 'product:selected',
  BASKET_ADD = 'basket:add',
  BASKET_REMOVE = 'basket:remove',
  BASKET_CHANGED = 'basket:changed',
  BASKET_OPEN = 'basket:open',
  ORDER_START = 'order:start',
  ORDER_NEXT = 'order:next',
  ORDER_CONTACT_SUBMIT = 'order:contact-submit',
  ORDER_SUCCESS = 'order:success',
  BUYER_CHANGE = 'buyer:change',
  FORM_VALIDATE = 'form:validate',
  SUCCESS_CLOSE = 'success:close'
}
```

> Это обеспечивает полную изоляцию слоёв и гибкость при масштабировании.

---

## Логика работы приложения

1. Загрузка каталога — товары получаются через `ProductsApi.fetchProducts()`.
2. Выбор товара — открывается превью карточки.
3. Добавление в корзину — событие `basket:add` обновляет модель.
4. Оформление заказа:

   * Шаг 1: `OrderForm` — выбор оплаты и адреса.
   * Шаг 2: `ContactForm` — ввод email и телефона.
5. Отправка заказа — `ProductsApi.sendOrder()`, показ окна `Success`.

---

## Обработка ошибок и UX

* Все сетевые и логические ошибки логируются через `console.error` или `console.warn`.
* Приложение не блокируется при сбое сервера:
  `ProductsApi` возвращает fallback-ответ, чтобы пользователь мог завершить сценарий.
* Формы валидируются по мере ввода, а ошибки отображаются ненавязчиво.

---

