import { Component } from '../base/Component';
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types/index";
import { ProductCard } from './Card/CardGallery';
import { categoryMap,AppEvents } from '../../utils/constants';

interface IBasket {
  hasInBasket: (id: string) => boolean;
}

export class CatalogView extends Component<{}> { 
  protected list: HTMLElement;

  constructor(
    private events: IEvents, 
    container: HTMLElement,
    private basket: IBasket
  ) {
    super(container);
    this.list = ensureElement<HTMLElement>('.gallery', this.container);
  }

  renderCatalog(products: IProduct[]) {
    this.list.innerHTML = '';

    const template = document.querySelector<HTMLTemplateElement>('#card-catalog');
    if (!template) throw new Error('Шаблон #card-catalog не найден');

    products.forEach(product => {
      const cardElement = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
      const categoryKey = product.category?.toLowerCase() as keyof typeof categoryMap | undefined;

      // Создаем экземпляр ProductCard - это правильно!
      new ProductCard(
        this.events,
        cardElement,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          inBasket: this.basket.hasInBasket(product.id),
          image: product.image,
          category: categoryKey,
        },
        {
          onClick: () => this.events.emit(AppEvents.PRODUCT_SELECTED, { product }),
        }
      );

      this.list.appendChild(cardElement);
    });
  }
}