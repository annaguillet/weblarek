import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { AppEvents } from "../../utils/constants";

export interface IBasketViewItemElement extends HTMLElement {}

export class BasketView extends Component<{}> {
  protected basketTitle: HTMLElement;
  protected basketList: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected basketPrice: HTMLElement;

  protected _items: IBasketViewItemElement[] = [];

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketTitle = ensureElement<HTMLElement>(".modal__title", container);
    this.basketList = ensureElement<HTMLElement>(".basket__list", container);
    this.basketButton = ensureElement<HTMLButtonElement>(
      ".basket__button",
      container
    );
    this.basketPrice = ensureElement<HTMLElement>(".basket__price", container);

    this.basketButton.addEventListener("click", () =>
      this.events.emit(AppEvents.ORDER_START)
    );
  }

  set items(items: IBasketViewItemElement[]) {
    this._items = items;

    this.basketList.replaceChildren(...items);
  }

  set count(value: number) {
    this.basketTitle.textContent = value
      ? `Ваша корзина (${value})`
      : "Корзина пуста";
  }

  set priceText(text: string) {
    this.basketPrice.textContent = text;
  }

  render(): HTMLElement {
    return this.container;
  }
}
