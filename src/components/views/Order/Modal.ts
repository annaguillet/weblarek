import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class Modal extends Component<{}> {
  protected containerElement: HTMLElement;
  protected closeButton: HTMLButtonElement;
  protected contentElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.containerElement = container; // <--- используем сам контейнер
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this.contentElement = ensureElement<HTMLElement>('.modal__content', container);

    this.closeButton.addEventListener('click', () => this.hide());
    this.containerElement.addEventListener('click', (e) => {
      if (e.target === this.containerElement) this.hide();
    });
  }

  show() {
    this.containerElement.classList.add('modal_active');
  }

  hide() {
    this.containerElement.classList.remove('modal_active');
  }

  setContent(node: HTMLElement) {
    this.contentElement.replaceChildren(node);
  }
}