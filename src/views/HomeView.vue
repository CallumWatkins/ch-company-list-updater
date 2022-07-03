<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <form action="" @submit.prevent="saveApiKey">
            <fieldset :disabled="apiKeySaving || apiKeyValid">
              <div class="field is-narrow">
                <label for="api-key" id="api-key-label" class="label">API Key</label>
                <div class="control has-icons-left" :class="{'has-icons-right': apiKeyValid}">
                  <input type="password" id="api-key" aria-labelledby="#api-key-label"
                    class="input" :class="{'is-danger': apiKeyInvalid}" v-model="apiKey">
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-key" />
                  </span>
                  <span class="icon is-small is-right" v-if="apiKeyValid">
                    <font-awesome-icon icon="fa-solid fa-check" />
                  </span>
                </div>
                <p class="help is-danger" v-if="apiKeyInvalid">
                  Invalid API key
                </p>
              </div>
              <div class="field" v-if="!apiKeyValid">
                <div class="control">
                  <button type="submit" class="button is-primary"
                    :class="{'is-loading': apiKeySaving}">
                    Save
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </section>
  <section class="section" v-if="apiKeyValid">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <form action="" @submit.prevent="loadCompanies">
            <fieldset :disabled="loadingCompanies">
              <div class="field is-narrow">
                <label for="crns" id="crns-label" class="label">
                  Company Registration Numbers (CRNs)
                </label>
                <div class="control" :class="{'is-loading': loadingCompanies}">
                  <textarea id="crns" aria-labelledby="#crns-label" rows="10"
                    class="textarea" :class="{'is-danger': crnsInvalid}"
                    v-model.lazy="crnsMultiline"></textarea>
                </div>
                <p class="help is-danger" v-if="crnsInvalid">
                  Each line should contain a single CRN
                </p>
              </div>
              <div class="field">
                <div class="control">
                  <button type="submit" class="button is-primary"
                    :class="{'is-loading': loadingCompanies}">
                    Load
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div v-if="loadingCompanies">
        <p>Loaded {{ loadedCompaniesCount }} of {{ totalCompaniesCount }} ...</p>
        <p v-if="rateLimited">
          Rate limited! Waiting for {{ Math.max(ratelimitResetEpoch - Math.round(currentEpochMilliseconds / 1000), 0) }} seconds.
        </p>
      </div>
    </div>
  </section>
  <section class="section" v-if="finishedLoadingCompanies">
    <div class="container is-fluid">
      <div class="table-container">
        <table class="table company-data">
          <thead>
            <tr>
              <th><a href="#" v-tippy="copiedColumnName === 'crn' ? 'Copied!' : 'Click to Copy'"
                @click.prevent="copyColumn('crn')" @keypress.enter="copyColumn('crn')">
                CRN</a></th>
              <th><a href="#" v-tippy="copiedColumnName === 'name' ? 'Copied!' : 'Click to Copy'"
                @click.prevent="copyColumn('name')" @keypress.enter="copyColumn('name')">
                Name</a></th>
              <th><a href="#" v-tippy="copiedColumnName === 'status' ? 'Copied!' : 'Click to Copy'"
                @click.prevent="copyColumn('status')" @keypress.enter="copyColumn('status')">
                Status</a></th>
              <th><a href="#" v-tippy="copiedColumnName === 'confirmationStatementDue' ? 'Copied!' : 'Click to Copy'"
                @click.prevent="copyColumn('confirmationStatementDue')" @keypress.enter="copyColumn('confirmationStatementDue')">
                Conf. Stmt. Due</a></th>
              <th><a href="#" v-tippy="copiedColumnName === 'accountsDue' ? 'Copied!' : 'Click to Copy'"
                @click.prevent="copyColumn('accountsDue')" @keypress.enter="copyColumn('accountsDue')">
                Accounts Due</a></th>
              <th><a href="#" v-tippy="copiedColumnName === 'address' ? 'Copied!' : 'Click to Copy'"
                @click.prevent="copyColumn('address')" @keypress.enter="copyColumn('address')">
                Address</a></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in loadedCompanies" :key="company.crn">
              <td><a :href="`https://find-and-update.company-information.service.gov.uk/company/${company.crn}`">{{ company.crn }}</a></td>
              <td>{{ company.name }}</td>
              <td>{{ company.status }}</td>
              <td>{{ company.confirmationStatementDue }}</td>
              <td>{{ company.accountsDue }}</td>
              <td>{{ company.address }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Company } from '@/customTypings/Company.d';
// @ is an alias to /src

export default defineComponent({
  name: 'HomeView',
  components: {
  },
  data() {
    return {
      apiKey: '',
      apiKeySaving: false,
      apiKeyValid: false,
      apiKeyInvalid: false,
      loadingCompanies: false,
      crnsInvalid: false,
      crns: [] as string[],
      loadedCompaniesCount: 0,
      totalCompaniesCount: 0,
      loadedCompanies: [] as Company[],
      finishedLoadingCompanies: false,
      rateLimited: false,
      ratelimitResetEpoch: 0,
      currentEpochMilliseconds: 0,
      copiedColumnName: '',
    };
  },
  mounted() {
    setInterval(() => { this.currentEpochMilliseconds = Date.now(); }, 1000);
  },
  computed: {
    crnsMultiline: {
      get(): string {
        return this.crns.join('\n');
      },
      set(newVal: string) {
        this.crns = newVal.split(/\r?\n/);
      },
    },
  },
  methods: {
    async saveApiKey() {
      this.apiKeySaving = true;
      const valid = await this.testApiKey();
      this.apiKeyValid = valid;
      this.apiKeyInvalid = !valid;
      this.apiKeySaving = false;
    },
    async testApiKey(): Promise<boolean> {
      const response: Response = await this.apiRequest('https://api.company-information.service.gov.uk/search?q=a&items_per_page=1', this.apiKey);
      return response.ok;
    },
    async apiRequest(url: string, apiKey: string): Promise<Response> {
      const headers = new Headers();
      headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);
      const response: Response = await fetch(url, { method: 'GET', headers });
      return response;
    },
    checkCrn(crn: string): boolean {
      const regexp = /^(?:[A-Z]{2}[0-9]{6}|[0-9]{8})$/;
      return regexp.test(crn);
    },
    async loadCompanies() {
      this.finishedLoadingCompanies = false;
      this.crnsInvalid = false;
      this.loadedCompanies = [];
      this.loadedCompaniesCount = 0;

      // Remove trailing empty elements
      while (this.crns.length > 0 && this.crns[this.crns.length - 1] === '') {
        this.crns.pop();
      }

      // Validate CRNs
      for (let i = 0; i < this.crns.length; i++) {
        const crn = this.crns[i];
        if (!this.checkCrn(crn)) {
          this.crnsInvalid = true;
          return;
        }
      }

      this.totalCompaniesCount = this.crns.length;
      this.loadingCompanies = true;
      for (let i = 0; i < this.crns.length;) {
        const crn = this.crns[i];
        const response = await this.apiRequest(`https://api.company-information.service.gov.uk/company/${crn}`, this.apiKey);
        if (response.status === 200) {
          // Company found
          const companyData = await response.json();
          this.loadedCompanies.push(this.constructCompany(crn, true, companyData));
          this.loadedCompaniesCount++;
        } else if (response.status === 429) {
          // Rate limit exceeded
          this.rateLimited = true;
          const ratelimitResetHeader = response.headers.get('x-ratelimit-reset');
          if (ratelimitResetHeader === null) {
            console.error('Missing x-ratelimit-reset header');
            return;
          }
          const currentEpochSeconds = Math.round(Date.now() / 1000);
          const ratelimitResetEpochSeconds: number = parseInt(ratelimitResetHeader, 10);
          const ratelimitResetDifferenceSeconds: number = ratelimitResetEpochSeconds - currentEpochSeconds;
          const rateLimitBufferSeconds = 3;
          this.ratelimitResetEpoch = ratelimitResetEpochSeconds + rateLimitBufferSeconds;
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
            await this.delay(delayTimeSeconds);
          }
          this.rateLimited = false;
          continue;
        } else if (response.status === 404) {
          // Company not found
          this.loadedCompanies.push(this.constructCompany(crn, false));
          this.loadedCompaniesCount++;
        } else if (response.status === 401) {
          // Authorisation failed
          console.error('API authorisation failed: ', response.json());
          return;
        } else {
          // Unexpected status code
          console.error('Unexpected status code: ', response.status);
          return;
        }
        i++;
      }
      this.loadingCompanies = false;
      this.finishedLoadingCompanies = true;
    },
    constructCompany(crn: string, exists: boolean, data?: any): Company {
      if (!exists) {
        return {
          crn,
          exists: false,
          name: '',
          status: '',
          address: '',
          confirmationStatementDue: '',
          accountsDue: '',
        };
      }

      let address = '';
      if (data.registered_office_address) {
        const elements: string[] = [
          data.registered_office_address.care_of,
          data.registered_office_address.po_box,
          data.registered_office_address.premises,
          data.registered_office_address.address_line_1,
          data.registered_office_address.address_line_2,
          data.registered_office_address.locality,
          data.registered_office_address.region,
          data.registered_office_address.country,
          data.registered_office_address.postal_code,
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

      let status: string = statusEnumMap.has(data.company_status)
        ? statusEnumMap.get(data.company_status)
        : data.company_status;
      if (data.company_status_detail !== undefined) {
        const statusDetail = statusDetailEnumMap.has(data.company_status_detail)
          ? statusDetailEnumMap.get(data.company_status_detail)
          : data.company_status_detail;
        status += ` — ${statusDetail}`;
      }

      const confirmationStatementDue: string = data.confirmation_statement !== undefined
        ? this.formatDate(data.confirmation_statement.next_due)
        : '';

      const accountsDue: string = data.accounts?.next_due !== undefined
        ? this.formatDate(data.accounts.next_due)
        : '';

      return {
        crn,
        exists: true,
        name: data.company_name,
        status,
        address,
        confirmationStatementDue,
        accountsDue,
      };
    },
    async copyColumn(name: keyof Company) {
      const data: string = this.loadedCompanies.map((c) => c[name]).join('\n');
      await navigator.clipboard.writeText(data);
      console.log('Copied', name, 'column');
      this.copiedColumnName = name;
    },
    formatDate(str: string) {
      const regex = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
      const substitution = '$3/$2/$1';
      return str.replace(regex, substitution);
    },
    async delay(seconds: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
      });
    },
  },
});
</script>
