<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-3 is-spaced">Company List Updater</h1>
      <h2 class="subtitle is-5">Get the latest company information from Companies House.</h2>
    </div>
  </section>
  <ApiKeyInput @save-key="x => companiesHouseApi = x.api" />
  <CompanyInput
    v-if="companiesHouseApi !== null"
    @crns-submitted="x => crns = x.crns"
    :isLoading="loading" />
  <CompanyLoader
    v-if="companiesHouseApi !== null && crns.length > 0"
    :api="companiesHouseApi"
    :crns="crns"
    @companies-loaded="companiesLoaded" />
  <CompanyOutput
    v-if="companies.length > 0"
    :sorted-companies="sortedCompanies"
    :sorting="sorting"
    @sort="s => sorting = s" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Company, { CompanySorting } from '@/models/Company';
import { ICompaniesHouseApi } from '@/models/CompaniesHouseApi';
import ApiKeyInput from '@/components/ApiKeyInput.vue';
import CompanyInput from '@/components/CompanyInput.vue';
import CompanyLoader from '@/components/CompanyLoader.vue';
import CompanyOutput from '@/components/CompanyOutput.vue';
// @ is an alias to /src

export default defineComponent({
  name: 'HomeView',
  components: {
    ApiKeyInput,
    CompanyInput,
    CompanyLoader,
    CompanyOutput,
  },
  data() {
    return {
      companiesHouseApi: null as (ICompaniesHouseApi | null),
      crns: [] as string[],
      loading: false,
      companies: [] as Company[],
      sorting: null as CompanySorting | null,
    };
  },
  computed: {
    sortedCompanies(): Company[] {
      const sorting = this.sorting;
      if (sorting === null) return this.companies;

      const sortedCompanies = structuredClone(this.companies);
      sortedCompanies.sort((a: Company, b: Company) => {
        const orderBy = sorting.order === 'asc' ? 1 : -1;
        const valA = a[sorting.column];
        const valB = b[sorting.column];
        if (!valA) return orderBy * -1;
        if (!valB) return orderBy * 1;

        const sortDate = (dateA: string, dateB: string) => {
          const sortableA = dateA.split('/').reverse().join('');
          const sortableB = dateB.split('/').reverse().join('');
          return sortableA.localeCompare(sortableB) * orderBy;
        };

        const sortStringArray = (arrayA: string[], arrayB: string[]) => {
          const sortableA = arrayA.join('');
          const sortableB = arrayB.join('');
          return sortableA.localeCompare(sortableB) * orderBy;
        };

        switch (sorting.column) {
          case 'confirmationStatementDue':
          case 'accountsDue':
            return sortDate(valA as string, valB as string);
          case 'directors':
            return sortStringArray(valA as string[], valB as string[]);
          default:
            if (valA > valB) return orderBy * 1;
            if (valA < valB) return orderBy * -1;
            return 1;
        }
      });
      return sortedCompanies;
    },
  },
  beforeRouteLeave() {
    if (this.companies.length > 0) {
      const answer = window.confirm('Are you sure? All loaded data will be lost.');
      if (!answer) return false;
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
    return undefined;
  },
  methods: {
    beforeUnloadHandler(e: BeforeUnloadEvent) {
      e.preventDefault();
      return (e.returnValue = 'Are you sure? All loaded data will be lost.');
    },
    companiesLoaded(companies: { companies: Company[] }) {
      this.companies = companies.companies;
      if (this.companies.length > 0) {
        window.addEventListener('beforeunload', this.beforeUnloadHandler);
      } else {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
      }
    },
  },
});
</script>

<style scoped lang="scss">

</style>
