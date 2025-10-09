import type { IProduct } from '../../types/index';
import type { IEvents } from '../base/Events';

export class Basket {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {}

  addInBasket(product: IProduct): void {
    this.items.push(product);
    this.events.emit('basket:changed', { items: this.items });
  }

  removeFromBasket(product: { id: string }): void {
    console.log('Removing product:', product.id); // Отладочная информация
  console.log('Before removal:', this.items.map(item => item.id)); // Отладочная информация
  
    this.items = this.items.filter(item => item.id !== product.id);


  console.log('After removal:', this.items.map(item => item.id)); // Отладочная информация
    this.events.emit('basket:changed', { items: this.items });
  }

  getBasketCount(): number {
    return this.items.length;
  }

  getBasketTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  getBasket(): IProduct[] {
    return this.items;
  }

  hasInBasket(id: string): boolean {
    return this.items.some(item => item.id === id);
  }

  clearBasket(): void {
    this.items = [];
    this.events.emit('basket:changed', { items: this.items });
  }
}