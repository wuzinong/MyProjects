$(function(){
    var out=$(".out")[0];
    var width=$(window).width();
    var height=$(window).height();
    $(window).resize(function(){
        var width=$(window).width();
        var height=$(window).height();
        $(".out").css({height:height});
        $(".out").css({width:width});
        $(".out").css({marginTop:-height*num});
        if(width>600){
            $(".col-s-hide").css({display:"block"})
            $(".left1").css({display:"block"});
            $(".hill2").css({display:"block"});
            $(".hill3").css({display:"block"});
            $(".co4").css({display:"block"});
        }else{
            $(".col-s-hide").css({display:"none"})
        }

    });
    $(window).resize();
    var num=0;
    var flag=true;
    touch.on('.out','swipeup',function(){
        if(!flag){
            return;
        }
        if(num==$(".out .box").length-1){
            return;
        }
        flag=false;
        $(".ll").eq(num-1).css({transform:" translate(-100px,0)"});
        $(".rr").eq(num-1).css({transform:" translate(100px,0)"});
        $(".ship").eq(num-1).css({transform: "translate(-50px,0)"});
        num++;
        $(".out").css({marginTop:-height*num});
        $(".btn div").css({background:"0,0,0,0"}).eq(num).css({background: "rgba(51,51,51,0.6)"});
    });
    touch.on('.out','swipedown',function(){
        if(num==0){
            return
        }
        if(!flag){
            return
        }

        flag=false;
        $(".ll").eq(num-1).css({transform:" translate(-100px,0)"});
        $(".rr").eq(num-1).css({transform:" translate(100px,0)"});
        $(".ship").eq(num-1).css({transform: "translate(-50px,0)"});
        num--;
        $(".out").css({marginTop:-height*num});
        $(".btn div").css({background:"0,0,0,0"}).eq(num).css({background: "rgba(51,51,51,0.6)"});
    });



        //谷歌  webkit而且字母大写   火狐moz  小写
    $(".out")[0].addEventListener("webkitTransitionEnd",function(){
        $(".ll").eq(num-1).css({transform:" translate(0,0)"});
        $(".rr").eq(num-1).css({transform:" translate(0,0)"});
        $(".ship").eq(num-1).css({transform: "translate(0,0)"});
        flag=true;
    });
    $(".out")[0].addEventListener("transitionend",function(){
        $(".ll").eq(num-1).css({transform:" translate(0,0)"});
        $(".rr").eq(num-1).css({transform:" translate(0,0)"});
        $(".ship").eq(num-1).css({transform: "translate(0,0)"});
        flag=true;
    });



    $(".btn div").click(function(){
        $(".ll").eq(num-1).css({transform:" translate(-100px,0)"});
        $(".rr").eq(num-1).css({transform:" translate(100px,0)"});
        $(".ship").eq(num-1).css({transform: "translate(-50px,0)"});
        var index=$(".btn div").index(this);
        num=index;
        $(".btn div").css({background:"0,0,0,0"}).eq(num).css({background: "rgba(51,51,51,0.6)"});
        $(".out").css({marginTop:-height*num})
    })


    //取消浏览器默认事件
    $(document).mousedown(function(e){
        e.preventDefault()
    });
    $(document).mousemove(function(e){
        e.preventDefault()
    })


//    header
    $(".coa").click(function(){
        $(".col-s-hide").finish();
        $(".col-s-hide").fadeToggle();
        $(".left1").css({display:"none"});
        $(".hill2").css({display:"none"});
        $(".hill3").css({display:"none"});
        $(".co4").css({display:"none"});
    })
    var num1=1;
    $(".x_btn").click(function(){
        num++;
        $(".out").css({marginTop:-height*num1});
        if(num1==3){
            $(".x_btn").css({display:"none"})
        }
    })




    $.prototype.extend({
        mouseWheel:function(upfun,downfun){
            this.each(function(index,obj){
                if(obj.addEventListener){
                    obj.addEventListener("mousewheel",fun,false);//火狐
                    obj.addEventListener("DOMMouseScroll",fun,false);//谷歌
                }else{
                    obj.attachEvent("onmousewheel",fun);
                }
                function fun(e){
                    var ev=e||event;
                    if(ev.detail==-3||ev.wheelDelta==120){//wheelDelta在IE  向上滚
                        if(upfun){
                            upfun.call(obj,ev);
                        }
                    }else if(ev.detail==3||ev.wheelDelta==-120){
                        if(downfun){
                            downfun.call(obj,ev);
                        }
                    }
                    if(ev.preventDefault){
                        ev.preventDefault(); //阻止默认浏览器动作(W3C)
                    }else{
                        ev.returnValue = false;//IE中阻止函数器默认动作的方式
                    }
                }
            })
            return this;
        }
    });




    $(window).mouseWheel(function(){
        if(num==0){
            return
        }
        if(!flag){
            return
        }

        flag=false;
        $(".ll").eq(num-1).css({transform:" translate(-100px,0)"});
        $(".rr").eq(num-1).css({transform:" translate(100px,0)"});
        $(".ship").eq(num-1).css({transform: "translate(-50px,0)"});
        num--;
        $(".out").css({marginTop:-height*num});
        $(".btn div").css({background:"0,0,0,0"}).eq(num).css({background: "rgba(51,51,51,0.6)"});

    },function(){
        if(!flag){
            return;
        }
        if(num==$(".out .box").length-1){
            return;
        }
        flag=false;
        $(".ll").eq(num-1).css({transform:" translate(-100px,0)"});
        $(".rr").eq(num-1).css({transform:" translate(100px,0)"});
        $(".ship").eq(num-1).css({transform: "translate(-50px,0)"});
        num++;
        $(".out").css({marginTop:-height*num});
        $(".btn div").css({background:"0,0,0,0"}).eq(num).css({background: "rgba(51,51,51,0.6)"});
    });
});