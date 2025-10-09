import { Component } from '../../base/Component';
import { ensureElement } from '../../../utils/utils';

interface ISuccessData {
  total: number;
}

export class Success extends Component<ISuccessData> {
  protected description: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor(container: HTMLElement, private events?: any) {
    super(container);

    this.description = ensureElement<HTMLElement>('.order-success__description', this.container);
    this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

    this.closeButton.addEventListener('click', () => {
      this.events?.emit('success:close');
    });
  }

  set total(value: number) {
    this.description.textContent = `Списано ${value} синапсов`;
  }
}
