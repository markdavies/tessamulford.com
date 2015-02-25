/*
  Simple Image Gallery
*/

SirTrevor.Blocks.Gallery = SirTrevor.Block.extend({

    type: "gallery",

    title: function() { return "Gallery" },

    droppable: true,
    multi_uploadable: true,
    assetHost: '',
    icon_name: 'image', 

    uploadQueue: [],

    initialize: function () {
        _.bindAll(this, 
                  'onToggleAddClick', 
                  'onItemDeleteIntent', 
                  'onFileInputChange',
                  'onLiDragStart', 
                  'onLiDragEnter', 
                  'onLiDragOver',
                  'onLiDragLeave', 
                  'onLiDragEnd', 
                  'onLiDrop', 
                  'onFormSubmit');
    },

    editorHTML: function () {
        return this.template(this.getData());
    },

    loadData: function ( data ) {

        // We append the images container manually because SirTrevor also manually 
        // appends the drag and drop inputs just before this method, 
        // and we want the images container to come after that interface.
        this.appendImagesContainer();

        // load all images into the basic grid view.
        _.each(data.images, function ( data ) {
            if ( _.isNull(data) ) return;
            this.$el.find('ul.images')
                .append(this.image_template(data));
        }, this);

        // Set UI state for gallery type
        this.setUIState('');
    },
       
    onBlockRender: function () {
        this.withMixin(SirTrevor.BlockMixins.MutliUploadable);

        // On block render is always called before loadData. loadData is only called
        // if the data object has been populated, ie, this is not a new gallery.
        this.setUIState('init');

        this.appendImagesContainer();

        // this.$selectpicker = this.$el.find('.selectpicker');
        // this.$selectpicker.selectpicker();

        // Events
        this.$inner
            .on('click',     'button.toggle-add',          this.onToggleAddClick)
            .on('click',     'li .delete',                 this.onItemDeleteIntent)
            .on('click',     '.st-upload-btn',             this.preventDefault)
            .on('change',    'input[type="file"]',         this.onFileInputChange)
            .on('dragstart', 'ul.images li',               this.onLiDragStart)
            .on('dragenter', 'ul.images li',               this.onLiDragEnter)
            .on('dragover',  'ul.images li',               this.onLiDragOver)
            .on('dragleave', 'ul.images li',               this.onLiDragLeave)
            .on('dragend',   'ul.images li',               this.onLiDragEnd)
            .on('drop',      'ul.images li',               this.onLiDrop);

        this.$el.closest('form').on('submit', this.onFormSubmit);
    },

    onFileInputChange: function ( e ) {
        this.onDrop(e.currentTarget);
    },

    onDrop: function ( data ) {
        var files = data.files;       

        this.setUIState('progress');

        _.each(files, function ( file ) {
            this.uploadQueue.push(file);         
            this.$inner.find('.progress-items')
                .prepend(this.progress_template({
                    id: this.idFromFile(file), 
                    filename: file.name
                }));
        }, this);

        this.uploadNext();
    },

    onUploadProgress: function ( progress, file ) {
        var percent = Math.floor(progress.loaded / progress.total * 100), 
            $li      = $("#" + this.idFromFile(file));

        $li.find('.progress-bar').css('width', percent + '%');
        $li.find('.status').html(percent + '%');

        if ( percent == 100 ) $li.find('.status').html('Processing...');
    },

    onUploadSuccess : function ( data, status, jXHR, file ) {
        var self   = this, 
            images = this.getData().images || [], 
            $li    = $("#" + this.idFromFile(file)), 
            index;

        // Update internal images cache
        images.unshift(data);
        this.setData({ images: images });

        this.$el.find('ul.images').prepend(this.image_template(data));
        
        $li.find('.progress-bar').css('width', '100%');
        $li.find('.status').html('Success');

        // After 5 seconds, remove upload progress item
        setTimeout(function () {
            self.$el.find('#' + self.idFromFile(file)).remove();
        }, 5000);

        this.uploadNext();
    },

    onUploadError : function ( jqXHR, status, errorThrown, file ) {
        var response = jqXHR.responseJSON, 
            message  = response ? response.errors[0] : errorThrown, 
            $li      = $("#" + this.idFromFile(file));

        $li.find('.status').html(message).addClass('error');
        setTimeout(function () { $li.remove() }, 10000);
        this.uploadNext();
    }, 

    onLiDragStart: function ( e ) {        
        e.originalEvent.dataTransfer.setDragImage(
            e.currentTarget, 
            e.originalEvent.offsetX, 
            e.originalEvent.offsetY
        );

        e.originalEvent.dataTransfer.setData(
            'text/plain', 
            $(e.currentTarget).data('id')
        );
    },
    
    onLiDragEnter: function ( e ) {},

    onLiDragOver: function ( e ) {},

    onLiDragLeave: function ( e ) {},

    onLiDragEnd: function ( e ) {},

    onLiDrop: function ( e ) {
        var dragId     = e.originalEvent.dataTransfer.getData('text/plain'), 
            dropId     = $(e.currentTarget).data('id'),             
            $ul        = this.$el.find('ul.images'),
            $drag      = $ul.find('[data-id="' + dragId + '"]'), 
            $drop      = $ul.find('[data-id="' + dropId + '"]'), 
            offsetX    = e.originalEvent.offsetX, 
            thresholdX = e.currentTarget.clientWidth / 2;
        
        if ( dragId == dropId ) return;

        offsetX >= thresholdX ? $drag.insertAfter($drop) : $drag.insertBefore($drop);

        this.reorderImageData();
    },

    onToggleAddClick: function ( e ) {
        var $target = $(e.currentTarget);
        if ( $target.hasClass('inputs-show') ) {
            $target.removeClass('inputs-show')
                .html($target.data('text'));
            this.$inputs.hide();
        } else {
            $target.addClass('inputs-show')
                .html($target.data('alt-text'));
            this.$inputs.show();
        }
    },

    onItemDeleteIntent: function ( e ) {
        var self    = this, 
        images  = this.getData().images, 
        $li     = $(e.currentTarget).closest('li'),
        $ul     = $li.closest('ul'),
        id      = $li.data('id');

        e.stopPropagation();

        $li.addClass('delete');

        $li.find('.st-block-ui-btn--confirm-delete')
            .one('click', function ( e ) {
                e.stopPropagation();

                images = _.reject(images, function ( image ) { 
                    return image ? image.id == id : false;
                });
                self.setData({ images: images });
                $li.remove();                               
            });

        $li.find('.st-block-ui-btn--deny-delete').one('click', function ( e ) {
            e.stopPropagation();
            $li.removeClass('delete');
        });
    },

    onFormSubmit: function ( e ) {
        if ( this.uploadQueue.length ) {
            alert('Image uploading currently in progress.');
            e.preventDefault();
            e.stopImmediatePropagation();
        }        
    },

    appendImagesContainer: function () {
        if ( this.$inner.find('.images').length == 0 ) {
            this.$inner.append('<ul class="images"/>');
        }
    },

    setUIState: function ( state ) {

        var $add              = this.$el.find('button.toggle-add'), 
            $settingsInputs   = this.$el.find('.st-block__inputs_settings'),      
            $imageGrid        = this.$el.find('ul.images');

        switch ( state ) {

            case 'ready':          
            $add.show();
            break;

            case 'progress':
            $settingsInputs.show();
            $add.removeClass('inputs-show')
                .html($add.data('text'));
            this.$inputs.hide();
            break;

            default:

            if(this.getData().images){
                $settingsInputs.show();
                this.$inputs.hide();
            }else{
                $settingsInputs.hide();
                this.$inputs.show();
            }

            break;
        }

    },

    uploadNext: function () {
        if ( this.uploadQueue.length ) {
            this.uploader(this.uploadQueue[this.uploadQueue.length - 1],
                          this.onUploadSuccess, 
                          this.onUploadProgress, 
                          this.onUploadError);
            this.uploadQueue.pop();
        }
    },

    idFromFile: function ( file ) {
        return file.name.replace(/\W+/g, '-');
    },

    reorderImageData: function () {
        var $lis   = this.$el.find('ul.images li'), 
            ids    = _.map($lis, function ( li ) { return $(li).data('id') }), 
            images = _.sortBy(this.getData().images, function ( image ) {
                var id = _.isNull(image) ? 0 : image.id;
                return _.indexOf(ids, id);
            });

        this.setData({ images: images });
    },

    preventDefault: function ( e ) {
        e.preventDefault();
    },
    
    template: _.template([
        '<div class="row st-block__inputs_settings add-new">', 
            '<button type="button"', 
                    'class="toggle-add btn btn-default" data-text="Add More Images"', 
                    'data-alt-text="Cancel">Add More Images', 
            '</button>',
        '</div>',
        '<ul class="progress-items" />'
    ].join('\n')),  

    image_template: _.template([
        '<li data-id="<%= id %>" draggable="true">', 
          '<img src="<%= this.assetHost %><%= thumb %>" />',
          '<div class="st-li-controls">', 
            '<a data-icon="bin"', 
                'class="st-block-ui-btn st-block-ui-btn--delete delete st-icon">delete', 
            '</a>', 
          '</div>',
          '<div class="st-li-delete-controls">',
            '<label class="st-block__delete-label">Delete?</label>',
            '<a class="st-block-ui-btn st-block-ui-btn--confirm-delete st-icon" data-icon="tick"></a>',
            '<a class="st-block-ui-btn st-block-ui-btn--deny-delete st-icon" data-icon="close"></a>',
          '</div>',
        '</li>'
    ].join('\n')), 

    progress_template: _.template([
        '<li id="<%= id %>">', 
          '<div class="progress-text">',
            '<span class="filename"><%= filename %></span>',
            '<span class="status"></span>',
          '</div>',
          '<div class="progress">',
            '<div class="progress-bar" role="progress-bar" style="width: 0%">',
            '</div>',
          '</div>',
        '</li>'
    ].join('\n')), 

    
    
});
