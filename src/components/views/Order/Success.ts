import { Component } from "../../base/Component";
import { ensureElement } from "../../../utils/utils";
import { AppEvents } from "../../../utils/constants";

interface ISuccessData {
  total: number;
}

export class Success extends Component<ISuccessData> {
  protected description: HTMLElement;
  protected closeButton: HTMLButtonElement;
  private total: number = 0;

  constructor(container: HTMLElement, private events?: any) {
    super(container);

    this.description = ensureElement<HTMLElement>(
      ".order-success__description",
      this.container
    );
    this.closeButton = ensureElement<HTMLButtonElement>(
      ".order-success__close",
      this.container
    );

    this.closeButton.addEventListener("click", () => {
      this.events?.emit(AppEvents.SUCCESS_CLOSE);
    });
  }

  setTotal(total: number) {
    this.total = total;
    this.description.textContent = `Списано ${total} синапсов`;
  }

  render(): HTMLElement {
    this.description.textContent = `Списано ${this.total} синапсов`;
    return this.container;
  }
}
