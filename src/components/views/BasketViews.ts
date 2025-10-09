import { IBasketEvent } from "../../types/index";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

interface IBasketView {
    items: HTMLElement[];
    total: number;
};

export class BasketView extends Component<IBasketView> {
    protected basketTitle: HTMLElement;
    protected basketList: HTMLElement;
    protected basketButton: HTMLButtonElement;
    protected basketPrice: HTMLElement;

    constructor(container: HTMLElement, actions?: IBasketEvent) {
        super(container);

        this.basketTitle = ensureElement<HTMLElement>('.modal__title', this.container);
        this.basketList = ensureElement<HTMLElement>('.basket__list', this.container);
        this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);
        this.basketPrice = ensureElement<HTMLElement>('.basket__price', this.container);

        if (actions?.onOrder) {
            this.basketButton.addEventListener('click', actions.onOrder);
        };
    };

    set items(value: HTMLElement[]) {
        if (value.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty';
            emptyMessage.textContent = 'Корзина пуста';
            this.items = [emptyMessage];
            this.buttonDisabled = true;
            this.buttonText = 'Оформить';
        } else {
            this.basketList.replaceChildren(...value);
            this.buttonDisabled = false;
            this.buttonText = 'Оформить';
        };
    };

    set buttonText(value: string) {
        this.basketButton.textContent = String(value);
    };

    set buttonDisabled(value: boolean) {
        this.basketButton.disabled = value;
    };

    set total(value: number) {
        this.basketPrice.textContent = `${value} синапсов`;
    };
};