import { Component } from '../base/Component';
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types/index";
import { ProductCard } from './Card/CardGallery';
import { categoryMap } from '../../utils/constants';

export class Catalog extends Component<{}> { 
  protected list: HTMLElement;

  constructor(private events: IEvents, container: HTMLElement) {
    super(container); 
    this.list = ensureElement<HTMLElement>('.gallery', this.container);

    this.events.on<{ catalog: IProduct[] }>('catalog:updated', ({ catalog }) => {
      this.catalog = catalog;
    });
  }

  set catalog(items: IProduct[]) {
    this.list.innerHTML = '';

    items.forEach(product => {
      const template = document.querySelector<HTMLTemplateElement>('#card-catalog');
      if (!template) return;

      const cardEl = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

      new ProductCard(
        this.events,
        cardEl,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          inBasket: false,
          image: product.image,
          category: product.category?.toLowerCase() as keyof typeof categoryMap | undefined,
        },
        {
          onClick: () => this.events.emit('product:selected', { product }),
        }
      );

      this.list.appendChild(cardEl);
    });
  }
}




