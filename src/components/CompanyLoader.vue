<template>
  <section class="section">
    <div class="container">
      <div v-if="finishedLoading">
        <h3 class="title is-5">Done!</h3>
        <p>Loaded {{ totalCompaniesCount }} companies</p>
      </div>
      <div v-else>
        <h3 class="title is-5">Loading...</h3>
        <p>Loaded {{ loadedCompaniesCount }} of {{ totalCompaniesCount }} companies ...</p>
        <p v-if="rateLimited">
          Rate limited! Waiting for {{ Math.max(ratelimitResetEpoch - Math.round(currentEpochMilliseconds / 1000), 0) }} seconds.
        </p>
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
  emits: ['companiesLoaded'],
  mounted() {
    setInterval(() => { this.currentEpochMilliseconds = Date.now(); }, 1000);
  },
  data() {
    return {
      finishedLoading: false,
      loadedCompaniesCount: 0,
      totalCompaniesCount: 0,
      loadedCompanies: [] as Company[],
      rateLimited: false,
      ratelimitResetEpoch: 0,
      currentEpochMilliseconds: 0,
    };
  },
  watch: {
    loadedCompaniesCount(newVal: number) {
      if (newVal > 0) {
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
      } else {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      }
    },
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
    beforeUnloadHandler(e: BeforeUnloadEvent) {
      e.preventDefault();
      return (e.returnValue = 'Are you sure? All loaded data will be lost.');
    },
    async loadCompanies() {
      this.finishedLoading = false;
      this.loadedCompanies = [];
      this.$emit('companiesLoaded', []);
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
      this.$emit('companiesLoaded', this.loadedCompanies);
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

</style>
