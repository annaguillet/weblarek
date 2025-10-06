import { Component } from "../../components/base/Component";
import { IEvents } from "../../components/base/Events";
import { Basket } from "../../components/Models/Basket";
import { BasketItem, IBasketItemData } from "./Card/BasketItem";
import { ensureElement } from "../../utils/utils";

export class BasketView extends Component<{}> {
  private basketEl!: HTMLElement;
  private listEl!: HTMLElement;
  private totalEl!: HTMLElement;
  private orderBtn!: HTMLButtonElement;

  constructor(
    private events: IEvents,
    private basket: Basket,
    private modal: any
  ) {
    super(document.body); // контейнер модалки задается отдельно

    this.events.on("basket:open", () => this.render());
    this.events.on("basket:changed", () => this.update());
  }

  private getTemplates() {
    const basketTemplate =
      document.querySelector<HTMLTemplateElement>("#basket");
    const itemTemplate =
      document.querySelector<HTMLTemplateElement>("#card-basket");
    if (!basketTemplate || !itemTemplate)
      throw new Error("Шаблон корзины или элемента корзины не найден");
    return { basketTemplate, itemTemplate };
  }

  public render(): HTMLElement {
    const { basketTemplate, itemTemplate } = this.getTemplates();

    this.basketEl = basketTemplate.content.firstElementChild!.cloneNode(
      true
    ) as HTMLElement;
    this.listEl = ensureElement<HTMLElement>(".basket__list", this.basketEl);
    this.totalEl = ensureElement<HTMLElement>(".basket__price", this.basketEl);
    this.orderBtn = ensureElement<HTMLButtonElement>(
      ".basket__button",
      this.basketEl
    );

    this.renderContents(itemTemplate);

    this.listEl.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest(".basket__item-delete");
      if (!btn) return;
      const li = btn.closest(".basket__item") as HTMLElement | null;
      const id = li?.dataset.id;
      if (id) this.events.emit("basket:remove", { id });
    });

    this.orderBtn.onclick = () => this.events.emit("order:start");

    this.modal.setContent(this.basketEl);
    this.modal.show();

    return this.basketEl; // ✅ возвращаем HTMLElement
  }

  private renderContents(itemTemplate: HTMLTemplateElement) {
    this.listEl.innerHTML = "";
    this.basket.getBasket().forEach((product, index) => {
      const itemEl = itemTemplate.content.firstElementChild!.cloneNode(
        true
      ) as HTMLElement;
      itemEl.dataset.id = product.id;

      const data: IBasketItemData = {
        id: product.id,
        title: product.title,
        price: product.price || 0,
        index: index + 1,
      };

      new BasketItem(this.events, itemEl, data);
      this.listEl.appendChild(itemEl);
    });

    this.totalEl.textContent = `${this.basket.getBasketTotal()} синапсов`;
  }

  private update() {
    if (!this.basketEl) return; // корзина не открыта
    const itemTemplate =
      document.querySelector<HTMLTemplateElement>("#card-basket")!;
    this.renderContents(itemTemplate);
  }
}
