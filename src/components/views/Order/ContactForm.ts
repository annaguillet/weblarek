import { FormBase } from "./FormBase";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
import { AppEvents } from "../../../utils/constants";

export class ContactForm extends FormBase<{ email: string; phone: string }> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.emailInput = ensureElement<HTMLInputElement>(
      'input[name="email"]',
      container
    );
    this.phoneInput = ensureElement<HTMLInputElement>(
      'input[name="phone"]',
      container
    );

    [this.emailInput, this.phoneInput].forEach((input) => {
      input.addEventListener("input", () => {
        this.submitButton.disabled = !this.validate();

        this.events.emit(AppEvents.BUYER_CHANGE, {
          key: input.name,
          value: input.value,
        });
      });
    });

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      if (this.validate()) {
        const data = {
          email: this.emailInput.value,
          phone: this.phoneInput.value,
        };
        this.events.emit(AppEvents.ORDER_CONTACT_SUBMIT, data);
      } else {
      }
    });
  }

  validate(): boolean {
    return (
      this.emailInput.value.trim() !== "" && this.phoneInput.value.trim() !== ""
    );
  }
}
