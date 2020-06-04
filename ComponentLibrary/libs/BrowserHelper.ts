
class BrowserHelper{
    static bodyDom:any = document.body;
    constructor(){  
    }
    static fixScroll = (fixed:boolean)=>{
        if(fixed){
            BrowserHelper.bodyDom.style.overflow = "hidden";
        }else{
            BrowserHelper.bodyDom.style.overflow = "auto";
        }
    }
    static scroll(x:number=0 ,y:number=0){
        window.scrollTo(x,y);
    }
    static eleScroll(ele,x:number=0,y:number=0){
        if(ele.scrollTo){
            ele.scrollTo(x,y);
        }else{
            ele.scrollTop = 0;
        }
    }
    static scrollToElement(ele){
        if(ele.scrollIntoView){
            ele.scrollIntoView({
                behavior:"smooth"
            });
        }else{
            window.scrollTo(0,ele.offsetTop);
        }
    }
}

export default BrowserHelper;