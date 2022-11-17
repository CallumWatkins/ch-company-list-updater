<div align="center">
  <img height=150 src="src/assets/logo.png" />
</div>

<h3 align="center">Companies House Company List Updater</h3>

<p align="center">
  <a href="https://app.netlify.com/sites/company-list-updater/deploys">
    <img src="https://api.netlify.com/api/v1/badges/c80c34e5-7c32-4412-8920-f0f7eab34e7e/deploy-status">
  </a>
</p>

---

Company List Updater (CLU) enables the mass retrieval of public company data through the Companies House API. For a given list of Companies House company registration numbers, CLU provides a table of useful company data, such as names, addresses, and accounts due dates. Each column of data can be indivudually copied for entry into other systems.

A [Companies House Public Data API](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference) key is required (free, though rate limited). See [Companies House API overview](https://developer.company-information.service.gov.uk).

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
