export default class CompaniesHouseApi {
  private readonly baseUrl = 'https://api.company-information.service.gov.uk';
  private headers: Headers;

  constructor(apiKey: string) {
    this.headers = new Headers();
    this.headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);
  }

  async request(path: string): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.headers;
    // TODO: Fails here on 429
    // https://forum.aws.chdev.org/t/cors-headers-missing-from-429-response/5209
    const response: Response = await fetch(url, { method: 'GET', headers });
    return response;
  }
}
