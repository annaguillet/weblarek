import type { IProduct } from "../../types/index";
import type { IEvents } from "../base/Events";

export class ProductCatalog {
  private catalog: IProduct[] = [];
  private cardProduct: IProduct | null = null;

  constructor(private events: IEvents) {}

  setCatalog(items: IProduct[]): void {
    this.catalog = items;
  }

  getCatalog(): IProduct[] {
    return this.catalog;
  }

  getProduct(id: string): IProduct | null {
    return this.catalog.find((item) => item.id === id) || null;
  }

  setCardProduct(item: IProduct): void {
    this.cardProduct = item;
  }

  getCardProduct(): IProduct | null {
    return this.cardProduct;
  }
}

