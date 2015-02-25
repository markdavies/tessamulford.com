SirTrevor.BlockMixins.MutliUploadable = {

    mixinName: "MultiUploadable",

    upload_options: {
        html: [
            '<div class="st-block__upload-container">',
            '<input type="file" type="st-file-upload" multiple>',
            '<button class="st-upload-btn">...or choose files</button>',
            '</div>'
        ].join('\n')
    },

    initializeMultiUploadable: function () {
        SirTrevor.log("Adding multi_uploadable to block " + this.blockID);
        this.withMixin(SirTrevor.BlockMixins.Ajaxable);

        this.upload_options = _.extend({}, SirTrevor.DEFAULTS.Block.upload_options, this.upload_options);
        this.$inputs.append(_.template(this.upload_options.html, this));
    },

    uploader: function( file, success, progress, failure ) {
        return SirTrevor.fileUploader(this, file, success, progress, failure);
    }

};
