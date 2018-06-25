$(document).ready(function(){
    /*输入框焦点切换*/
    $(".js-login-form").on('click','input',function () {
        $(this).focus();
    });
    $(document).click(function (e) {
        var $click = $(".js-login-form"),
            $click_children = $click[0],
            target = e.target;
        if ($click_children !== target && !$.contains($click_children, target)) {
//                console.log();
            $click.find("input").blur();
        }
    });
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
        var $this_form_group=$(this).closest(".form-group");
        if(checkMobile(this_val)===true){
            $this_form_group.removeClass("has-error");
            $(".js-tel-error").removeClass("show").addClass("hide");
        }else if(this_val===''){
            $this_form_group.removeClass("has-error");
            $(".js-tel-error").removeClass("show").addClass("hide");
        }else{
            $this_form_group.addClass("has-error");
            $(".js-tel-error").removeClass("hide").addClass("show");
        }
    });
    /*$(".js-password").on('focusout',function () {
        var this_val=$(this).val();
        var $this_form_group=$(this).closest(".form-group");
        if(this_val===''){
            $this_form_group.addClass("has-error");
            $(".js-password").removeClass("hide").addClass("show");
        }
    });*/

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
});