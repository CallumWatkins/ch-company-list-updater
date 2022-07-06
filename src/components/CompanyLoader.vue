<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <div v-if="finishedLoading">
            <h3 class="title is-3 is-spaced has-icon">
              <font-awesome-icon icon="fa-solid fa-circle-check" />
              Done
            </h3>
            <p class="subtitle is-5">Loaded {{ totalCompaniesCount }} companies.</p>
          </div>
          <div v-else>
            <h3 class="title is-3 is-spaced has-icon">
              <font-awesome-icon icon="fa-solid fa-circle-notch" spin />
              Loading...
            </h3>
            <p class="subtitle is-5">Loaded {{ loadedCompaniesCount }} of {{ totalCompaniesCount }} companies ...</p>
            <progress class="progress" :value="loadedCompaniesCount" :max="totalCompaniesCount"></progress>
            <p v-if="rateLimited" class="is-italic">
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
    this.timerItervalId = setInterval(() => { this.currentEpochMilliseconds = Date.now(); }, 1000);
  },
  unmounted() {
    clearInterval(this.timerItervalId);
  },
  data() {
    return {
      finishedLoading: false,
      loadedCompaniesCount: 0,
      totalCompaniesCount: 0,
      loadedCompanies: [] as Company[],
      rateLimited: false,
      ratelimitResetEpoch: 0,
      timerItervalId: 0,
      currentEpochMilliseconds: 0,
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
      this.finishedLoading = false;
      this.loadedCompanies = [];
      this.$emit('companiesLoaded', { companies: [] });
      this.loadedCompaniesCount = 0;
      this.totalCompaniesCount = this.crns.length;

      for (let i = 0; i < this.crns.length;) {
        const crn = this.crns[i];
        const response = await this.api.request(`/company/${crn}`);
        if (response.status === 200) {
          // Company found
          const companyData = await response.json();
          this.loadedCompanies.push(new Company(crn, true, companyData));
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
        i++;
      }
      this.finishedLoading = true;
      this.$emit('companiesLoaded', { companies: this.loadedCompanies });
    },
    async delay(seconds: number): Promise<void> {
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
      });
    },
  },
});
</script>

<style scoped lang="scss">
.has-icon > *:first-child {
  margin-inline-end: 0.4rem;
}
</style>
