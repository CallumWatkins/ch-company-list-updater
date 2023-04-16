<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column">
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
        <div v-if="loadingState === LoadingState.Done" class="column is-narrow">
          <div class="field is-grouped">
            <div class="control">
              <div class="dropdown" :class="{ 'is-active': exportDataControls.csv.dropdownOpen }">
                <div class="dropdown-trigger">
                  <button
                    class="button"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    type="button"
                    @click="exportDataToggleDropdown(exportDataControls.csv)"
                  >
                    <span class="icon">
                      <font-awesome-icon v-if="exportDataControls.csv.success" icon="fa-solid fa-check" />
                      <font-awesome-icon v-else icon="fa-solid fa-file-csv" />
                    </span>
                    <span>CSV</span>
                    <span class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-angle-down" />
                    </span>
                  </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                  <div class="dropdown-content">
                    <a href="#" class="dropdown-item" @click.prevent="copyCsv">
                      <span class="icon">
                        <font-awesome-icon icon="fa-solid fa-copy" />
                      </span>
                      Copy
                    </a>
                    <a href="#" class="dropdown-item" @click.prevent="saveCsv">
                      <span class="icon">
                        <font-awesome-icon icon="fa-solid fa-floppy-disk" />
                      </span>
                      Save
                    </a>
                    <hr class="dropdown-divider">
                    <div class="dropdown-item">
                      <label class="checkbox">
                        <input type="checkbox" v-model="exportDataControls.csv.header">
                        Header
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="control">
              <div class="dropdown" :class="{ 'is-active': exportDataControls.tsv.dropdownOpen }">
                <div class="dropdown-trigger">
                  <button
                    class="button"
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    type="button"
                    @click="exportDataToggleDropdown(exportDataControls.tsv)"
                  >
                    <span class="icon">
                      <font-awesome-icon v-if="exportDataControls.tsv.success" icon="fa-solid fa-check" />
                      <font-awesome-icon v-else icon="fa-solid fa-file-excel" />
                    </span>
                    <span>TSV</span>
                    <span class="icon is-small">
                      <font-awesome-icon icon="fa-solid fa-angle-down" />
                    </span>
                  </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                  <div class="dropdown-content">
                    <a href="#" class="dropdown-item" @click.prevent="copyTsv">
                      <span class="icon">
                        <font-awesome-icon icon="fa-solid fa-copy" />
                      </span>
                      Copy
                    </a>
                    <a href="#" class="dropdown-item" @click.prevent="saveTsv">
                      <span class="icon">
                        <font-awesome-icon icon="fa-solid fa-floppy-disk" />
                      </span>
                      Save
                    </a>
                    <hr class="dropdown-divider">
                    <div class="dropdown-item">
                      <label class="checkbox">
                        <input type="checkbox" v-model="exportDataControls.tsv.header">
                        Header
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import debounce from 'lodash.debounce';
import Company, { loadCompany, waitRateLimit } from '@/models/Company';
import { ICompaniesHouseApi } from '@/models/CompaniesHouseApi';

enum LoadingState {
  Init,
  Loading,
  RateLimited,
  Done,
  Error,
}

interface ExportControl {
  dropdownOpen: boolean,
  header: boolean,
  success: boolean,
  successDebounce: Function | null
}

export default defineComponent({
  name: 'CompanyInput',
  props: {
    api: {
      type: Object as PropType<ICompaniesHouseApi>,
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
          dropdownOpen: false,
          header: true,
          success: false,
          successDebounce: null,
        },
        tsv: <ExportControl> {
          dropdownOpen: false,
          header: true,
          success: false,
          successDebounce: null,
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
          const companyLoadResult = await loadCompany(crn, this.api);
          if (companyLoadResult.status === 'success') {
            this.loadedCompanies.push(companyLoadResult.data);
            this.loadedCompaniesCount++;
          } else if (companyLoadResult.status === 'rate-limit') {
            // Rate limit exceeded
            this.loadingState = LoadingState.RateLimited;
            const rateLimit = waitRateLimit(companyLoadResult.ratelimitResetEpochSeconds);
            if (rateLimit) {
              this.ratelimitResetEpoch = rateLimit.ratelimitResetEpoch;
              await rateLimit.promise;
            }
            this.loadingState = LoadingState.Loading;
            continue;
          } else {
            this.loadingState = LoadingState.Error;
            return;
          }
        }
        i++;
      }
      this.loadingState = LoadingState.Done;
      this.$emit('companiesLoaded', { companies: this.loadedCompanies });
    },
    exportDataToggleDropdown(control: ExportControl) {
      const c = control;
      c.dropdownOpen = !c.dropdownOpen;

      // Close all other dropdowns
      Object
        .values(this.exportDataControls)
        .forEach((otherControl) => {
          if (otherControl !== control) {
            // eslint-disable-next-line no-param-reassign
            otherControl.dropdownOpen = false;
          }
        });
    },
    exportDataSuccess(control: ExportControl) {
      const c = control;
      c.success = true;
      c.dropdownOpen = false;
      if (c.successDebounce === null) {
        c.successDebounce = debounce(() => {
          c.success = false;
        }, 3000);
      }
      c.successDebounce();
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
        this.exportDataSuccess(this.exportDataControls.csv);
      } catch {
        console.error('Clipboard permission denied');
      }
    },
    async saveCsv() {
      const csv = this.makeCsv();
      this.saveFile(csv, 'company-data.csv', 'text/csv');
      this.exportDataSuccess(this.exportDataControls.csv);
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
        this.exportDataSuccess(this.exportDataControls.tsv);
      } catch {
        console.error('Clipboard permission denied');
      }
    },
    async saveTsv() {
      const tsv = this.makeTsv();
      this.saveFile(tsv, 'company-data.tsv', 'text/tab-separated-values');
      this.exportDataSuccess(this.exportDataControls.tsv);
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
