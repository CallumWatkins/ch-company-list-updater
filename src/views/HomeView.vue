<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <form action="" @submit.prevent="saveApiKey">
            <fieldset :disabled="apiKeySaving || apiKeyValid">
              <div class="field is-narrow">
                <label for="api-key" id="api-key-label" class="label">API Key</label>
                <div class="control has-icons-left" :class="{'has-icons-right': apiKeyValid}">
                  <input type="password" id="api-key" aria-labelledby="#api-key-label"
                    class="input" :class="{'is-danger': apiKeyInvalid}" v-model="apiKey">
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-key" />
                  </span>
                  <span class="icon is-small is-right" v-if="apiKeyValid">
                    <font-awesome-icon icon="fa-solid fa-check" />
                  </span>
                </div>
                <p class="help is-danger" v-if="apiKeyInvalid">
                  Invalid API key
                </p>
              </div>
              <div class="field" v-if="!apiKeyValid">
                <div class="control">
                  <button type="submit" class="button is-primary"
                    :class="{'is-loading': apiKeySaving}">
                    Save
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  </section>
  <section class="section" v-if="apiKeyValid">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <form action="" @submit.prevent="loadCompanies">
            <fieldset :disabled="loadingCompanies">
              <div class="field is-narrow">
                <label for="crns" id="crns-label" class="label">
                  Company Registration Numbers (CRNs)
                </label>
                <div class="control" :class="{'is-loading': loadingCompanies}">
                  <textarea id="crns" aria-labelledby="#crns-label" rows="10"
                    class="textarea" :class="{'is-danger': crnsInvalid}"
                    v-model.lazy="crnsMultiline"></textarea>
                </div>
                <p class="help is-danger" v-if="crnsInvalid">
                  Each line should contain a single CRN
                </p>
              </div>
              <div class="field">
                <div class="control">
                  <button type="submit" class="button is-primary"
                    :class="{'is-loading': loadingCompanies}">
                    Load
                  </button>
                </div>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div v-if="loadingCompanies">
        <p>Loaded {{ loadedCompaniesCount }} of {{ totalCompaniesCount }} ...</p>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Company } from '@/customTypings/Company.d';
// @ is an alias to /src

export default defineComponent({
  name: 'HomeView',
  components: {
  },
  data() {
    return {
      apiKey: '',
      apiKeySaving: false,
      apiKeyValid: false,
      apiKeyInvalid: false,
      loadingCompanies: false,
      crnsInvalid: false,
      crns: [] as string[],
      loadedCompaniesCount: 0,
      totalCompaniesCount: 0,
      loadedCompanies: [] as Company[],
    };
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
  },
  methods: {
    async saveApiKey() {
      this.apiKeySaving = true;
      const valid = await this.testApiKey();
      this.apiKeyValid = valid;
      this.apiKeyInvalid = !valid;
      this.apiKeySaving = false;
    },
    async testApiKey(): Promise<boolean> {
      const response: Response = await this.apiRequest('https://api.company-information.service.gov.uk/search?q=a&items_per_page=1', this.apiKey);
      return response.ok;
    },
    async apiRequest(url: string, apiKey: string): Promise<Response> {
      const headers = new Headers();
      headers.append('Authorization', `Basic ${btoa(`${apiKey}:`)}`);
      const response: Response = await fetch(url, { method: 'GET', headers });
      return response;
    },
    checkCrn(crn: string): boolean {
      const regexp = /^(?:[A-Z]{2}[0-9]{6}|[0-9]{8})$/;
      return regexp.test(crn);
    },
    async loadCompanies() {
      this.finishedLoadingCompanies = false;
      this.crnsInvalid = false;
      this.loadedCompanies = [];
      this.loadedCompaniesCount = 0;

      // Remove trailing empty elements
      while (this.crns.length > 0 && this.crns[this.crns.length - 1] === '') {
        this.crns.pop();
      }

      // Validate CRNs
      for (let i = 0; i < this.crns.length; i++) {
        const crn = this.crns[i];
        if (!this.checkCrn(crn)) {
          this.crnsInvalid = true;
          return;
        }
      }

      this.totalCompaniesCount = this.crns.length;
      this.loadingCompanies = true;
      this.loadingCompanies = false;
    },
  },
});
</script>
