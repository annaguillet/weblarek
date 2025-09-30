import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export interface IProductCardData {
  id: string;
  title: string;
  price: number | null;
  inBasket: boolean;
}

export class ProductCard extends Component<{}> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected button?: HTMLButtonElement;

  private _id: string;
  private _title: string;
  private _price: number | null;
  private _inBasket: boolean;

  constructor(protected events: IEvents, container: HTMLElement, data: IProductCardData) {
    super(container);

    this._id = data.id;
    this._title = data.title;
    this._price = data.price;
    this._inBasket = data.inBasket;

    this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
    this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    this.button = this.container.querySelector<HTMLButtonElement>('.card__button') || undefined;

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

  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
  }

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

  set inBasket(value: boolean) {
    this._inBasket = value;
    if (this.button && this._price !== null) {
      this.button.textContent = value ? 'Удалить из корзины' : 'В корзину';
    }
  }
}
