import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
import { AppEvents } from "../../../utils/constants";

export abstract class FormBase<T> extends Component<T> {
  protected submitButton: HTMLButtonElement;
  protected errorElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
    this.errorElement = ensureElement<HTMLElement>('.form__errors', container);

    this.container.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target?.name) return;
      this.events.emit(AppEvents.BUYER_CHANGE, { key: target.name, value: target.value });
    });
  }

  public updateErrors(errors: Record<string, string>) {
    this.container.querySelectorAll<HTMLInputElement>('[name]').forEach((field) => field.setCustomValidity(''));

    let hasErrors = false;

    Object.entries(errors).forEach(([key, message]) => {
      const field = this.container.querySelector<HTMLInputElement>(`[name="${key}"]`);
      if (field && message) {
        field.setCustomValidity(message);
        hasErrors = true;
      }
    });

    this.submitButton.disabled = hasErrors;
    this.errorElement.textContent = hasErrors ? 'Исправьте ошибки в форме' : '';
  }
}
