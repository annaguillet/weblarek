import type { IProduct } from '../../types/index';

export class Basket {
  private items: IProduct[] = [];

  addInBasket(product: IProduct): void {
    this.items.push(product);
  }

  removeFromBasket(product: IProduct): void {
    this.items = this.items.filter(item => item.id !== product.id);
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
  }
}
