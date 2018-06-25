$(function () {
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
    /*员工端登陆手机号验证*/
    $(".js-input-tel").on('focusout',function () {
        var this_val=$(this).val();
        if(checkMobile(this_val)===true){
            $(".js-tel-error").hide();
        }else if(this_val===''){
            $(".js-tel-error").hide();
        }else{
            $(".js-tel-error").show();
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
        settime($btn);
    });
});