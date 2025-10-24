import { FormBase } from "./FormBase";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
import { AppEvents } from "../../../utils/constants";

export class OrderForm extends FormBase<{ payment: string; address: string }> {
  protected paymentButtons: NodeListOf<HTMLButtonElement>;
  protected addressInput: HTMLInputElement;
  protected selectedPayment: string | null = null;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.paymentButtons = container.querySelectorAll<HTMLButtonElement>(
      ".order__buttons button"
    );
    this.addressInput = ensureElement<HTMLInputElement>(
      'input[name="address"]',
      container
    );

    this.paymentButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedPayment = btn.name;
        this.paymentButtons.forEach((b) =>
          b.classList.remove("button_alt-active")
        );
        btn.classList.add("button_alt-active");

        this.events.emit(AppEvents.BUYER_CHANGE, {
          key: "payment",
          value: this.selectedPayment,
        });
      });
    });

    this.addressInput.addEventListener("input", () => {
      this.events.emit(AppEvents.BUYER_CHANGE, {
        key: "address",
        value: this.addressInput.value,
      });
    });

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_NEXT, {
        payment: this.selectedPayment,
        address: this.addressInput.value,
      });
    });
  }
}
