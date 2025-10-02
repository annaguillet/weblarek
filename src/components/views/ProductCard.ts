import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { categoryMap, CDN_URL } from '../../utils/constants';

type CategoryKey = keyof typeof categoryMap;


export interface IProductCardData {
  id: string;
  title: string;
  price: number | null;
  inBasket: boolean;
  image: string;
  category?: string | undefined; 
}

export class ProductCard extends Component<{}> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected button?: HTMLButtonElement;
  protected imageElement: HTMLImageElement;
  protected categoryElement?: HTMLElement;

  private _id: string;
  private _title: string;
  private _price: number | null;
  private _inBasket: boolean;
  private _category?: CategoryKey;
  private _image?: string;

  constructor(protected events: IEvents, container: HTMLElement, data: IProductCardData) {
    super(container);
    
    this._id = data.id;
    this._title = data.title;
    this._price = data.price;
    this._inBasket = data.inBasket;

    this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    this.button = this.container.querySelector<HTMLButtonElement>('.card__button') || undefined;
    this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);

    // Используем сеттер, чтобы сразу установить src и alt
    this.title = data.title;
    this.price = data.price;
    this.inBasket = data.inBasket;
    this.image = data.image;
    this.category = data.category as keyof typeof categoryMap;


    if (this.button) {
      this.button.addEventListener('click', () => {
        if (this._price === null) return;
        if (this._inBasket) {
          this.events.emit('basket:remove', { id: this._id });
        } else {
          this.events.emit('basket:add', { id: this._id });
        }
      });
    }

    this.title = this._title;
    this.price = this._price;
    this.inBasket = this._inBasket;
  }

  // Сеттер и геттер для заголовка
  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
    // Обновляем alt изображения, если оно уже есть
    if (this.imageElement) this.imageElement.alt = value;
  }

  // Сеттер и геттер для цены
  set price(value: number | null) {
    this._price = value;

    if (value === null) {
      this.priceElement.textContent = 'Недоступно';
      if (this.button) this.button.disabled = true;
    } else {
      this.priceElement.textContent = `${value} синапсов`;
      if (this.button) {
        this.button.disabled = false;
        this.button.textContent = this._inBasket ? 'Удалить из корзины' : 'В корзину';
      }
    }
  }

  // Сеттер и геттер для состояния в корзине
  set inBasket(value: boolean) {
    this._inBasket = value;
    if (this.button && this._price !== null) {
      this.button.textContent = value ? 'Удалить из корзины' : 'В корзину';
    }
  }

  // Сеттер и геттер для изображения
  set image(value: string | undefined) {
    this._image = value;
    // Формируем полный URL к картинке
    const fullUrl = value ? `${CDN_URL}/${value}` : '/images/placeholder.png';
    this.imageElement.src = fullUrl;
    this.imageElement.alt = this._title || 'Изображение товара';
  }

  set category(value: CategoryKey | undefined) {
    this._category = value;

    if (!value || !this.categoryElement) return;

    // Убираем старые модификаторы, оставляем базовый класс
    this.categoryElement.className = `card__category ${categoryMap[value]}`;
    this.categoryElement.textContent = value;
  }

  get id() {
    return this._id;
  }

  get image() {
    return this._image;
  }

  get category() {
    return this._category;
  }
}
