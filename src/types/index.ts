export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type IPayment = 'cash' | 'card' | '';


export interface IBuyer {
    payment: IPayment;
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
    category?: string;
}
