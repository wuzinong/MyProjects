$(function () {


    /*todo 新增礼物*/
    $(".js-gift-add").on('click',function () {
       $("#gift-site").modal();
    });
    /*todo 修改礼物信息*/
    $(".table").on('click','.js-gift-site',function () {
        $("#gift-site").modal();
    });
    /*todo 修改奖品*/
    $(".table").on('click','.js-prize-site',function () {
        $("#prize-site").modal();
    });
    /*选择奖品，数量或金额变化*/
    /*$("body").on('change','.js-prize-select',function () {
        var this_val=$(this).val();
        if(this_val==="discount"){
            $(".js-prize-select_number").addClass("hidden");
            $(".js-prize-select_discount").removeClass("hidden");
            $(".js-prize-select_replace").addClass("hidden");
        }else if(this_val==="replace"){
            $(".js-prize-select_number").addClass("hidden");
            $(".js-prize-select_discount").addClass("hidden");
            $(".js-prize-select_replace").removeClass("hidden");
        }else{
            $(".js-prize-select_number").removeClass("hidden");
            $(".js-prize-select_discount").addClass("hidden");
            $(".js-prize-select_replace").addClass("hidden");
        }
    });*/



    /*验证手机号*/
    function checkMobile(s) {
        var regu = /^[1][0-9][0-9]{9}$/;
        var re = new RegExp(regu);
        if (re.test(s)) {
            return true;
        } else {
            return false;
        }
    }
    /*手机号输入框验证*/
    $(".js-input-tel").on('focusout',function () {
        var this_val=$(this).val();
        if(checkMobile(this_val)===true){

            $(".js-tel-error").removeClass("show").addClass("hide");
        }else if(this_val===''){
            $(".js-tel-error").removeClass("hide").addClass("show");
        }else{
            $(".js-tel-error").removeClass("hide").addClass("show");
        }
    });

    /*发送验证码倒计时*/
    var countdown=60;
    function settime(obj) {

        if (countdown == 0) {
            // obj.attr('disabled',false);
            obj.removeAttr("disabled")
                .removeClass('weui-btn_disabled')
                .text("获取验证码");
            countdown = 60;
            return;
        } else {
            obj.attr('disabled',true)
                .addClass('weui-btn_disabled')
                .text("重新发送(" + countdown + ")");
            countdown--;
        }
        setTimeout(function() {
                settime(obj) }
            ,1000)
    }
    $(".js-btn-get-code").on('click',function () {
        var $btn=$(this);
        var tel_val=$btn.closest(".form-group").find(".js-input-tel").val();
        if(checkMobile(tel_val)===true){
            settime($btn);
        }

    });

    /*选择技师等级*/
    $(".js-btns-grade").on('click','a.btn',function () {
        var this_val=$(this).text();
        var $input=$(this).closest(".row").find(".js-input-grade");
        $input.val(this_val);
    });

    /*合作商端商家管理*/
    $(".js-btns-toggle").hover(
        function () {
           var $img_wrap= $(this).find(".m-img-wrap");
           var $content_btns= $(this).find(".p-content-btns");
            $img_wrap.addClass("m-img-wrap--hover");
            $content_btns.removeClass("hide").addClass("show animated fadeIn");
        },
        function () {
            var $img_wrap= $(this).find(".m-img-wrap");
            var $content_btns= $(this).find(".p-content-btns");
            $img_wrap.removeClass("m-img-wrap--hover");
            $content_btns.addClass("hide").removeClass("show");
        }
    );

});