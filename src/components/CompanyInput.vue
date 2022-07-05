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
                <div class="control" :class="{'is-loading': isLoading}">
                  <textarea id="crns" aria-labelledby="#crns-label" rows="10"
                    class="textarea" :class="{'is-danger': crnsInvalid}"
                    v-model="crnsMultiline"></textarea>
                </div>
                <p class="help is-danger" v-if="crnsInvalid">
                  Each line should contain a single CRN
                </p>
              </div>
              <div class="field">
                <div class="control">
                  <button type="submit" class="button is-primary"
                    :class="{'is-loading': isLoading}">
                    Load
                  </button>
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
  emits: ['crnsSubmitted'],
  computed: {
    crnsMultiline: {
      get(): string {
        return this.crns.join('\n');
      },
      set(newVal: string) {
        this.crns = newVal.split(/\r?\n/);
      },
    },
  },
  methods: {
    crnValid(crn: string): boolean {
      const regexp = /^(?:[A-Z]{2}[0-9]{6}|[0-9]{8})$/;
      return regexp.test(crn);
    },
    async submitCrns() {
      this.crnsInvalid = false;

      // Remove trailing empty elements
      while (this.crns.length > 0 && this.crns[this.crns.length - 1] === '') {
        this.crns.pop();
      }

      // Validate CRNs
      if (!this.crns.every(this.crnValid)) {
        this.crnsInvalid = true;
        return;
      }

      this.$emit('crnsSubmitted', this.crns.slice(0));
    },
  },
});
</script>

<style scoped lang="scss">

</style>
