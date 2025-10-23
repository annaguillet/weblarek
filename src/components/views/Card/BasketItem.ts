import { ensureElement } from '../../../utils/utils';
import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { AppEvents } from '../../../utils/constants';

export interface IBasketItemData {
  id: string;
  title: string;
  price: number;
  index: number;
}

export class BasketItem extends Component<{}> {
  protected indexElement: HTMLElement;
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected removeButton: HTMLButtonElement;

  private _id: string;
  private _title: string;
  private _price: number;
  private _index: number;

  constructor(protected events: IEvents, container: HTMLElement, data: IBasketItemData) {
    super(container);

    this._id = data.id;
    this._title = data.title;
    this._price = data.price;
    this._index = data.index;

    // Получаем элементы из контейнера
    this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    this.removeButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

    // Подставляем значения
    this.index = this._index;
    this.title = this._title;
    this.price = this._price;

    // Обработчик удаления
    this.removeButton.addEventListener('click', () => {
      this.events.emit(AppEvents.BASKET_REMOVE, { id: this._id });
    });
  }

  set index(value: number) {
    this._index = value;
    this.indexElement.textContent = String(value);
  }

  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
  }

  set price(value: number) {
    this._price = value;
    this.priceElement.textContent = `${value} синапсов`;
  }
}
