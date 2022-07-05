<template>
  <section class="section">
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
            <tr v-for="company in companies" :key="company.crn">
              <td><a :href="`https://find-and-update.company-information.service.gov.uk/company/${company.crn}`"
                target="_blank">{{ company.crn }}</a></td>
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
import { defineComponent, PropType } from 'vue';
import Company from '@/models/Company';

export default defineComponent({
  name: 'CompanyOutput',
  props: {
    companies: {
      type: Array as PropType<Array<Company>>,
      required: true,
    },
  },
  data() {
    return {
      copiedColumnName: '',
    };
  },
  methods: {
    async copyColumn(name: keyof Company) {
      const data: string = this.companies.map((c) => c[name]).join('\n');
      await navigator.clipboard.writeText(data);
      console.log('Copied', name, 'column');
      this.copiedColumnName = name;
    },
  },
});
</script>

<style scoped lang="scss">
table {
  th, td {
    white-space: nowrap;
  }
}
</style>