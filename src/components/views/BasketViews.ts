import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { BasketItem } from './Card/BasketItem';
import { Basket } from '../Models/Basket';


export class BasketView extends Component<{ basket: Basket }> {
  protected basketTitle: HTMLElement;
  protected basketList: HTMLElement;
  protected basketButton: HTMLButtonElement;
  protected basketPrice: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement, protected basket: Basket) {
    super(container);

    this.basketTitle = ensureElement<HTMLElement>('.modal__title', container); 
    this.basketList = ensureElement<HTMLElement>('.basket__list', container);
    this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', container);
    this.basketPrice = ensureElement<HTMLElement>('.basket__price', container);

    this.basketButton.addEventListener('click', () => this.events.emit('order:start'));


    this.basketList.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.basket__item-delete');
      if (!btn) return;
      const li = (btn as HTMLElement).closest('.basket__item') as HTMLElement | null;
      const id = li?.dataset.id;
      if (id) this.events.emit('basket:remove', { id });
    });


    this.events.on('basket:changed', () => this.render());
  }

  private renderItems() {
    const itemTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
    this.basketList.innerHTML = '';

    this.basket.getBasket().forEach((product, index) => {
      const itemEl = itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
      itemEl.dataset.id = product.id;

      new BasketItem(this.events, itemEl, {
        id: product.id,
        title: product.title,
        price: product.price || 0,
        index: index + 1,
      });

      this.basketList.appendChild(itemEl);
    });
  }

  render(): HTMLElement {
    const items = this.basket.getBasket();
    this.basketTitle.textContent = items.length
      ? `Ваша корзина (${items.length})`
      : 'Корзина пуста';
    this.basketPrice.textContent = `${this.basket.getBasketTotal()} синапсов`;
    this.renderItems();
    return this.container;
  }
}
