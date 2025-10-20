import { FormBase } from './FormBase';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class OrderForm extends FormBase<{ payment: string; address: string }> {
  protected paymentButtons: NodeListOf<HTMLButtonElement>;
  protected addressInput: HTMLInputElement;
  protected selectedPayment: string | null = null;

  constructor(events: IEvents, container: HTMLElement) {
    super(events, container);

    this.paymentButtons = container.querySelectorAll<HTMLButtonElement>('.order__buttons button');
    this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', container);

    this.paymentButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedPayment = btn.name;
        this.paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
        btn.classList.add('button_alt-active');
    

        this.events.emit('order:change', { payment: this.selectedPayment });
    
        this.submitButton.disabled = !this.validate();
      });
    });
    
    this.addressInput.addEventListener('input', () => {
      this.events.emit('order:change', { address: this.addressInput.value });
    
      this.submitButton.disabled = !this.validate();
    });
    

    this.addressInput.addEventListener('input', () => {
      this.submitButton.disabled = !this.validate();
    });

    this.container.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.validate()) {

        this.events.emit('order:next', { 
          payment: this.selectedPayment, 
          address: this.addressInput.value
        });
      }
    });
  }

  validate(): boolean {
    return !!this.selectedPayment && this.addressInput.value.trim() !== '';
  }

  
}
