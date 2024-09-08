<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <form action="" @submit.prevent="submitCrns">
            <fieldset :disabled="isLoading">
              <div class="field is-narrow">
                <label for="crns" id="crns-label" class="label">
                  Company Registration Numbers (CRNs)
                </label>
                <div class="control" :class="{ 'is-loading': isLoading }">
                  <textarea
                    id="crns"
                    aria-labelledby="#crns-label"
                    rows="10"
                    class="textarea"
                    :class="{ 'is-danger': crnsInvalid }"
                    v-model="crnsMultiline" />
                </div>
                <p class="help is-danger" v-if="crnsInvalid">
                  Each line should contain a single CRN
                </p>
              </div>
              <div class="field is-grouped">
                <div class="control">
                  <button
                    type="submit"
                    class="button is-primary"
                    :class="{ 'is-loading': isLoading }">
                    Load
                  </button>
                </div>
                <div v-if="duplicateCrnCount > 0" class="control is-expanded has-text-right">
                  <a @click="removeDuplicateCrns" href="#">
                    Remove {{ duplicateCrnCount }} duplicate{{ duplicateCrnCount === 1 ? '' : 's' }}
                  </a>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CompanyInput',
  data() {
    return {
      crnsInvalid: false,
      crns: [] as string[],
    };
  },
  props: {
    isLoading: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    crnsSubmitted(payload: { crns: string[] }) {
      return true;
    },
  },
  computed: {
    crnsMultiline: {
      get(): string {
        return this.crns.join('\n');
      },
      set(newVal: string) {
        this.crns = newVal.split(/\r?\n/);
      },
    },
    duplicateCrnCount() {
      const crns = this.crns
        .map((c) => c.trim())
        .filter((c) => c !== '' && c !== '00000000');
      const uniqueCrns = new Set(crns);
      return crns.length - uniqueCrns.size;
    },
  },
  methods: {
    crnValid(crn: string): boolean {
      const regexp = /^(?:[A-Z]{2}[0-9]{6}|[0-9]{8})$/;
      return regexp.test(crn);
    },
    removeDuplicateCrns() {
      const seen = new Set();
      const newCrns: string[] = [];
      this.crns.forEach((crn) => {
        const val = crn.trim();
        const isEmpty = val === '' || val === '00000000';
        if (!isEmpty && seen.has(val)) return;
        seen.add(val);
        newCrns.push(val);
      });
      this.crns = newCrns;
    },
    async submitCrns() {
      this.crnsInvalid = false;

      // Remove leading empty elements
      while (this.crns.length > 0 && this.crns[0].trim() === '') {
        this.crns.shift();
      }

      // Remove trailing empty elements
      while (this.crns.length > 0 && this.crns[this.crns.length - 1].trim() === '') {
        this.crns.pop();
      }

      // Pad CRNs with leading 0s up to 8 digits in length
      for (let i = 0; i < this.crns.length; i++) {
        const crn = this.crns[i].trim();
        if (crn.length === 0 || (crn.length < 8 && /^[0-9]+$/.test(crn))) {
          this.crns[i] = crn.padStart(8, '0');
        } else {
          this.crns[i] = crn;
        }
      }

      // Validate CRNs
      if (!this.crns.every(this.crnValid)) {
        this.crnsInvalid = true;
        return;
      }

      this.$emit('crnsSubmitted', { crns: this.crns.slice(0) });
    },
  },
});
</script>

<style scoped lang="scss">

</style>
