/*
 *   Sir Trevor Uploader
 *   Generic Upload implementation that can be extended for blocks
 */

SirTrevor.fileUploader = function(block, file, success, progress, error) {

    var uid  = [block.blockID, (new Date()).getTime(), 'raw'].join('-');
    var data = new FormData();

    data.append('image[attachment]', file);

    block.resetMessages();

    var callbackSuccess = function () {
        SirTrevor.log('Upload callback called');

        if (!_.isUndefined(success) && _.isFunction(success)) {
            success.apply(block, _.union(arguments, file));
        }
    };

    var callbackProgress = function () {
        SirTrevor.log('Upload callback called');
        if (!_.isUndefined(progress) && _.isFunction(progress)) {
            progress.apply(block, _.union(arguments, file));
        }
    };

    var callbackError = function () {
        SirTrevor.log('Upload callback error called');
        if (!_.isUndefined(error) && _.isFunction(error)) {
            error.apply(block, _.union(arguments, file));
        }
    };

    var originalXhr = $.ajaxSettings.xhr, 
        instance    = SirTrevor.getInstance(block.instanceID);
    
    var xhr = $.ajax({
        url: instance.options.uploadUrl || SirTrevor.DEFAULTS.uploadUrl,
        data: data,    
        cache: false,
        contentType: false,
        processData: false,    
        dataType: 'json',
        type: 'POST', 
        progress: callbackProgress,
        xhr: function () {
            var req  = originalXhr(), 
                self = this;
            if ( req.upload && typeof req.upload.addEventListener == "function" ) {
                req.upload.addEventListener("progress", function ( e ) {
                    self.progress(e);
                }, false);
            }

            return req;
        }
    });

    block.addQueuedItem(uid, xhr);

    xhr.done(callbackSuccess)
        .fail(callbackError)
        .always(_.bind(block.removeQueuedItem, block, uid));

    return xhr;
};
