import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface ICatalog {
  products: HTMLElement[];
}

export class Catalog extends Component<ICatalog> {
  protected list: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    // Контейнер уже является .gallery, поэтому искать его внутри не нужно
    this.list = this.container;
  }

  set products(items: HTMLElement[]) {
    this.list.replaceChildren(...items);
  }
}
