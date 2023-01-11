/* eslint-disable import/order */
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueTippy from 'vue-tippy';
import { library as fontAwesomeLibrary } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon as fontAwesomeIconComponent } from '@fortawesome/vue-fontawesome';
import {
  faKey,
  faCheck,
  faCircleCheck,
  faCircleNotch,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

fontAwesomeLibrary.add(
  faKey,
  faCheck,
  faCircleCheck,
  faCircleNotch,
  faCircleExclamation,
);

createApp(App)
  .component('font-awesome-icon', fontAwesomeIconComponent)
  .use(VueTippy, {
    defaultProps: {
      hideOnClick: false,
    },
  })
  .use(router)
  .mount('#app');
