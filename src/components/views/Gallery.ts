import { Component } from "../base/Component";
import { IEvents } from "../base/Events";
import { IProduct } from "../../types";
import { ProductCard } from "./Card/CardGallery";
import { CartPreview } from "./Card/CardPreview";
import { Modal } from "../views/Order/Modal";
import { Basket } from "../../components/Models/Basket";
import { categoryMap } from "../../utils/constants";

interface ICatalog {
  products: HTMLElement[];
}

export class CatalogView extends Component<ICatalog> {
  protected list: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);
    this.list = this.container;
  }

  renderProducts(products: IProduct[], basket: Basket) {
    const template =
      document.querySelector<HTMLTemplateElement>("#card-catalog");
    if (!template) throw new Error("Шаблон #card-catalog не найден");

    const elements = products.map((product) => {
      const cardEl = template.content.firstElementChild!.cloneNode(
        true
      ) as HTMLElement;
      const categoryKey = product.category?.toLowerCase() as
        | keyof typeof categoryMap
        | undefined;

      new ProductCard(
        this.events,
        cardEl,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          inBasket: basket.hasInBasket(product.id),
          image: product.image,
          category: categoryKey,
        },
        {
          onClick: () => this.events.emit("product:selected", { product }),
        }
      );

      return cardEl;
    });

    this.products = elements;
  }

  set products(items: HTMLElement[]) {
    this.list.replaceChildren(...items);
  }

  public renderPreview(product: IProduct, basket: Basket, modal: Modal) {
    const template =
      document.querySelector<HTMLTemplateElement>("#card-preview");
    if (!template) return;

    const previewEl = template.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    modal.setContent(previewEl);
    modal.show();

    new CartPreview(this.events, previewEl, {
      id: product.id,
      title: product.title,
      description: product.description || "",
      price: product.price,
      inBasket: basket.hasInBasket(product.id),
      image: product.image,
      category: product.category?.toLowerCase() as
        | keyof typeof categoryMap
        | undefined,
    });
  }
}
