<template>
    <h2>
        Home
    </h2>
    <!-- <ckeditor v-model="editorData" :config="editorConfig"></ckeditor> -->
</template>

<script type="text/javascript">
module.export = {
    data: function () {
        return {
            editorData: '<p>Content of the editor.</p>',
            editorConfig: {}
        }
    }
}
</script>