import { FormBase } from "./FormBase";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
import { AppEvents } from "../../../utils/constants";

/**
 * Форма ввода контактных данных покупателя.
 * Не выполняет валидацию — только сообщает о вводе данных
 * и реагирует на результаты проверки из модели Buyer.
 */
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

    this.container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.events.emit(AppEvents.ORDER_CONTACT_SUBMIT, {
        email: this.emailInput.value,
        phone: this.phoneInput.value,
      });
    });
  }

}
