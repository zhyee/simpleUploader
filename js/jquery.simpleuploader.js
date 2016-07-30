
;(function ($){
    function SimpleUploader(options)
    {
        this.options = $.extend({}, SimpleUploader.defaults, options);
    }

    SimpleUploader.defaults = {
        url             : '',
        width           : 40,
        height          : 40,
        buttonText      : '选择文件',
        buttonImage     : '',
        filePostName    : 'upfile',
        fileSizeLimit   : 2 * 1024 * 1024,
        fileTypeExts    : [],
        multi           : true
    };

    SimpleUploader.errorMsg = {
        NOT_SUPPORT_FILE : '不支持的文件类型',
        FILE_TOO_LARGE : '文件大小超过限制'
    };

    SimpleUploader.prototype.upload = function(fileInput) {
        var options = this.options;
        fileInput.css({height : options.height + 'px'})
            .addClass('simple-uploader-input')
            .wrap($('<div class="simple-uploader"></div>'))
            .wrap($('<button class="simple-uploader-button"></button>'));

        var fileButton = fileInput.parent();

        var buttonCss = {
            width : options.width + 'px',
            height : options.height + 'px'
        };
        if (options.buttonImage !== '')
        {
            buttonCss.background = 'url(' + options.buttonImage + ') center center no-repeat';
        }
        fileButton.css(buttonCss).append(options.buttonText);

        var fileProgressbar = $('<div class="simple-uploader-progress"><div class="simple-uploader-progressbar active" role="progressbar"></div></div>').insertAfter(fileButton);

        fileInput.on('change', function() {
            var file = this.files[0];
            if (!file)
            {
                return;
            }
            var ext = file.name.substr(file.name.lastIndexOf('.') + 1);
            if (options.fileTypeExts.length > 0)
            {
                if (!$.inArray(ext, options.fileTypeExts))
                {
                    throw new Error(SimpleUploader.errorMsg.NOT_SUPPORT_FILE);
                }
            }
            if (options.fileSizeLimit && options.fileSizeLimit > file.size)
            {
                throw new Error(SimpleUploader.errorMsg.FILE_TOO_LARGE);
            }

            if(typeof FormData === 'undefined')
            {

            }


        });
    };

    window.SimpleUploader = SimpleUploader;

})(jQuery);


$.fn.extend({
    simpleUploader : function (options){
        new SimpleUploader(options).upload(this);
    }
});