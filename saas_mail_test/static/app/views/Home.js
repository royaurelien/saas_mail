

export const Home = {
    data() {
    var self = this
      return {
        count: 1,
        subjectPrefix: 'TEST',
        activeTab: 0,
        showEml: true,
        messages: [],
        rawValue: '',
        eml: '',
        file: {},
        dropFiles: [],
        to: 'support',
        mail_subject: 'test',
        mailFrom: 'customer@domaine.com',
        html_content: '',
        isCC: false,
        isBCC: false,
        isPlain: true,
        isDomainForced: false,
        forceDomain: 'test.com',
        results: [],
        columns: [
            {
                field: 'id',
                label: 'ID',
                width: '40',
                numeric: true
            },
            {
                field: 'record',
                label: 'Record',
            },
            {
                field: 'url',
                label: 'Url',
            },
            {
                field: 'create_date',
                label: 'Date',
                centered: true
            },
            {
                field: 'error',
                label: 'Error',
            }
        ],
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
            return this.subjectPrefix+' #'+this.count
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
            if (newValue) {
                if ('error' in newValue) {
                    this.messages.push({
                        type: 'is-danger',
                        title: 'Error',
                        content: newValue.error
                    })


                } else if ('record' in newValue) {
                    this.messages.push({
                        type: 'is-warning',
                        title: 'Record found : '+newValue.record.name,
                        // content: newValue.record.url,
                        url: 'http://localhost:8069'+newValue.record.url
                    })
                }
            }
        }
    },
    methods: {
        setToFromAlias: function (payload) {
            console.log(payload)
            this.to = payload.data
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
                body: this.rawValue
            }
            this.count += 1
            axios
            .post('/vuejs/data/generate', { params: { data } })
            .then(response => (this.results.push(response.data.result.record)))
            // .then(response => (this.eml = response.data.result))
        },
        viewRecord: function (url) {
            console.log(url)
            window.open(url, "_blank");
        }
    },
    template: `

<div class="container">

    <div class="columns">
        <div class="column is-two-thirds">

            <b-tabs v-model="activeTab">
                <b-tab-item label="Basic">
                    <from-contacts labelPosition="on-border"/>
                    <select-alias @changeAlias="setToFromAlias"/>

                    <b-field label="To" labelPosition="on-border">
                        <b-input
                            v-model="to"
                            maxlength="30">
                        </b-input>
                        <p class="control">
                            <span class="button is-static">{{ domain }}</span>
                        </p>
                    </b-field>

                    <b-field horizontal><!-- Label left empty for spacing -->
                        <span>{{ autoSubject }}</span>
                        <p class="control">
                            <b-button v-on:click="sendForm" label="Send" type="is-primary" />
                            <b-button label="Reset" />
                        </p>
                    </b-field>

                </b-tab-item>

                <b-tab-item label="Advance">
                    <b-field horizontal><!-- Label left empty for spacing -->
                        <p class="control">
                            <b-switch v-model="isPlain">Plain text</b-switch>
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
                        placeholder="Subject..." v-model="mail_subject">
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

                <b-field label="Message" v-if="isPlain" label-position="on-border">
                    <b-input maxlength="200" type="textarea"></b-input>
                </b-field>

                <ckeditor v-if="!isPlain" :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>

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
                <pre>{{ eml }}</pre>
            </b-tab-item>

            <b-tab-item label="History">
            <b-table :data="results" :columns="columns"></b-table>
            </b-tab-item>

        </b-tabs>
    </div>
    <div class="column">
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