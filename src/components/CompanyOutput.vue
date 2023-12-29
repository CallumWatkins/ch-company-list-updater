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
            <tr v-for="company in sortedCompanies" :key="company.id">
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
import Company, { CompanySorting } from '@/models/Company';

export default defineComponent({
  name: 'CompanyOutput',
  props: {
    sortedCompanies: {
      type: Array as PropType<Array<Company>>,
      required: true,
    },
    sorting: {
      type: Object as PropType<CompanySorting | null>,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      copiedColumnName: '',
    };
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sort(_payload: CompanySorting | null) {
      return true;
    },
  },
  methods: {
    async copyColumn<T extends keyof Company>(name: T, convert: (c: Company[T]) => string = (c) => c?.toString() ?? '') {
      const data: string = this.sortedCompanies.map((c) => convert(c[name])).join('\n');
      try {
        await navigator.clipboard.writeText(data);
        console.log('Copied', name, 'column');
        this.copiedColumnName = name;
      } catch {
        console.error('Clipboard permission denied');
      }
    },
    sort(column: keyof Company): void {
      if (this.sorting?.column === column) {
        if (this.sorting.order === 'asc') {
          this.$emit('sort', { column, order: 'desc' });
        } else {
          this.$emit('sort', null);
        }
      } else {
        this.$emit('sort', { column, order: 'asc' });
      }
    },
    getSortIcon(column: keyof Company): string {
      if (this.sorting?.column === column) {
        return this.sorting.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
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
