<template>
  <nav class="navbar is-spaced is-light">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img src="./assets/logo.png" alt="" height="28">
        </router-link>
        <a role="button" class="navbar-burger" :class="{ 'is-active': navbarHamburgerOpen }"
          @click="navbarHamburgerOpen = !navbarHamburgerOpen" @keypress.enter="navbarHamburgerOpen = !navbarHamburgerOpen"
          aria-label="menu" :aria-expanded="navbarHamburgerOpen" tabindex="0">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': navbarHamburgerOpen }">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item">Home</router-link>
          <router-link to="/about" class="navbar-item">About</router-link>
        </div>
      </div>
    </div>
  </nav>
  <router-view/>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        <strong>Companies House Company List Updater</strong> by <a href="https://callumwatkins.com" target="_blank">Callum Watkins</a>.
      </p>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      navbarHamburgerOpen: false,
    };
  },
});
</script>

<style lang="scss">
@import "@/assets/styles/styles.scss";
</style>
