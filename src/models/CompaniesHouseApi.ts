export interface ICompaniesHouseApi {
  request(path: string): Promise<Response>;
}

export default class CompaniesHouseApi implements ICompaniesHouseApi {
  private readonly baseUrl = 'https://api.company-information.service.gov.uk';
  private headers: Headers;

  constructor(apiKey: string) {
    this.headers = new Headers();
    this.headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);
  }

  async request(path: string): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.headers;
    try {
      return await fetch(url, { method: 'GET', headers });
    } catch (e) {
      console.error('API request failed', e);
      return Promise.reject(e);
    }
  }
}
