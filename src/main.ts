import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueTippy from 'vue-tippy';
import { library as fontAwesomeLibrary } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon as fontAwesomeIconComponent } from '@fortawesome/vue-fontawesome';

createApp(App)
  .component('font-awesome-icon', fontAwesomeIconComponent)
  .use(VueTippy, {
    defaultProps: {
      hideOnClick: false,
    },
  })
  .use(router)
  .mount('#app');
