import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export abstract class FormBase<T> extends Component<T> {
  protected submitButton: HTMLButtonElement;
  protected errorElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
    this.errorElement = ensureElement<HTMLElement>('.form__errors', container);
  }

  abstract validate(): boolean;

  showError(message: string) {
    this.errorElement.textContent = message;
  }

  clearError() {
    this.errorElement.textContent = '';
  }
}
