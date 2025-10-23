import type { IBuyer } from "../../types/index";
import type { IEvents } from "../base/Events";
import { AppEvents } from "../../utils/constants";

export class Buyer {
  private payment: IBuyer["payment"] = "card";
  private address = "";
  private email = "";
  private phone = "";

  constructor(private events: IEvents) {}

  setBuyerData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;

    // Только валидируем и сообщаем обновление
    const errors = this.validateBuyerData();
    this.events.emit(AppEvents.FORM_VALIDATE, errors);
    this.events.emit("buyer:updated", { buyer: this.getBuyerData() });
  }

  getBuyerData(): IBuyer {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }

  validateBuyerData(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!this.payment) errors.payment = "Выберите способ оплаты";
    if (!this.address.trim()) errors.address = "Введите адрес доставки";
    if (!this.email.trim()) errors.email = "Введите email";
    if (!this.phone.trim()) errors.phone = "Введите телефон";
    return errors;
  }

  clearBuyerData(): void {
    this.payment = "card";
    this.address = "";
    this.email = "";
    this.phone = "";
    this.events.emit(AppEvents.FORM_VALIDATE, {}); // очистим ошибки
    this.events.emit("buyer:updated", { buyer: this.getBuyerData() });
  }
}
