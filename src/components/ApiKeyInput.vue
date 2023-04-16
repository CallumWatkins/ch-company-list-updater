<template>
  <section class="section">
    <div class="container">
      <div class="columns">
        <div class="column is-half-desktop is-two-thirds-tablet is-full-mobile">
          <form action="" @submit.prevent="saveApiKey">
            <fieldset :disabled="apiKeySaving || apiKeySaved">
              <div class="field is-narrow">
                <label for="api-key" id="api-key-label" class="label">API Key</label>
                <div class="control has-icons-left" :class="{ 'has-icons-right': apiKeySaved }">
                  <input
                    type="password"
                    id="api-key"
                    aria-labelledby="#api-key-label"
                    class="input"
                    :class="{ 'is-danger': apiKeyInvalid }"
                    v-model="apiKey">
                  <span class="icon is-small is-left">
                    <font-awesome-icon icon="fa-solid fa-key" />
                  </span>
                  <span class="icon is-small is-right" v-if="apiKeySaved">
                    <font-awesome-icon icon="fa-solid fa-check" />
                  </span>
                </div>
                <p class="help is-danger" v-if="apiKeyInvalid">
                  Invalid API key
                </p>
              </div>
              <div class="field" v-if="!apiKeySaved">
                <div class="control">
                  <button
                    type="submit"
                    class="button is-primary"
                    :class="{ 'is-loading': apiKeySaving }"
                    :disabled="apiKey.length === 0">
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
import CompaniesHouseApi, { ICompaniesHouseApi } from '@/models/CompaniesHouseApi';

export default defineComponent({
  name: 'ApiKeyInput',
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    saveKey(payload: { api: ICompaniesHouseApi }) {
      return true;
    },
  },
  data() {
    return {
      apiKey: '',
      apiKeySaving: false,
      apiKeySaved: false,
      apiKeyInvalid: false,
    };
  },
  methods: {
    async saveApiKey() {
      this.apiKeySaving = true;
      const api = new CompaniesHouseApi(this.apiKey);
      const valid = await this.testApi(api);
      this.apiKeySaved = valid;
      this.apiKeyInvalid = !valid;
      this.apiKeySaving = false;
      if (valid) this.$emit('saveKey', { api });
    },
    async testApi(api: ICompaniesHouseApi): Promise<boolean> {
      const response: Response = await api.request('/search?q=a&items_per_page=1');
      return response.ok;
    },
  },
});
</script>

<style scoped lang="scss">

</style>
