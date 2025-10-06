import type { IBuyer } from "../../types/index";
import type { IEvents } from "../base/Events";

export class Buyer {
  private payment: IBuyer["payment"] = "card";
  private address: string = "";
  private email: string = "";
  private phone: string = "";

  constructor(private events: IEvents) {}

  setBuyerData(data: Partial<IBuyer>): void {
    if (data.payment) this.payment = data.payment;
    if (data.address) this.address = data.address;
    if (data.email) this.email = data.email;
    if (data.phone) this.phone = data.phone;

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
    if (!this.address) errors.address = "Введите адрес доставки";
    if (!this.email) errors.email = "Введите email";
    if (!this.phone) errors.phone = "Введите телефон";
    return errors;
  }

  clearBuyerData(): void {
    this.payment = "card";
    this.address = "";
    this.email = "";
    this.phone = "";
    this.events.emit("buyer:updated", { buyer: this.getBuyerData() });
  }
}
