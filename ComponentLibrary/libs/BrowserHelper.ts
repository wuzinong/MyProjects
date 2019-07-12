
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
}

export default BrowserHelper;