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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
    };
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
  },
});
</script>
