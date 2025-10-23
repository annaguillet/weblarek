import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement} from '../../utils/utils';
import {AppEvents} from '../../utils/constants';

export interface IBasketViewItemElement extends HTMLElement {}

export class BasketView extends Component<{}> {
  protected basketTitle: HTMLElement;
  protected basketList: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected basketPrice: HTMLElement;

  // локально храним элементы списка, если нужно
  protected _items: IBasketViewItemElement[] = [];

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketTitle = ensureElement<HTMLElement>('.modal__title', container);
    this.basketList = ensureElement<HTMLElement>('.basket__list', container);
    this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', container);
    this.basketPrice = ensureElement<HTMLElement>('.basket__price', container);

    // Кнопка выполнения заказа — вызывает событие, которое должен обрабатывать презентер.
    this.basketButton.addEventListener('click', () => this.events.emit(AppEvents.ORDER_START));
  }

  // Сеттер, который презентер будет вызывать с готовыми DOM-элементами (элементами BasketItem)
  set items(items: IBasketViewItemElement[]) {
    this._items = items;
    // в DOM подставляем уже готовые элементы
    this.basketList.replaceChildren(...items);
  }

  // Сеттер для заголовка (кол-во позиций)
  set count(value: number) {
    this.basketTitle.textContent = value ? `Ваша корзина (${value})` : 'Корзина пуста';
  }

  // Сеттер для отображения цены
  set priceText(text: string) {
    this.basketPrice.textContent = text;
  }

  // render должен только вернуть контейнер; отрисовкой списка управляет презентер через сеттеры выше
  render(): HTMLElement {
    return this.container;
  }
}
