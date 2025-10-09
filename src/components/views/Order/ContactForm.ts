import { FormBase } from './FormBase';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class ContactForm extends FormBase<{ email: string; phone: string }> {
  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
    this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

    [this.emailInput, this.phoneInput].forEach(input => {
      input.addEventListener('input', () => {
        this.submitButton.disabled = !this.validate();
      });
    });

    this.container.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {
        this.events.emit('order:submit', { email: this.emailInput.value, phone: this.phoneInput.value });
      }
    });
  }

  validate(): boolean {
    return this.emailInput.value.trim() !== '' && this.phoneInput.value.trim() !== '';
  }
}
