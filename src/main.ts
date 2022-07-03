import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { library as fontAwesomeLibrary } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon as fontAwesomeIconComponent } from '@fortawesome/vue-fontawesome';

createApp(App)
  .component('font-awesome-icon', fontAwesomeIconComponent)
  .use(router)
  .mount('#app');
