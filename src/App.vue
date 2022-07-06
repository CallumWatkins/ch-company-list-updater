<template>
  <nav class="navbar is-spaced is-light">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img src="./assets/logo.png" alt="" height="28">
        </router-link>
      </div>
      <div class="navbar-menu">
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

<style lang="scss">
@import "@/assets/styles/styles.scss";
</style>
