;(function ($){
    function SimpleUploader(options)
    {
        this.options = $.extend({}, SimpleUploader.defaults, options);
    }

    SimpleUploader.defaults = {
        debug           : false,
        url             : '',
        width           : 40,
        height          : 40,
        buttonText      : '选择文件',
        buttonImage     : '',
        filePostName    : 'upfile',
        fileSizeLimit   : 2 * 1024 * 1024,
        fileTypeExts    : [],
        multi           : true,
        extraFormData   : {},
        onInit          : undefined,
        onUploadStart   : undefined,
        onUploadProgress: undefined,
        onUploadComplete: undefined,
        onUploadSuccess : undefined,
        onUploadError   : undefined,
        onCancel        : undefined
    };

    SimpleUploader.errorMsg = {
        NOT_SUPPORT_FILE        : '不支持的文件类型',
        FILE_TOO_LARGE          : '文件大小超过限制',
        NOT_SUPPORT_FORMDATA    : '不支持formData API',
        NOT_SUPPORT_XHR         : '您的浏览器不支持XMLHttpRequest'
    };

    SimpleUploader.prototype.upload = function(fileInput) {
        var options = this.options;
        var debug = options.debug;
        fileInput.css({height : options.height + 'px'})
            .addClass('simple-uploader-input')
            .wrap($('<div class="simple-uploader"></div>'))
            .wrap($('<button type="button" class="simple-uploader-button"></button>'));

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

        var fileProgress = $('<div class="simple-uploader-progress" style="display: none"><div class="simple-uploader-progressbar active" role="progressbar"></div></div>')
            .insertAfter(fileButton);
        var fileProgressbar = fileProgress.find('.simple-uploader-progressbar');

        fileInput.on('change', function() {
            var file = this.files[0];
            if (!file)
            {
                if (debug){
                    console.log('没有选择任何文件，上传退出...');
                }
                return;
            }

            if (debug) {
                console.log({msg: '已选择上传文件', file : file});
            }

            var ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();

            if (options.fileTypeExts.length > 0)
            {
                if (!$.inArray(ext, options.fileTypeExts))
                {
                    throw new Error(SimpleUploader.errorMsg.NOT_SUPPORT_FILE);
                }
            }
            if (options.fileSizeLimit && options.fileSizeLimit < file.size)
            {
                throw new Error(SimpleUploader.errorMsg.FILE_TOO_LARGE);
            }

            if(typeof FormData === 'undefined')
            {
                throw new Error(SimpleUploader.errorMsg.NOT_SUPPORT_FORMDATA);
            }

            var formData = new FormData();
            formData.append(options.filePostName, file);
            if (Object.keys(options.extraFormData).length > 0)
            {
                for (var field in options.extraFormData)
                {
                    if (options.extraFormData.hasOwnProperty(field))
                    {
                        formData.append(field, options.extraFormData[field]);
                    }
                }
            }

            if (debug) {
                console.log({msg : '上传数据组装完成...', formData : formData});
            }

            if (typeof XMLHttpRequest === 'undefined')
            {
                throw new Error(SimpleUploader.errorMsg.NOT_SUPPORT_XHR);
            }

            var xhr = new XMLHttpRequest();
            xhr.open('post', options.url, true);
            xhr.onreadystatechange = function () {
                switch (xhr.readyState)
                {
                    case 0:
                        if (typeof options.onInit != 'undefined')
                        {
                            options.onInit();
                            if (debug) {
                                console.log('ajax初始化完成，上传url：' + options.url);
                            }
                        }
                        break;
                    case 4:
                        if (typeof options.onUploadSuccess != 'undefined')
                        {
                            options.onUploadSuccess(xhr.responseText);
                            if (debug) {
                                console.log('文件上传成功，处理返回结果...');
                            }
                        }
                        break;
                }
            };

            xhr.upload.addEventListener('loadstart', function () {
                if (debug){
                    console.log('开始上传文件...');
                }
                fileProgress.show();
            });

            xhr.upload.addEventListener('progress', function (evt) {
                if (debug) {
                    console.log('文件上传中...' + Math.round(evt.loaded / evt.total * 100) + '%');
                }
               if (evt.lengthComputable)
               {
                   var percent = Math.round(evt.loaded / evt.total * 100) + '%';
                   fileProgressbar.css('width', percent);
               }
            });

            xhr.upload.addEventListener('loadend', function () {
                if (debug) {
                    console.log('文件上传结束...');
                }
                fileProgress.delay(1000).fadeOut(1000, function () {
                    fileProgressbar.css('width', '0');
                });
            });

            if (typeof options.onUploadStart != 'undefined')
            {
                xhr.upload.addEventListener('loadstart', options.onUploadStart);
            }

            if (typeof options.onUploadProgress != 'undefined')
            {
                xhr.upload.addEventListener('progress', options.onUploadProgress);
            }

            if (typeof options.onUploadComplete != 'undefined')
            {
                xhr.upload.addEventListener('loadend', options.onUploadComplete);
            }

            if (typeof options.onUploadError != 'undefined')
            {
                xhr.upload.addEventListener('error', options.onUploadError);
            }

            xhr.send(formData);

        });
    };

    window.SimpleUploader = SimpleUploader;

})(jQuery);


$.fn.extend({
    simpleUploader : function (options){
        new SimpleUploader(options).upload(this);
    }
});