// 1. Define route components.

// import "./css/main.css";

import {Home} from './views/Home.js'
import {About} from './views/About.js'
import {} from './components/odoo.js'


const customNavbar = Vue.component('navbar-custom', {
    data: function () {
      return {
        info: [],
      }
    },
    template:
    `
    <b-navbar>
    <template>
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
            Home
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/about' }">
            About
        </b-navbar-item>
    </template>
</b-navbar>
    `
  })

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
]

Vue.use( CKEditor );

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
    routes: routes,
    components: [
      customNavbar
    ]
  })

  // 4. Create and mount the root instance.
  // Make sure to inject the router with the router option to make the
  // whole app router-aware.
  const app = new Vue({
    router
  })

//   app.use( CKEditor );

  app.$mount('#app')

// Now the app has started!