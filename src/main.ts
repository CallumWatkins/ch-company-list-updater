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
  faFileCsv,
  faFileExcel,
  faAngleDown,
  faCopy,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons';

import {
  faGithub,
} from '@fortawesome/free-brands-svg-icons';

fontAwesomeLibrary.add(
  faKey,
  faCheck,
  faCircleCheck,
  faCircleNotch,
  faCircleExclamation,
  faFileCsv,
  faFileExcel,
  faAngleDown,
  faCopy,
  faFloppyDisk,
  faGithub,
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
