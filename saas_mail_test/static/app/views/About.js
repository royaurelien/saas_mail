// import VueCkeditor from 'vue-ckeditor2';
Vue.component('select-contacts', {
    data: function () {
      return {
        contacts: [],
        selectedRecipients: [],
      }
    },
    mounted () {
        axios
          .post('/vuejs/data/contacts', { data: 'help' })
          .then(response => (this.contacts = response.data.result))
    },
    template:
    `
    <b-field horizontal label="Contact">
        <b-select
            placeholder="Select a contact"
            v-model="selectedRecipients">
            <option
            v-for="item in contacts"
            :value="item.id"
            :key="item.id">
            {{ item.name }}
        </option>
        </b-select>
    </b-field>
    `
  })

  Vue.component('mail-helper', {
    data: function () {
      return {
        items: {},
      }
    },
    mounted () {
        axios
          .post('/vuejs/data/helper', { data: 'help' })
          .then(response => (this.items = response.data.result))
    },
    template:
    `
    <section>
        <h3 class="title">Help</h3>
        <div v-html="items.mail_helper"></div>
    </section>
    `
  })

export const About = {
    name: 'About',
    components: {
        // select-contacts
        // VueCkeditor
    },
    data() {
      return {

        editorData: '<p>Content of the editor.</p>',
        editorConfig: {
            // The configuration of the editor.
        }
      }
    },

    template: `
<div class="container">
    <div class="columns">
        <div class="column">
            <h2 class="title">About</h2>
            <select-contacts></select-contacts>
        </div>
        <div class="column">
            <mail-helper></mail-helper>
        </div>
    </div>
</div>
`
  }