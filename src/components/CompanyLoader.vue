<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <div v-if="loadingState === LoadingState.Error">
            <h3 class="title is-3 is-spaced has-icon">
              <font-awesome-icon icon="fa-solid fa-circle-exclamation" />
              Error
            </h3>
            <p class="subtitle is-5">An error occurred — this could be a rate limiting issue, please wait 5 minutes and try again.</p>
          </div>
          <div v-else-if="loadingState === LoadingState.Done">
            <h3 class="title is-3 is-spaced has-icon">
              <font-awesome-icon icon="fa-solid fa-circle-check" />
              Done
            </h3>
            <p class="subtitle is-5">Loaded {{ totalCompaniesCount }} {{ totalCompaniesCount === 1 ? 'company' : 'companies' }}.</p>
          </div>
          <div v-else>
            <h3 class="title is-3 is-spaced has-icon">
              <font-awesome-icon icon="fa-solid fa-circle-notch" spin />
              Loading...
            </h3>
            <p class="subtitle is-5">Loaded {{ loadedCompaniesCount }} of {{ totalCompaniesCount }} companies ...</p>
            <progress class="progress" :value="loadedCompaniesCount" :max="totalCompaniesCount"></progress>
            <p v-if="loadingState === LoadingState.RateLimited" class="is-italic">
              Rate limited — waiting for {{ Math.max(ratelimitResetEpoch - Math.round(currentEpochMilliseconds / 1000), 0) }} seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import Company from '@/models/Company';
import CompaniesHouseApi from '@/models/CompaniesHouseApi';

enum LoadingState {
  Init,
  Loading,
  RateLimited,
  Done,
  Error,
}

interface ExportControl {
  header: boolean,
}

export default defineComponent({
  name: 'CompanyInput',
  props: {
    api: {
      type: Object as PropType<CompaniesHouseApi>,
      required: true,
    },
    crns: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    companiesLoaded(payload: { companies: Company[] }) {
      return true;
    },
  },
  mounted() {
    this.timerItervalId = window.setInterval(() => { this.currentEpochMilliseconds = Date.now(); }, 1000);
  },
  unmounted() {
    window.clearInterval(this.timerItervalId);
  },
  data() {
    return {
      LoadingState,
      loadingState: LoadingState.Init,
      loadedCompaniesCount: 0,
      totalCompaniesCount: 0,
      loadedCompanies: [] as Company[],
      ratelimitResetEpoch: 0,
      timerItervalId: 0,
      currentEpochMilliseconds: 0,
      exportDataControls: {
        csv: <ExportControl> {
          header: true,
        },
        tsv: <ExportControl> {
          header: true,
        },
      },
    };
  },
  watch: {
    crns: {
      immediate: true,
      async handler(newVal: string[]) {
        if (newVal.length > 0) {
          await this.loadCompanies();
        }
      },
    },
  },
  methods: {
    async loadCompanies() {
      this.loadingState = LoadingState.Loading;
      this.loadedCompanies = [];
      this.$emit('companiesLoaded', { companies: [] });
      this.loadedCompaniesCount = 0;
      this.totalCompaniesCount = this.crns.length;

      for (let i = 0; i < this.crns.length;) {
        const crn = this.crns[i];
        if (crn === '00000000') {
          this.loadedCompanies.push(new Company(crn, false));
          this.loadedCompaniesCount++;
        } else {
          let response: Response;
          try {
            response = await this.api.request(`/company/${crn}`);
          } catch {
            this.loadingState = LoadingState.Error;
            return;
          }
          if (response.status === 200) {
            // Company found
            const companyData = await response.json();
            this.loadedCompanies.push(new Company(crn, true, companyData));
            this.loadedCompaniesCount++;
          } else if (response.status === 429) {
            // Rate limit exceeded
            this.loadingState = LoadingState.RateLimited;
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
            this.loadingState = LoadingState.Loading;
            continue;
          } else if (response.status === 404) {
            // Company not found
            this.loadedCompanies.push(new Company(crn, false));
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
        }
        i++;
      }
      this.loadingState = LoadingState.Done;
      this.$emit('companiesLoaded', { companies: this.loadedCompanies });
    },
    async delay(seconds: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
      });
    },
    makeCsv() {
      const dataRows = this.loadedCompanies.map((c) => c.getCsvRow());
      return this.exportDataControls.csv.header
        ? [Company.getCsvHeader(), ...dataRows].join('\n')
        : dataRows.join('\n');
    },
    async copyCsv() {
      const csv = this.makeCsv();
      try {
        await navigator.clipboard.writeText(csv);
      } catch {
        console.error('Clipboard permission denied');
      }
    },
    async saveCsv() {
      const csv = this.makeCsv();
      this.saveFile(csv, 'company-data.csv', 'text/csv');
    },
    makeTsv() {
      const dataRows = this.loadedCompanies.map((c) => c.getTsvRow());
      return this.exportDataControls.tsv.header
        ? [Company.getTsvHeader(), ...dataRows].join('\n')
        : dataRows.join('\n');
    },
    async copyTsv() {
      const tsv = this.makeTsv();
      try {
        await navigator.clipboard.writeText(tsv);
      } catch {
        console.error('Clipboard permission denied');
      }
    },
    async saveTsv() {
      const tsv = this.makeTsv();
      this.saveFile(tsv, 'company-data.tsv', 'text/tab-separated-values');
    },
    saveFile(data: string, filename: string, type: string) {
      const file = new Blob([data], { type });
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    },
  },
});
</script>

<style scoped lang="scss">
.has-icon > *:first-child {
  margin-inline-end: 0.4rem;
}
</style>
