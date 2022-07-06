<template>
  <ApiKeyInput @save-key="x => companiesHouseApi = x.api" />
  <CompanyInput v-if="companiesHouseApi !== null"
    @crns-submitted="x => crns = x.crns" :isLoading="loading" />
  <CompanyLoader v-if="companiesHouseApi !== null && crns.length > 0"
    :api="companiesHouseApi" :crns="crns" @companies-loaded="companiesLoaded" />
  <CompanyOutput v-if="loadedCompanies.length > 0"
    :companies="loadedCompanies" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Company from '@/models/Company';
import CompaniesHouseApi from '@/models/CompaniesHouseApi';
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
      companiesHouseApi: null as (CompaniesHouseApi | null),
      crns: [] as string[],
      loading: false,
      loadedCompanies: [] as Company[],
    };
  },
  beforeRouteLeave() {
    if (this.loadedCompanies.length > 0) {
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
      this.loadedCompanies = companies.companies;
      if (this.loadedCompanies.length > 0) {
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
