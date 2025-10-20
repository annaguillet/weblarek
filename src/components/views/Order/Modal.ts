import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';
import { ensureElement } from '../../../utils/utils';

export class Modal extends Component<{ content: HTMLElement }> {
  protected containerElement: HTMLElement;
  protected closeButton: HTMLButtonElement;
  protected contentElement: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.containerElement = container;
    this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
    this.contentElement = ensureElement<HTMLElement>('.modal__content', container);


    this.closeButton.addEventListener('click', () => this.hide());


    this.containerElement.addEventListener('click', (e) => {
      if (e.target === this.containerElement) this.hide();
    });


    this.containerElement.style.display = 'none';
    this.containerElement.style.pointerEvents = 'none';
  }

  show() {
    this.containerElement.classList.add('modal_active');
    this.containerElement.style.display = 'flex';
    this.containerElement.style.pointerEvents = 'auto';
  }

  hide() {
    this.containerElement.classList.remove('modal_active');
    this.containerElement.style.display = 'none';
    this.containerElement.style.pointerEvents = 'none';
    this.events.emit('modal:close');
  }

  setContent(node: HTMLElement) {
    this.contentElement.replaceChildren(node);
  }

  render(data?: Partial<{ content: HTMLElement }>): HTMLElement {
    if (data?.content) {
      this.setContent(data.content);
    }
    return this.containerElement;
  }

  get isVisible(): boolean {
    return this.containerElement.classList.contains('modal_active');
  }
}

