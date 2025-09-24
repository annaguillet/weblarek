import { Api } from '../Api';
import type { IApi, IProduct, IBuyer, IOrder } from '../../../types/index';


export class ProductsApi {
  private api: Api;

  constructor(api: IApi) {
    // создаём экземпляр класса Api
    this.api = new Api('https://larek-api.nomoreparties.co/weblarek.postman.json');
  }

  /**
   * Получение массива товаров с сервера
   */
  async fetchProducts(): Promise<IProduct[]> {
    // fetch возвращает тип T, указываем <{ items: IProduct[] }>
    const response = await this.api.get<{ items: IProduct[] }>('/product/');
    return response.items;
  }

  /**
   * Отправка заказа на сервер
   */
  async sendOrder(buyer: IBuyer, items: IProduct[]): Promise<object> {
    const order: IOrder = {
      buyer,
      items,
      total: items.reduce((sum, item) => sum + (item.price ?? 0), 0),
    };

    // post возвращает любой объект, можно уточнить тип, если известно
    return this.api.post<object>('/order/', order, 'POST');
  }
}
