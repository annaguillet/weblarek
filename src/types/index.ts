export type ApiPostMethods = "POST" | "PUT" | "DELETE";

export interface IApi {
  get<T extends object>(uri: string): Promise<T>;
  post<T extends object>(
    uri: string,
    data: object,
    method?: ApiPostMethods
  ): Promise<T>;
}

export type TPayment = "cash" | "card" | "";

export type TCategory = 'софт-скил' | 'хард-скил' | 'дополнительное' | 'кнопка' | 'другое';

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  price: number | null;
  category?: TCategory;
}

export interface IOrderRequest extends IBuyer {
  buyer?: IBuyer;
  items: IProduct[];
  total: number;
}








