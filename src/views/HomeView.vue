<template>
  <ApiKeyInput @save-key="api => companiesHouseApi = api" />
  <CompanyInput v-if="companiesHouseApi !== null"
    @crns-submitted="(x) => crns = x" :isLoading="loading" />
  <CompanyLoader v-if="companiesHouseApi !== null && crns.length > 0"
    :api="companiesHouseApi" :crns="crns" @companies-loaded="(x) => loadedCompanies = x" />
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
      loading: Boolean,
      loadedCompanies: [] as Company[],
    };
  },
});
</script>

<style scoped lang="scss">

</style>
