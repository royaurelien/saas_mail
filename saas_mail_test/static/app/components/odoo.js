Vue.component("select-alias", {
    props: [
        "labelPosition"
    ],
    data: function () {
        return {
            items: [],
            selectedItem: null,
        }
    },
    mounted () {
        axios
        .post('/vuejs/data/alias', { data: 'help' })
        .then(response => (this.items = response.data.result))
    },
    watch: {
        selectedItem: function (newVal, oldVal) {
            this.value = newVal;
            this.$emit("changeAlias", {data: this.value});
        }
    },
    template:
    `
        <b-select
            v-model="selectedItem">
            <option
            v-for="item in items"
            :value="item.alias_name"
            :key="item.id">
            {{ item.alias_name }}
            </option>
        </b-select>
    `
});

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

  Vue.component('from-contacts', {
    props: [
        "labelPosition"
    ],
    data: function () {
      return {
        data: [],
        keepFirst: false,
        openOnFocus: false,
        email: '',
        selected: null,
        clearable: false
      }
    },

    mounted () {
        axios
          .post('/vuejs/data/contacts', { data: 'help' })
          .then(response => (this.data = response.data.result))
    },
    computed: {
        filteredDataObj() {
            return this.data.filter(option => {
                return (
                    option.display
                        .toString()
                        .toLowerCase()
                        .indexOf(this.email.toLowerCase()) >= 0
                )
            })
        }
    },
    watch: {
        email: function (newVal, oldVal) {
            this.value = newVal;
            this.$emit("changeFromValue", {data: this.value});
        }
    },
    template:
    `
    <b-field label="From" :labelPosition="labelPosition">
        <b-autocomplete
            v-model="email"
            placeholder="e.g. customer@domain.com"
            :keep-first="keepFirst"
            :open-on-focus="openOnFocus"
            :data="filteredDataObj"
            field="display"
            @select="option => (selected = option)"
            :clearable="clearable"
        >
        </b-autocomplete>
    </b-field>
    `
  })

