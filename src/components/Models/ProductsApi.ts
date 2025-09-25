import type { IApi, IProduct, IOrderRequest } from '../../types/index';

export class ProductsApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api; 
  }

  /**
   * Получение массива товаров с сервера
   */
  async fetchProducts(): Promise<IProduct[]> {
    // сервер возвращает { items: IProduct[], total: number }
    const response = await this.api.get<{ items: IProduct[]; total: number }>('/product/');
    return response.items;
  }

  /**
   * Отправка заказа на сервер
   */
  async sendOrder(order: IOrderRequest): Promise<object> {
    return this.api.post<object>('/order/', order, 'POST');
  }
}
