import { ensureElement } from "../../../utils/utils";
import { Component } from "../../base/Component";
import { categoryMap, CDN_URL } from "../../../utils/constants";

type CategoryKey = keyof typeof categoryMap;

export interface IProductCardData {
  id: string;
  title: string;
  price: number | null;
  inBasket: boolean;
  image: string;
  category?: CategoryKey;
}

export interface ICardActions {
  onClick?: () => void;
  onAddToBasket?: (id: string, inBasket: boolean) => void; // новый callback
}

export class ProductCard extends Component<{}> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected button?: HTMLButtonElement;
  protected imageElement: HTMLImageElement;
  protected categoryElement?: HTMLElement;

  private _id: string;
  private _title: string;
  private _price: number | null;
  private _inBasket: boolean;

  constructor(
    container: HTMLElement,
    data: IProductCardData,
    actions?: ICardActions
  ) {
    super(container);

    this._id = data.id;
    this._title = data.title;
    this._price = data.price;
    this._inBasket = data.inBasket;

    this.titleElement = ensureElement<HTMLElement>(".card__title", this.container);
    this.priceElement = ensureElement<HTMLElement>(".card__price", this.container);
    this.button = this.container.querySelector<HTMLButtonElement>(".card__button") || undefined;
    this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);
    this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);

    this.title = data.title;
    this.price = data.price;
    this.inBasket = data.inBasket;
    this.image = data.image;
    this.category = data.category;

    if (this.button) {
      this.button.addEventListener("click", () => {
        this._inBasket = !this._inBasket;
        this.inBasket = this._inBasket;

        // теперь вместо this.events.emit вызываем callback
        if (actions?.onAddToBasket) {
          actions.onAddToBasket(this._id, this._inBasket);
        }
      });
    }

    if (actions?.onClick) {
      this.container.addEventListener("click", actions.onClick);
    }
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
    if (this.imageElement) this.imageElement.alt = value;
  }

  set price(value: number | null) {
    this._price = value;
    if (value === null) {
      this.priceElement.textContent = "Недоступно";
      if (this.button) this.button.disabled = true;
    } else {
      this.priceElement.textContent = `${value} синапсов`;
      if (this.button) {
        this.button.disabled = false;
        this.button.textContent = this._inBasket ? "Удалить из корзины" : "В корзину";
      }
    }
  }

  set inBasket(value: boolean) {
    this._inBasket = value;
    if (this.button && this._price !== null) {
      this.button.textContent = value ? "Удалить из корзины" : "В корзину";
    }
  }

  protected setImage(el: HTMLImageElement, src: string, alt: string) {
    el.src = src ? `${CDN_URL}/${src}` : "/images/placeholder.png";
    el.alt = alt;
  }

  set image(value: string) {
    this.setImage(this.imageElement, value, this.title);
  }

  set category(value: CategoryKey | undefined) {
    if (!value || !this.categoryElement) return;

    this.categoryElement.textContent = value;
    this.categoryElement.className = "card__category";

    const modifier = categoryMap[value];
    if (modifier) {
      this.categoryElement.classList.add(modifier);
    }
  }
}
