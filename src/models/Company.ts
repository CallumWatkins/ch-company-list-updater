import { ICompaniesHouseApi } from './CompaniesHouseApi';

export default class Company {
  crn: string;
  exists: boolean;
  name: string;
  creationDate: string;
  cessationDate: string | null;
  status: string;
  address: string | null;
  confirmationStatementDue: string | null;
  accountsDue: string | null;
  humanUrl: string;
  directors: string[] | null;

  constructor(crn: string, exists: boolean, rawData?: any, rawDirectorsData?: any) {
    this.crn = crn;
    this.exists = exists;
    this.humanUrl = `https://find-and-update.company-information.service.gov.uk/company/${crn}`;

    if (!exists) {
      this.name = '';
      this.status = '';
      this.creationDate = '';
      this.cessationDate = null;
      this.address = null;
      this.confirmationStatementDue = null;
      this.accountsDue = null;
      this.directors = null;
    } else {
      this.name = rawData.company_name;

      this.creationDate = Company.formatDate(rawData.date_of_creation);

      this.cessationDate = rawData.date_of_cessation !== undefined
        && rawData.company_status !== 'active'
        ? Company.formatDate(rawData.date_of_cessation)
        : null;

      this.address = null;
      if (rawData.registered_office_address !== undefined) {
        const elements: string[] = [
          rawData.registered_office_address.care_of,
          rawData.registered_office_address.po_box,
          rawData.registered_office_address.premises,
          rawData.registered_office_address.address_line_1,
          rawData.registered_office_address.address_line_2,
          rawData.registered_office_address.locality,
          rawData.registered_office_address.region,
          rawData.registered_office_address.country,
          rawData.registered_office_address.postal_code,
        ];
        this.address = elements.filter((e) => e !== undefined && e !== null).join(', ');
      }

      const statusEnumMap = new Map<string, string>([
        ['active', 'Active'],
        ['dissolved', 'Dissolved'],
        ['liquidation', 'Liquidation'],
        ['receivership', 'Receiver Action'],
        ['converted-closed', 'Converted / Closed'],
        ['voluntary-arrangement', 'Voluntary Arrangement'],
        ['insolvency-proceedings', 'Insolvency Proceedings'],
        ['administration', 'In Administration'],
        ['open', 'Open'],
        ['closed', 'Closed'],
        ['registered', 'Registered'],
        ['removed', 'Removed'],
      ]);

      const statusDetailEnumMap = new Map<string, string>([
        ['transferred-from-uk', 'Transfer from UK'],
        ['active-proposal-to-strike-off', 'Active proposal to strike off'],
        ['petition-to-restore-dissolved', 'Petition to restore dissolved'],
        ['transformed-to-se', 'Transformed to SE'],
        ['converted-to-plc', 'Converted to PLC'],
        ['converted-to-uk-societas', 'Converted to UK Societas'],
        ['converted-to-ukeig', 'Converted to UKEIG'],
      ]);

      this.status = statusEnumMap.has(rawData.company_status)
        ? statusEnumMap.get(rawData.company_status)
        : rawData.company_status;
      if (rawData.company_status_detail !== undefined) {
        const statusDetail = statusDetailEnumMap.has(rawData.company_status_detail)
          ? statusDetailEnumMap.get(rawData.company_status_detail)
          : rawData.company_status_detail;
        this.status += ` — ${statusDetail}`;
      }

      this.confirmationStatementDue = rawData.confirmation_statement !== undefined
        && rawData.company_status !== 'dissolved'
        ? Company.formatDate(rawData.confirmation_statement.next_due)
        : null;

      this.accountsDue = rawData.accounts?.next_due !== undefined
        && rawData.company_status !== 'dissolved'
        ? Company.formatDate(rawData.accounts.next_due)
        : null;

      this.directors = rawDirectorsData?.items !== undefined
        ? (rawDirectorsData.items as { name: string, officer_role: 'director' | 'secretary' | string, resigned_on?: unknown }[])
          .filter((r) => r.officer_role === 'director' && r.resigned_on === undefined)
          .map((r) => r.name)
        : null;
    }
  }

  private static formatDate(str: string): string {
    const regex = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    const substitution = '$3/$2/$1';
    return str.replace(regex, substitution);
  }

  public static getCsvHeader() {
    return 'CRN,Name,Status,Confirmation Statement Due,Accounts Due,Director,Address';
  }

  public getCsvRow() {
    function makeCsvField(s: string | null) {
      if (s === null) return '';
      if (s.includes(',') || s.includes('"')) {
        const s2 = s.replaceAll('"', '""');
        return `"${s2}"`;
      }
      return s;
    }

    function makeCsvRow(values: (string | null)[]) {
      return values
        .map(makeCsvField)
        .join(',');
    }

    return makeCsvRow([this.crn, this.name, this.status, this.confirmationStatementDue, this.accountsDue, this.directors?.[0] ?? null, this.address]);
  }

  public static getTsvHeader() {
    return 'CRN\tName\tStatus\tConfirmation Statement Due\tAccounts Due\tDirector\tAddress';
  }

  public getTsvRow() {
    function makeTsvField(s: string | null) {
      if (s === null) return '';
      return s;
    }

    function makeTsvRow(values: (string | null)[]) {
      return values
        .map(makeTsvField)
        .join('\t');
    }

    return makeTsvRow([this.crn, this.name, this.status, this.confirmationStatementDue, this.accountsDue, this.directors?.[0] ?? null, this.address]);
  }
}

async function delay(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

export function waitRateLimit(ratelimitResetEpochSeconds: number): { ratelimitResetEpoch: number, promise: Promise<void> } | undefined {
  const currentEpochSeconds = Math.round(Date.now() / 1000);
  const ratelimitResetDifferenceSeconds: number = ratelimitResetEpochSeconds - currentEpochSeconds;
  const rateLimitBufferSeconds = 3;
  const ratelimitResetEpoch = ratelimitResetEpochSeconds + rateLimitBufferSeconds;
  const delayTimeSeconds = ratelimitResetDifferenceSeconds + rateLimitBufferSeconds;
  console.log(
    'Rate limit exceeded!',
    'Current time:',
    currentEpochSeconds,
    'Reset time:',
    ratelimitResetEpochSeconds,
    'Waiting for',
    ratelimitResetDifferenceSeconds,
    'seconds.',
  );

  if (delayTimeSeconds > 0) {
    return { ratelimitResetEpoch, promise: delay(delayTimeSeconds) };
  }

  return undefined;
}

export async function handleResponse(response: Response): Promise<ReturnType<typeof loadCompany> | 200 | 404> {
  switch (response.status) {
    case 200: {
      // Success
      return 200;
    }
    case 429: {
      // Rate limit exceeded
      const ratelimitResetHeader = response.headers.get('x-ratelimit-reset');
      if (ratelimitResetHeader === null) {
        throw new Error('Missing x-ratelimit-reset header');
      }
      return { status: 'rate-limit', ratelimitResetEpochSeconds: parseInt(ratelimitResetHeader, 10) };
    }
    case 404: {
      // Not found
      return 404;
    }
    case 401: {
      // Authorisation failed
      return { status: 'error', error: `API authorisation failed: ${response.json()}` };
    }
    default: {
      // Unexpected status code
      return { status: 'error', error: `Unexpected status code: ${response.status}` };
    }
  }
}

export async function loadCompany(crn: string, api: ICompaniesHouseApi): Promise<
| { status: 'success', data: Company }
| { status: 'rate-limit', ratelimitResetEpochSeconds: number }
| { status: 'error', error: unknown }
> {
  let companyData: any;

  {
    let companyResponse: Response;
    try {
      companyResponse = await api.request(`/company/${crn}`);
    } catch (e) {
      // FIXME: Until 429 includes CORS headers, assume that any error is a 5m rate limit (see #3)
      return { status: 'rate-limit', ratelimitResetEpochSeconds: Math.floor(Date.now() / 1000) + (5 * 60) };
      // return { status: 'error', error: e };
    }

    const handledResponse = await handleResponse(companyResponse);
    if (handledResponse === 404) return { status: 'success', data: new Company(crn, false) };

    if (handledResponse !== 200) return handledResponse;

    companyData = await companyResponse.json();
  }

  {
    let companyDirectorsRsponse: Response;
    try {
      companyDirectorsRsponse = await api.request(`/company/${crn}/officers?order_by=appointed_on`);
    } catch (e) {
      // FIXME: Until 429 includes CORS headers, assume that any error is a 5m rate limit (see #3)
      return { status: 'rate-limit', ratelimitResetEpochSeconds: Math.floor(Date.now() / 1000) + (5 * 60) };
      // return { status: 'error', error: e };
    }

    const handledResponse = await handleResponse(companyDirectorsRsponse);
    if (handledResponse === 404) return { status: 'error', error: `Directors not found: ${companyDirectorsRsponse.json()}` };

    if (handledResponse !== 200) return handledResponse;

    const companyDirectorsData = await companyDirectorsRsponse.json();
    return { status: 'success', data: new Company(crn, true, companyData, companyDirectorsData) };
  }
}
