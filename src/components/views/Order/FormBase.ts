import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { ensureElement} from '../../../utils/utils';
import { AppEvents} from '../../../utils/constants';

export abstract class FormBase<T> extends Component<T> {
  protected submitButton: HTMLButtonElement;
  protected errorElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
    this.errorElement = ensureElement<HTMLElement>('.form__errors', container);

    // Общая валидация по событиям от Buyer
    this.events.on(AppEvents.FORM_VALIDATE , (errors: Record<string, string>) => {
      this.updateErrors(errors);
    });

    // Делегируем ввод всех input-ов
    this.container.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (!target?.name) return;
      this.events.emit(AppEvents.BUYER_CHANGE, { key: target.name, value: target.value });
    });
  }

  protected updateErrors(errors: Record<string, string>) {
    this.clearError();
    let hasErrors = false;

    Object.entries(errors).forEach(([key, message]) => {
      const field = this.container.querySelector<HTMLInputElement>(`[name="${key}"]`);
      if (field) {
        field.setCustomValidity(message);
        field.reportValidity();
        if (message) hasErrors = true;
      }
    });

    this.submitButton.disabled = hasErrors;
  }

  showError(message: string) {
    this.errorElement.textContent = message;
  }

  clearError() {
    this.errorElement.textContent = '';
  }

  abstract validate(): boolean;
}
