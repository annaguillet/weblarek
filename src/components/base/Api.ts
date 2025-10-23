type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export class Api {
  readonly baseUrl: string;
  protected options: RequestInit;

  constructor(baseUrl: string, options: RequestInit = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as object ?? {})
      }
    };
  }

  /**
   * Единая обработка ответа
   */
  protected handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      return response.json();
    } else {
      // читаем тело ошибки, если сервер что-то вернул
      return response.json()
        .then(data => Promise.reject(data.error ?? response.statusText))
        .catch(() => Promise.reject(response.statusText));
    }
  }

  /**
   * GET-запрос
   */
  get<T extends object>(uri: string) {
    return fetch(this.baseUrl + uri, {
      ...this.options,
      method: 'GET'
    }).then(this.handleResponse<T>)
      .catch(err => {
        console.error(`❌ Ошибка GET ${uri}:`, err);
        throw err;
      });
  }

  /**
   * POST/PUT/DELETE-запрос
   */
  post<T extends object>(uri: string, data: object, method: ApiPostMethods = 'POST') {
    return fetch(this.baseUrl + uri, {
      ...this.options,
      method,
      body: JSON.stringify(data)
    }).then(this.handleResponse<T>)
      .catch(err => {
        console.error(`❌ Ошибка ${method} ${uri}:`, err);
        throw err;
      });
  }
}

