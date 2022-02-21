export const Home = {
    data() {
    var self = this
      return {
        count: 0,
        rawValue: '',
        eml: '',
        file: {},
        dropFiles: [],
        to: '',
        mail_subject: '',
        mail_from: '',
        html_content: '',
        isCC: false,
        isBCC: false,
        isDomainForced: false,
        forceDomain: 'test.com',
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
        domain: function() {
            return '@'+this.forceDomain
        },
        mail_to: function() {
            return this.to+'@'+this.forceDomain
        }
        // rawValue: function() {
        //     // return this.ckeditor.getData()
        //     return false
        // }
    },
    // watch: {
    //     editorData: function(){
    //         this.data.raw_value = this.editor.getData();
    //     }
    // },
    methods: {
        saveData: function (data) {
            console.log(data)
            this.rawValue = data
        },
        sendForm: function () {
            console.log(this.mail_to)
            const data = {
                to: this.mail_to,
                subject: this.mail_subject,
                from_recipient: this.mail_from,
                body: this.rawValue
            }
            axios
            .post('/vuejs/data/generate', { params: { data } })
            .then(response => (this.eml = response.data.result))
        }
    },
    template: `

<div class="container">

    <div class="columns">
        <div class="column">
            <h3 class="subtitle">Mail</h3>

                <b-field horizontal><!-- Label left empty for spacing -->
                    <p class="control">
                        <b-button v-on:click="sendForm" label="Send" type="is-primary" />
                        <b-button label="Reset" type="is-warning" />
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
                        v-model="mail_from"
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

                <b-field label="Message" label-position="on-border">
                    <b-input maxlength="200" type="textarea"></b-input>
                </b-field>

                <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>

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
        </div>
        <div class="column">
            <h3 class="subtitle">EML</h3>
            <pre>{{ dropFiles }}</pre>
            <pre>{{ eml }}</pre>
        </div>
    </div>
</div>
`
  }