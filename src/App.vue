<template>
  <div id="wrapper">
    <nav class="navbar is-spaced is-light">
      <div class="container">
        <div class="navbar-brand">
          <router-link to="/" class="navbar-item">
            <img src="./assets/logo.png" alt="" height="28">
          </router-link>
          <a role="button" class="navbar-burger" :class="{ 'is-active': navbarMobileOpen }"
            @click="navbarMobileOpen = !navbarMobileOpen" @keypress.enter="navbarMobileOpen = !navbarMobileOpen"
            aria-label="menu" :aria-expanded="navbarMobileOpen" tabindex="0">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        <div class="navbar-menu" :class="{ 'is-active': navbarMobileOpen }">
          <div class="navbar-start">
            <router-link to="/" class="navbar-item">Home</router-link>
            <router-link to="/about" class="navbar-item">About</router-link>
          </div>
        </div>
      </div>
    </nav>
    <router-view/>
    <div id="wrapper__spacer"></div>
    <footer class="footer">
      <div class="content has-text-centered">
        <p>
          <strong>Companies House Company List Updater</strong> by <a href="https://www.callumwatkins.com" target="_blank">
            <span class="no-wrap">Callum Watkins</span></a>.
        </p>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      navbarMobileOpen: false,
    };
  },
  watch: {
    $route() {
      this.navbarMobileOpen = false;
    },
  },
});
</script>

<style lang="scss">
@import "@/assets/styles/styles.scss";

#wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__spacer {
    flex-grow: 1;
  }
}
</style>
