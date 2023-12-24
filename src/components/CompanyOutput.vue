<template>
  <section class="section">
    <div class="container is-fluid">
      <div class="table-container">
        <table class="table is-striped">
          <thead>
            <tr>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'crn' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('crn')"
                  @keypress.enter="copyColumn('crn')">
                  CRN
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('crn')}`"
                  @click="sort('crn')" />
              </th>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'name' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('name')"
                  @keypress.enter="copyColumn('name')">
                  Name
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('name')}`"
                  @click="sort('name')" />
              </th>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'status' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('status')"
                  @keypress.enter="copyColumn('status')">
                  Status
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('status')}`"
                  @click="sort('status')" />
              </th>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'confirmationStatementDue' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('confirmationStatementDue')"
                  @keypress.enter="copyColumn('confirmationStatementDue')">
                  Conf. Stmt. Due
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('confirmationStatementDue')}`"
                  @click="sort('confirmationStatementDue')" />
              </th>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'accountsDue' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('accountsDue')"
                  @keypress.enter="copyColumn('accountsDue')">
                  Accounts Due
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('accountsDue')}`"
                  @click="sort('accountsDue')" />
              </th>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'directors' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('directors', (directors) => directors?.[0] ?? '')"
                  @keypress.enter="copyColumn('directors', (directors) => directors?.[0] ?? '')">
                  Director
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('directors')}`"
                  @click="sort('directors')" />
              </th>
              <th>
                <a
                  href="#"
                  v-tippy="copiedColumnName === 'address' ? 'Copied!' : 'Click to Copy'"
                  @click.prevent="copyColumn('address')"
                  @keypress.enter="copyColumn('address')">
                  Address
                </a>
                <font-awesome-icon
                  class="sort-icon"
                  :icon="`fa-solid ${getSortIcon('address')}`"
                  @click="sort('address')" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in sortedCompanies" :key="company.crn">
              <td><a :href="company.humanUrl" target="_blank" rel="noopener noreferrer">{{ company.crn }}</a></td>
              <td :title="company.creationDate ? `Date of incorporation: ${company.creationDate}` : undefined">{{ company.name }}</td>
              <td :title="company.cessationDate ? `Date of cessation: ${company.cessationDate}` : undefined">{{ company.status }}</td>
              <td>{{ company.confirmationStatementDue }}</td>
              <td>{{ company.accountsDue }}</td>
              <td :title="company.directors?.join(`&#10;`)">{{ company.directors?.[0] }}</td>
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
  computed: {
    sortedCompanies(): Company[] {
      if (!this.sortBy) return this.companies;
      const sortedCompanies = structuredClone(this.companies);
      sortedCompanies.sort((a: Company, b: Company) => {
        const orderBy = this.sortAscending ? 1 : -1;
        const valA = a[this.sortBy!];
        const valB = b[this.sortBy!];
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

        switch (this.sortBy) {
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
  data() {
    return {
      copiedColumnName: '',
      sortBy: null as keyof Company | null,
      sortAscending: true,
    };
  },
  methods: {
    async copyColumn<T extends keyof Company>(name: T, convert: (c: Company[T]) => string = (c) => c?.toString() ?? '') {
      const data: string = this.companies.map((c) => convert(c[name])).join('\n');
      try {
        await navigator.clipboard.writeText(data);
        console.log('Copied', name, 'column');
        this.copiedColumnName = name;
      } catch {
        console.error('Clipboard permission denied');
      }
    },
    sort(column: keyof Company): void {
      if (this.sortBy === column) {
        if (!this.sortAscending) {
          this.sortBy = null;
        } else {
          this.sortAscending = !this.sortAscending;
        }
      } else {
        this.sortBy = column;
        this.sortAscending = true;
      }
    },
    getSortIcon(column: keyof Company): string {
      if (this.sortBy === column) {
        return this.sortAscending ? 'fa-sort-up' : 'fa-sort-down';
      }
      return 'fa-sort';
    },
  },
});
</script>

<style scoped lang="scss">
table {
  margin-inline: auto;

  th, td {
    white-space: nowrap;
  }
}

.sort-icon {
  cursor: pointer;
  padding: 0 4px;
  color: hsl(0, 0%, 45%);

  &:hover {
    color: hsl(0, 0%, 30%);
  }
}
</style>
