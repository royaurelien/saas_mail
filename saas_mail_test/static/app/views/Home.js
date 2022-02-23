

export const Home = {
    data() {
    var self = this
      return {
        debug: false,
        count: 1,
        subjectPrefix: 'test:',
        activeTab: 0,
        showEml: true,
        messages: [],
        rawValue: '',
        textMessage: 'Auto message.',
        eml: '',
        file: {},
        dropFiles: [],
        to: '',
        mailSubject: '',
        mailFrom: '',
        html_content: '',
        isCC: false,
        isBCC: false,
        isText: true,
        isDomainForced: false,
        forceDomain: 'test.com',
        results: [],
        editor: ClassicEditor,
        editorData: '<p>Content of the editor.</p>',
        editorConfig: {
            autosave: {
                save( editor ) {
                    // https://stackoverflow.com/questions/66979079/ckeditor5-vue-autosave-problem-i-cant-call-instance-in-autosave-function
                    self.saveData( editor.getData() );
                }
            },
            // plugins: [ 'Base64UploadAdapter' ]
            // The configuration of the editor.
        }
      }
    },
    computed: {
        autoSubject: function () {
            return this.subjectPrefix+' '+this.mailSubject+' ('+this.count+')'
        },
        domain: function() {
            return '@'+this.forceDomain
        },
        mailTo: function() {
            return this.to+'@'+this.forceDomain
        }
        // rawValue: function() {
        //     // return this.ckeditor.getData()
        //     return false
        // }
    },
    watch: {
        eml: function (newValue, oldValue) {
            this.activeTab = 4
            if (newValue) {
                if ('error' in newValue) {
                    this.success('No record created', 'is-warning')
                    this.results.push({
                        desc: newValue.error,
                        subject: newValue.subject,
                        from: this.mailFrom,
                        to: this.mailTo
                    })
                    // this.messages.push({
                    //     type: 'is-danger',
                    //     title: 'Error',
                    //     content: newValue.error
                    // })


                } else if ('record' in newValue) {
                    this.success('New record found', 'is-success')
                    this.results.push({
                        id: newValue.record.id,
                        name: newValue.record.name,
                        url: newValue.record.url,
                        desc: newValue.record.desc,
                        subject: newValue.record.subject,
                        date: newValue.record.create_date,
                        from: this.mailFrom,
                        to: this.mailTo
                    })
                    // this.messages.push({
                    //     type: 'is-warning',
                    //     title: 'Record found : '+newValue.record.name,
                    //     // content: newValue.record.url,
                    //     url: 'http://localhost:8069'+newValue.record.url
                    // })
                }
            }
        }
    },
    methods: {
        success: function (message, type) {
            this.$buefy.toast.open({
                message: message,
                type: type
            })
        },
        setTo: function (payload) {
            this.to = payload.data
        },
        setFrom: function (payload) {
            this.mailFrom = payload.data
        },
        saveData: function (data) {
            console.log(data)
            this.rawValue = data
        },
        sendForm: function () {
            console.log(this.mailTo)
            const data = {
                to: this.mailTo,
                subject: this.autoSubject,
                from_recipient: this.mailFrom,
                body: this.isText ? this.textMessage : this.rawValue
            }
            this.count += 1
            axios
            .post('/vuejs/data/generate', { params: { data } })
            // .then(response => (this.results.push(response.data.result.record)))
            .then(response => (this.eml = response.data.result))
        },
        viewRecord: function (url) {
            console.log(url)
            window.open(url, "_blank");
        }
    },
    template: `

<div class="container">

    <div class="columns">
        <div class="column">

            <b-tabs v-model="activeTab">
                <b-tab-item label="Basic">
                    <div class="columns">
                        <div class="column">
                            <from-contacts required labelPosition="on-border" @changeFromValue="setFrom"/>
                        </div>
                        <div class="column">
                        <b-field label="To / Alias" labelPosition="on-border">
                                <select-alias @changeAlias="setTo"/>

                                <b-input v-model="to" required></b-input>
                                <p class="control">
                                    <span class="button is-static">{{ domain }}</span>
                                </p>
                            </b-field>
                        </div>
                        <div class="column">

                            <b-field label="Subject" labelPosition="on-border">
                                <b-input
                                    disabled
                                    v-model="autoSubject">
                                </b-input>
                                <p class="control">
                                    <b-button v-on:click="sendForm" label="Send" type="is-primary" />
                                </p>
                            </b-field>
                        </div>
                    </div>

                </b-tab-item>

                <b-tab-item label="Advance">
                    <b-field horizontal><!-- Label left empty for spacing -->
                        <p class="control">
                        <b-numberinput size="is-small" controls-alignment="right" controls-position="compact" v-model="count" :min="1" :max="1000"></b-numberinput>
                        </p>

                        <p class="control">
                            <b-switch v-model="isText">Plain text</b-switch>
                        </p>
                        <p class="control">
                            <b-switch v-model="isCC">CC</b-switch>
                        </p>
                        <p class="control">
                            <b-switch v-model="isBCC">BCC</b-switch>
                        </p>
                        <p class="control">
                            <b-switch v-model="isDomainForced">Force domain</b-switch>
                        </p>
                    </b-field>

                <b-field label="Subject" labelPosition="on-border">
                    <b-input
                        placeholder="Subject..." v-model="mailSubject">
                    </b-input>
                </b-field>

                <b-field label="Domain" v-if="isDomainForced" labelPosition="on-border">
                    <b-input v-model="forceDomain"></b-input>
                </b-field>

                <b-field label="Name" labelPosition="on-border">
                    <b-input value="Kevin Garvey"></b-input>
                </b-field>

                <b-field label="From"
                    labelPosition="on-border"
                    type="is-danger"
                    message="This email is invalid">
                    <b-input type="email"
                        value="john@customerdomain.com"
                        v-model="mailFrom"
                        maxlength="30">
                    </b-input>
                </b-field>

                <b-field label="To" labelPosition="on-border">
                    <b-input
                        v-model="to"
                        maxlength="30">
                    </b-input>
                    <p class="control">
                        <span class="button is-static">{{ domain }}</span>
                    </p>
                </b-field>


                <b-field label="CC"
                    label-position="on-border"
                    v-if="isCC"
                    type="is-danger">
                    <b-input maxlength="30">
                    </b-input>
                </b-field>
                <b-field label="BCC"
                label-position="on-border"
                    v-if="isBCC"
                    type="is-danger">
                    <b-input maxlength="30">
                    </b-input>
                </b-field>

                <b-field label="Message" v-if="isText" label-position="on-border">
                    <b-input maxlength="200" type="textarea" v-model="textMessage"></b-input>
                </b-field>

                <ckeditor v-if="!isText" :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>

                <b-field>
                <b-upload v-model="dropFiles"
                    multiple
                    drag-drop>
                    <section class="section">
                        <div class="content has-text-centered">
                            <p>
                                <b-icon
                                    icon="upload"
                                    size="is-large">
                                </b-icon>
                            </p>
                            <p>Drop your files here or click to upload</p>
                        </div>
                    </section>
                </b-upload>
                </b-field>

                <div class="tags">
                    <span v-for="(file, index) in dropFiles"
                        :key="index"
                        class="tag is-primary" >
                        {{file.name}}
                        <button class="delete is-small"
                            type="button"
                            @click="deleteDropFile(index)">
                        </button>
                    </span>
                </div>
            </b-tab-item>

            <b-tab-item label="Help">
                <mail-helper/>
            </b-tab-item>

            <b-tab-item :visible="showEml" label="EML">
                <pre>{{ eml.eml }}</pre>
            </b-tab-item>

            <b-tab-item label="History">
                <b-table
                    :data="results"
                    >
                    <b-table-column
                    field="id"
                    label="ID"
                    width="40"
                    sortable
                    v-slot="props"
                >
                    <template>
                        {{ props.row.id }}
                    </template>
                    </b-table-column>

                    <b-table-column
                        field="from"
                        label="From"
                        sortable
                        v-slot="props"
                    >
                        <template>
                            {{ props.row.from }}
                        </template>
                    </b-table-column>

                    <b-table-column
                        field="to"
                        label="To"
                        sortable
                        v-slot="props"
                    >
                        <template>
                            {{ props.row.to }}
                        </template>
                    </b-table-column>

                    <b-table-column
                        field="subject"
                        label="Subject"
                        sortable
                        v-slot="props"
                    >
                        <template>
                            {{ props.row.subject }}
                        </template>
                    </b-table-column>

                    <b-table-column
                        field="name"
                        label="Record"
                        sortable
                        v-slot="props"
                    >
                        <template>
                            {{ props.row.name }}
                        </template>
                    </b-table-column>

                    <b-table-column
                        field="desc"
                        label="Desc"
                        sortable
                        v-slot="props"
                    >
                        <template>
                            {{ props.row.desc }}
                        </template>
                    </b-table-column>

                    <b-table-column field="date" label="Date" centered v-slot="props">
                        <span class="tag is-success">
                            {{ new Date(props.row.date).toLocaleTimeString() }}
                        </span>
                    </b-table-column>

                    <b-table-column field="url" centered v-slot="props">
                        <b-button tag="a"
                            v-if="props.row.url"
                            size="is-small"
                            :href="props.row.url"
                            target="_blank">
                                View
                        </b-button>
                    </b-table-column>

                </b-table>
            </b-tab-item>

        </b-tabs>
    </div>
    <div class="column" v-if="debug">
        <b-table :data="results" :columns="columns"></b-table>
        <div v-for="(message, index) in messages" :key="index">
            <b-message
                :title="message.title"
                :type="message.type"
                aria-close-label="Close message">
                {{ message.content }}

                <b-button v-if="message.url" @click="viewRecord(message.url)">
                    View record
                </b-button>

            </b-message>
        </div>

    </div>
    </div>
</div>
`
  }