export default class Company {
  crn: string;
  exists: boolean;
  name: string;
  status: string;
  address: string;
  confirmationStatementDue: string;
  accountsDue: string;

  constructor(crn: string, exists: boolean, rawData?: any) {
    this.crn = crn;
    this.exists = exists;

    if (!exists) {
      this.name = '';
      this.status = '';
      this.address = '';
      this.confirmationStatementDue = '';
      this.accountsDue = '';
    } else {
      let address = '';
      if (rawData.registered_office_address) {
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
        address = elements.filter((e) => e !== undefined && e !== null).join(', ');
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

      let status: string = statusEnumMap.has(rawData.company_status)
        ? statusEnumMap.get(rawData.company_status)
        : rawData.company_status;
      if (rawData.company_status_detail !== undefined) {
        const statusDetail = statusDetailEnumMap.has(rawData.company_status_detail)
          ? statusDetailEnumMap.get(rawData.company_status_detail)
          : rawData.company_status_detail;
        status += ` — ${statusDetail}`;
      }

      const confirmationStatementDue: string = rawData.confirmation_statement !== undefined
        ? Company.formatDate(rawData.confirmation_statement.next_due)
        : '';

      const accountsDue: string = rawData.accounts?.next_due !== undefined
        ? Company.formatDate(rawData.accounts.next_due)
        : '';

      this.name = rawData.company_name;
      this.status = status;
      this.address = address;
      this.confirmationStatementDue = confirmationStatementDue;
      this.accountsDue = accountsDue;
    }
  }

  private static formatDate(str: string): string {
    const regex = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    const substitution = '$3/$2/$1';
    return str.replace(regex, substitution);
  }
}
