import { ensureElement } from "../../../utils/utils";
import { Component } from "../../base/Component";
import { IEvents } from "../../base/Events";
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
    protected events: IEvents,
    container: HTMLElement,
    data: IProductCardData,
    actions?: ICardActions
  ) {
    super(container);

    this._id = data.id;
    this._title = data.title;
    this._price = data.price;
    this._inBasket = data.inBasket;

    this.titleElement = ensureElement<HTMLElement>(
      ".card__title",
      this.container
    );
    this.priceElement = ensureElement<HTMLElement>(
      ".card__price",
      this.container
    );
    this.button =
      this.container.querySelector<HTMLButtonElement>(".card__button") ||
      undefined;
    this.imageElement = ensureElement<HTMLImageElement>(
      ".card__image",
      this.container
    );
    this.categoryElement = ensureElement<HTMLElement>(
      ".card__category",
      this.container
    );

    this.title = data.title;
    this.price = data.price;
    this.inBasket = data.inBasket;
    this.image = data.image;
    this.category = data.category as keyof typeof categoryMap;

    if (this.button) {
      this.button.addEventListener("click", () => {
        if (this._inBasket) {
          this.events.emit("basket:remove", { id: this._id });
        } else {
          this.events.emit("basket:add", { id: this._id });
        }
        this._inBasket = !this._inBasket;
        this.inBasket = this._inBasket;
      });
    }

    if (actions?.onClick) {
      this.container.addEventListener("click", actions.onClick);
    }
  }

  // Сеттер и геттер для заголовка

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
    this.titleElement.textContent = value;
    if (this.imageElement) this.imageElement.alt = value;
  }

  // Сеттер и геттер для цены
  set price(value: number | null) {
    this._price = value;

    if (value === null) {
      this.priceElement.textContent = "Недоступно";
      if (this.button) this.button.disabled = true;
    } else {
      this.priceElement.textContent = `${value} синапсов`;
      if (this.button) {
        this.button.disabled = false;
        this.button.textContent = this._inBasket
          ? "Удалить из корзины"
          : "В корзину";
      }
    }
  }

  // Сеттер и геттер для состояния в корзине
  set inBasket(value: boolean) {
    this._inBasket = value;
    if (this.button && this._price !== null) {
      this.button.textContent = value ? "Удалить из корзины" : "В корзину";
    }
  }

  // Сеттер и геттер для изображения
  protected setImage(el: HTMLImageElement, src: string, alt: string) {
    el.src = src ? `${CDN_URL}/${src}` : "/images/placeholder.png";
    el.alt = alt;
  }

  set image(value: string) {
    this.setImage(this.imageElement, value, this.title);
  }

  // Сеттер и геттер для категории
  set category(value: CategoryKey | undefined) {
    if (!value || !this.categoryElement) return;

    this.categoryElement.textContent = value;
    this.categoryElement.className = "card__category"; // сброс классов

    const modifier = categoryMap[value];
    if (modifier) {
      this.categoryElement.classList.add(modifier);
    }
  }
}
