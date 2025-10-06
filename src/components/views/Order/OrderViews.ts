import { IEvents } from "../../base/Events";
import { Modal } from "./Modal";
import { Basket } from "../../Models/Basket";
import { Buyer } from "../../Models/Buyer";
import { OrderForm } from "./OrderForm";
import { ContactForm } from "./ContactForm";
import { Success } from "./Success";

export class OrderView {
  constructor(
    private events: IEvents,
    private basket: Basket,
    private modal: Modal,
    private buyer: Buyer
  ) {
    this.events.on("order:start", () => this.renderOrderForm());

    this.events.on<{ payment: string; address: string; total: number }>(
      "order:next",
      (data) => this.renderContactForm(data)
    );

    this.events.on<{ email: string; phone: string }>("order:submit", (data) =>
      this.renderSuccess(data)
    );
  }

  private renderOrderForm() {
    const template = document.querySelector<HTMLTemplateElement>("#order");
    if (!template) return;

    const orderEl = template.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    new OrderForm(this.events, orderEl, this.basket);

    this.modal.setContent(orderEl);
    this.modal.show();
  }

  private renderContactForm(orderData: {
    payment: string;
    address: string;
    total: number;
  }) {
    const template = document.querySelector<HTMLTemplateElement>("#contacts");
    if (!template) return;

    const contactEl = template.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    new ContactForm(this.events, contactEl);

    this.buyer.setBuyerData({
      payment: orderData.payment as any, // здесь может быть приведение, если у тебя IPayment enum
      address: orderData.address,
    });

    this.modal.setContent(contactEl);
    this.modal.show();
  }

  private renderSuccess(contactData: { email: string; phone: string }) {
    const total = this.basket.getBasketTotal();
    this.basket.clearBasket();

    const template = document.querySelector<HTMLTemplateElement>("#success");
    if (!template) return;

    const successEl = template.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    const successComponent = new Success(successEl, this.events);

    this.buyer.setBuyerData({
      email: contactData.email,
      phone: contactData.phone,
    });

    this.modal.setContent(successEl);
    this.modal.show();

    successComponent.render({ total });

    this.events.on("success:close", () => {
      this.buyer.clearBuyerData();
      this.modal.hide();
      this.events.emit("catalog:show");
    });
  }
}
