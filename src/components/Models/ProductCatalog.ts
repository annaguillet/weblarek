import type { IProduct } from "../../types/index";
import type { IEvents } from "../base/Events";
import { AppEvents } from "../../utils/constants";

export class ProductCatalog {
  private catalog: IProduct[] = [];
  private cardProduct: IProduct | null = null;

  constructor(private events: IEvents) {}

  setCatalog(products: IProduct[]) {
    this.catalog = products;
    this.events.emit(AppEvents.CATALOG_UPDATED, { catalog: products });
  }

  getCatalog(): IProduct[] {
    return this.catalog;
  }

  getProduct(id: string): IProduct | null {
    return this.catalog.find((item) => item.id === id) || null;
  }

  setCardProduct(item: IProduct): void {
    this.cardProduct = item;
    this.events.emit(AppEvents.PRODUCT_SELECTED, { product: this.cardProduct });
  }

  getCardProduct(): IProduct | null {
    return this.cardProduct;
  }
}
