$(function () {
    var $image = $(".image-crop > img")
    $($image).cropper({
        viewMode: 1,
        preview: '.img-preview', //不同尺寸预览区
           dragMode: 'move',
           aspectRatio: 1,
           autoCropArea: 0.65,
           restore: false,
           guides: false,
           center: false,
           highlight: false,
           cropBoxMovable: true,
           cropBoxResizable: true,
           toggleDragModeOnDblclick: false,
        crop: function(data) { //裁剪操作回调
        }
    });
    var fileName; //选择上传的文件名
    var $inputImage = $("#inputImage");
    if (window.FileReader) {
        $inputImage.change(function () {
            var fileReader = new FileReader(),
                files = this.files,
                file;

            if (!files.length) {
                return;
            }

            file = files[0];
            // console.log(file);
            fileName = file.name;
            if (/^image\/\w+$/.test(file.type)) {
                fileReader.readAsDataURL(file);
                fileReader.onload = function () {
                    $inputImage.val("");
                    $image.cropper("reset", true).cropper("replace", this.result);
                };
            } else {
                layer.msg("请选择图片文件");
            }
        });
    } else {
        $inputImage.addClass("hide");
    }

    $("#download").click(function () {
        window.open($image.cropper("getDataURL"));
    });

    $("#zoomIn").click(function () {
        $image.cropper("zoom", 0.1);
    });

    $("#zoomOut").click(function () {
        $image.cropper("zoom", -0.1);
    });

    $("#rotateLeft").click(function () {
        $image.cropper("rotate", 45);
    });

    $("#rotateRight").click(function () {
        $image.cropper("rotate", -45);
    });

    $("#setDrag").click(function () {
        $image.cropper("setDragMode", "crop");
    });
    $('#image_save').click(function() {
        var type = $image.attr('src').split(';')[0].split(':')[1];

        var canVas = $image.cropper("getCroppedCanvas", {});
        //将裁剪的图片加载到face_image
        // $('#face_image').attr('src', canVas.toDataURL());
        //        console.log(canVas.toDataURL());
        canVas.toBlob(function(blob) {
            var formData = new FormData();
            formData.append("shop_file", blob, fileName);
            // console.log(blob);

            $.ajax({
                type: "POST",
                url: '/misc/uploadFile?type=shop',
                data: formData,
                contentType: false, //必须
                processData: false, //必须
                dataType: "json",
                success: function(retJson){

                    layer.msg("上传成功",{
                        time:1000,
                        anim:0
                    },function () {
                        // $.closePopup("#avatar-modal");
                        // window.location.reload(true);

                    });

                    //清空上传文件的值
                    $('#avatarInput').val('');
                    //添加返回值的picture
                    var href='http://bossshangba.oss-cn-hangzhou.aliyuncs.com';
                    var len_href=href.length;
                    var picture_href=retJson.picture;
                    var picture_add=picture_href.substring(len_href);
                    $("#js-avatar").val(picture_add);
                    //上传成功
                    console.log('retJson:', retJson);
//                            console.log(formData);
                },
                error : function() {
                    //清空上传文件的值

                    $(_pageId + '#avatarInput').val('');
//                            console.log(formData);
                    layer.msg("错误");
                }
            });
        }, type);

    });
});