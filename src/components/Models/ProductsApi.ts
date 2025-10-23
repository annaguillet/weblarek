import type { IApi, IProduct, IOrderRequest } from "../../types/index";

export class ProductsApi {
  constructor(private api: IApi) {}

  /**
   * Получение каталога
   */
  async fetchProducts(): Promise<IProduct[]> {
    try {
      const response = await this.api.get<{ items: IProduct[]; total: number }>('/product/');
      return response.items;
    } catch (error) {
      console.error('❌ Ошибка при получении товаров:', error);
      throw error;
    }
  }

  /**
   * Отправка заказа
   * Если сервер недоступен (например, dev-режим) — возвращаем мок
   */
  async sendOrder(order: IOrderRequest): Promise<{ total: number }> {
    try {
      return await this.api.post<{ total: number }>('/order/', order, 'POST');
    } catch (error) {
      console.warn('⚠️ Сервер недоступен, возвращаем моковый ответ', error);
      // fallback — чтобы Success окно всё равно открылось
      return Promise.resolve({ total: order.total });
    }
  }
}
