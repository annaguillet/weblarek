import { ensureElement } from "../../../utils/utils";
import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
import { categoryMap, CDN_URL, AppEvents } from "../../../utils/constants";

type CategoryKey = keyof typeof categoryMap;

export interface ICardPreviewData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  inBasket: boolean;
  image: string;
  category?: CategoryKey;
}

export class CardPreview extends Component<{}> {
  protected titleElement: HTMLElement;
  protected textElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected button: HTMLButtonElement;
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;

  private _id: string;
  private _title: string;
  private _description: string;
  private _price: number | null;
  private _inBasket: boolean;

  constructor(
    protected events: IEvents,
    container: HTMLElement,
    data: ICardPreviewData
  ) {
    super(container);

    this._id = data.id;
    this._title = data.title;
    this._description = data.description;
    this._price = data.price;
    this._inBasket = data.inBasket;

    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.textElement = ensureElement<HTMLElement>(
      ".card__text",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );
    this.button = ensureElement<HTMLButtonElement>(
      ".card__button",
      this.container
    );
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container
    );

    this.title = data.title;
    this.description = data.description;
    this.price = data.price;
    this.inBasket = data.inBasket;
    this.image = data.image;
    this.category = data.category;

    this.button.addEventListener("click", () => {
      if (this._inBasket) {
        this.events.emit(AppEvents.BASKET_REMOVE, { id: this._id });
      } else {
        this.events.emit(AppEvents.BASKET_ADD, { id: this._id });
      }
      this._inBasket = !this._inBasket;
      this.inBasket = this._inBasket;
    });
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
    this.imageElement.alt = value;
  }

  set description(value: string) {
    this._description = value;
    this.textElement.textContent = value;
  }

  set price(value: number | null) {
    this._price = value;

    if (value === null) {
      this.priceElement.textContent = "Недоступно";
      this.button.disabled = true;
    } else {
      this.priceElement.textContent = `${value} синапсов`;
      this.button.disabled = false;
      this.button.textContent = this._inBasket
        ? "Удалить из корзины"
        : "В корзину";
    }
  }

  set inBasket(value: boolean) {
    this._inBasket = value;
    if (this._price !== null) {
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
    Object.values(categoryMap).forEach((cls) => {
      this.categoryElement.classList.remove(cls);
    });
    this.categoryElement.classList.add(categoryMap[value]);
  }
}
