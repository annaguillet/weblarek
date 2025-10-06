// components/views/Order/Success.ts
import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export interface ISuccessData {
  total: number;
}

export class Success extends Component<ISuccessData> {
  protected description: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    // ищем элементы внутри контейнера (container — div.order-success)
    this.description = ensureElement<HTMLElement>('.order-success__description', container);
    this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);

    this.closeButton.addEventListener('click', () => {
      this.events.emit('success:close');
    });
  }

  // сигнатура совместима с базовым Component<T>
  render(data?: Partial<ISuccessData>): HTMLElement {
    const total = data?.total ?? 0;
    this.description.textContent = `Списано ${total} синапсов`;
    return this.container;
  }
}
